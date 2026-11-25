begin;

create table public.miracast_expedition_history (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null
);

create index miracast_expedition_history_turma_idx
  on public.miracast_expedition_history (turma_id, ended_at desc);

create table public.miracast_archived_enrollments (
  expedition_id uuid not null references public.miracast_expedition_history (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  step text not null,
  answers jsonb not null,
  resume_code_hash bytea unique,
  primary key (expedition_id, student_id)
);

create index miracast_archived_enrollments_student_idx
  on public.miracast_archived_enrollments (student_id);

alter table public.miracast_enrollments add column resume_code_hash bytea unique;
alter table public.miracast_expedition_history enable row level security;
alter table public.miracast_archived_enrollments enable row level security;

revoke all on public.miracast_expedition_history, public.miracast_archived_enrollments from public, anon, authenticated;
revoke select on public.miracast_enrollments from public, anon, authenticated;
grant select (student_id, turma_id, name, step, answers) on public.miracast_enrollments to authenticated;
grant select on public.miracast_expedition_history to authenticated;
grant select (expedition_id, student_id, name, step, answers) on public.miracast_archived_enrollments to authenticated;

create policy miracast_history_teacher_select on public.miracast_expedition_history
  for select to authenticated
  using (exists (
    select 1 from public.turmas t where t.id = turma_id and t.professor_id = (select auth.uid())
  ));

create policy miracast_archive_teacher_select on public.miracast_archived_enrollments
  for select to authenticated
  using (exists (
    select 1 from public.miracast_expedition_history h where h.id = expedition_id
  ));

create function miracast_private.manage_class(room_code text, action text, expected_start timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  teacher uuid := auth.uid();
  target_class uuid;
  actual_start timestamptz;
  history_id uuid;
begin
  if teacher is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'false' then
    raise exception 'Entre pelo perfil de professor.';
  end if;

  select t.id into target_class from public.turmas t
    where t.codigo = upper(btrim(room_code)) and t.professor_id = teacher
    for update;
  if target_class is null then raise exception 'Turma não encontrada.'; end if;

  if action = 'start' then
    insert into public.miracast_expeditions (turma_id) values (target_class) on conflict do nothing;
    return;
  end if;
  if action is distinct from 'end' then raise exception 'Ação de expedição inválida.'; end if;

  select started_at into actual_start from public.miracast_expeditions where turma_id = target_class;
  if actual_start is null or actual_start is distinct from expected_start then return; end if;

  -- Aguarde envios em andamento antes de copiar as respostas.
  perform 1 from public.miracast_enrollments where turma_id = target_class for update;

  insert into public.miracast_expedition_history (turma_id, started_at, ended_at)
    values (target_class, actual_start, clock_timestamp()) returning id into history_id;
  insert into public.miracast_archived_enrollments (expedition_id, student_id, name, step, answers, resume_code_hash)
    select history_id, student_id, name, step, answers, resume_code_hash
    from public.miracast_enrollments where turma_id = target_class;
  delete from public.miracast_enrollments where turma_id = target_class;
  delete from public.miracast_expeditions where turma_id = target_class;
end;
$$;

create function miracast_private.issue_class_resume_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := auth.uid();
  personal_code text := replace(gen_random_uuid()::text, '-', '');
  code_hash bytea := sha256(convert_to(personal_code, 'UTF8'));
begin
  if student is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'true' then
    raise exception 'Entre pelo perfil de aluno.';
  end if;
  update public.miracast_enrollments set resume_code_hash = code_hash where student_id = student;
  if not found then
    update public.miracast_archived_enrollments set resume_code_hash = code_hash
      where expedition_id = (
        select a.expedition_id from public.miracast_archived_enrollments a
        join public.miracast_expedition_history h on h.id = a.expedition_id
        where a.student_id = student order by h.ended_at desc limit 1
      ) and student_id = student;
  end if;
  if not found then raise exception 'Sua participação não foi localizada.'; end if;
  return personal_code;
end;
$$;

create function miracast_private.resume_class(personal_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := auth.uid();
  normalized_code text := lower(btrim(personal_code));
  code_hash bytea;
begin
  if student is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'true' then
    raise exception 'Entre pelo perfil de aluno.';
  end if;
  if normalized_code is null or normalized_code !~ '^[0-9a-f]{32}$' then
    raise exception 'Confira o código de retomada.';
  end if;
  code_hash := sha256(convert_to(normalized_code, 'UTF8'));

  if exists (select 1 from public.miracast_enrollments
      where student_id = student and resume_code_hash is distinct from code_hash) then
    raise exception 'Saia da participação atual antes de retomar outra.';
  end if;

  update public.miracast_enrollments set student_id = student where resume_code_hash = code_hash;
  if found then return; end if;

  if exists (select 1 from public.miracast_archived_enrollments
      where student_id = student and resume_code_hash is distinct from code_hash) then
    raise exception 'Saia da participação atual antes de retomar outra.';
  end if;

  update public.miracast_archived_enrollments set student_id = student where resume_code_hash = code_hash;
  if not found then raise exception 'Código de retomada inválido. Confira o código e tente novamente.'; end if;
end;
$$;

create or replace function miracast_private.class_student_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when auth.jwt() ->> 'is_anonymous' = 'true' then coalesce(
    (
      select jsonb_build_object(
        'room', jsonb_build_object('code', t.codigo, 'name', t.nome, 'started', x.turma_id is not null),
        'participant', jsonb_build_object('id', e.student_id, 'roomCode', t.codigo, 'name', e.name, 'step', e.step, 'answers', e.answers),
        'participantCount', (select count(*) from public.miracast_enrollments other where other.turma_id = e.turma_id)
      )
      from public.miracast_enrollments e
      join public.turmas t on t.id = e.turma_id
      left join public.miracast_expeditions x on x.turma_id = e.turma_id
      where e.student_id = auth.uid()
    ),
    (
      select jsonb_build_object(
        'room', jsonb_build_object('code', t.codigo, 'name', t.nome, 'started', true),
        'participant', jsonb_build_object('id', e.student_id, 'roomCode', t.codigo, 'name', e.name, 'step', e.step, 'answers', e.answers),
        'participantCount', 0,
        'ended', true
      )
      from public.miracast_archived_enrollments e
      join public.miracast_expedition_history h on h.id = e.expedition_id
      join public.turmas t on t.id = h.turma_id
      where e.student_id = auth.uid()
      order by h.ended_at desc limit 1
    )
  ) end;
$$;

create function public.miracast_manage_class(room_code text, action text, expected_start timestamptz default null)
returns void language sql set search_path = ''
as $$ select miracast_private.manage_class(room_code, action, expected_start); $$;

create function public.miracast_issue_class_resume_code()
returns text language sql set search_path = ''
as $$ select miracast_private.issue_class_resume_code(); $$;

create function public.miracast_resume_class(personal_code text)
returns void language sql set search_path = ''
as $$ select miracast_private.resume_class(personal_code); $$;

revoke execute on function
  miracast_private.manage_class(text, text, timestamptz), public.miracast_manage_class(text, text, timestamptz),
  miracast_private.issue_class_resume_code(), public.miracast_issue_class_resume_code(),
  miracast_private.resume_class(text), public.miracast_resume_class(text)
from public, anon, authenticated;

grant execute on function
  miracast_private.manage_class(text, text, timestamptz), public.miracast_manage_class(text, text, timestamptz),
  miracast_private.issue_class_resume_code(), public.miracast_issue_class_resume_code(),
  miracast_private.resume_class(text), public.miracast_resume_class(text)
to authenticated;

create or replace function miracast_private.join_class(room_code text, student_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := auth.uid();
  target_class uuid;
  enrolled_class uuid;
begin
  if student is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'true' then
    raise exception 'Entre pelo perfil de aluno.';
  end if;

  if student_name is null or char_length(btrim(student_name)) not between 1 and 100 then
    raise exception 'Informe um nome de até 100 caracteres.';
  end if;

  select t.id into target_class
  from public.turmas t
  where t.codigo = upper(btrim(room_code))
  for update;
  if target_class is null then
    raise exception 'Turma não encontrada. Confira o código com o professor.';
  end if;

  insert into public.miracast_enrollments (student_id, turma_id, name)
  values (student, target_class, btrim(student_name))
  on conflict (student_id) do nothing;

  select e.turma_id into enrolled_class
  from public.miracast_enrollments e
  where e.student_id = student;
  if enrolled_class is distinct from target_class then
    raise exception 'Já existe uma inscrição nesta aba. Saia da sessão para trocar de turma.';
  end if;
end;
$$;

commit;
