begin;

create schema miracast_private;
revoke all on schema miracast_private from public, anon, authenticated;
grant usage on schema miracast_private to authenticated;

create table public.miracast_expeditions (
  turma_id uuid primary key references public.turmas (id) on delete cascade,
  started_at timestamptz not null default now()
);

create table public.miracast_enrollments (
  student_id uuid primary key references auth.users (id) on delete cascade,
  turma_id uuid not null references public.turmas (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  step text not null default 'motivation',
  answers jsonb not null default '{}'::jsonb
);

create index miracast_enrollments_turma_idx on public.miracast_enrollments (turma_id);

alter table public.miracast_expeditions enable row level security;
alter table public.miracast_enrollments enable row level security;

revoke all on public.miracast_expeditions, public.miracast_enrollments from public, anon, authenticated;
grant select on public.miracast_expeditions, public.miracast_enrollments to authenticated;
grant insert (turma_id) on public.miracast_expeditions to authenticated;

-- As consultas a turmas seguem as políticas existentes de professor e proprietário.
create policy miracast_expedition_teacher_select on public.miracast_expeditions
  for select to authenticated
  using (exists (
    select 1 from public.turmas t where t.id = turma_id and t.professor_id = (select auth.uid())
  ));

create policy miracast_expedition_teacher_start on public.miracast_expeditions
  for insert to authenticated
  with check (exists (
    select 1 from public.turmas t where t.id = turma_id and t.professor_id = (select auth.uid())
  ));

create policy miracast_enrollment_teacher_select on public.miracast_enrollments
  for select to authenticated
  using (exists (
    select 1 from public.turmas t where t.id = turma_id and t.professor_id = (select auth.uid())
  ));

-- Os alunos usam identidade anônima e só consultam sua própria participação pela API.
create function miracast_private.join_class(room_code text, student_name text)
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
  where t.codigo = upper(btrim(room_code));
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

create function miracast_private.class_student_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'room', jsonb_build_object(
      'code', t.codigo, 'name', t.nome, 'started', expedition.turma_id is not null
    ),
    'participant', jsonb_build_object(
      'id', e.student_id, 'roomCode', t.codigo, 'name', e.name, 'step', e.step, 'answers', e.answers
    ),
    'participantCount', (
      select count(*) from public.miracast_enrollments other where other.turma_id = e.turma_id
    )
  )
  from public.miracast_enrollments e
  join public.turmas t on t.id = e.turma_id
  left join public.miracast_expeditions expedition on expedition.turma_id = t.id
  where e.student_id = auth.uid() and auth.jwt() ->> 'is_anonymous' = 'true';
$$;

create function miracast_private.advance_class(expected_step text, answer jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := auth.uid();
  enrollment public.miracast_enrollments;
  steps constant text[] := array[
    'motivation', 'protocol', 'classification', 'rotation-identity', 'axis-rotation', 'qv1',
    'qv1b', 'build-molecule', 'repeat-ligand', 'identify-chiral', 'qv2', 'superposition',
    'explain-chirality', 'active-form', 'qv3', 'lactic-acid', 'compare-forms', 'qv4',
    'augmented-reality', 'qv5', 'master'
  ];
  next_step text;
begin
  if student is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'true' then
    raise exception 'Entre pelo perfil de aluno.';
  end if;

  select * into enrollment from public.miracast_enrollments where student_id = student for update;
  if not found or not exists (
    select 1 from public.miracast_expeditions where turma_id = enrollment.turma_id
  ) then
    raise exception 'Aguarde o início da expedição.';
  end if;

  if enrollment.step is distinct from expected_step then
    return;
  end if;
  next_step := steps[array_position(steps, enrollment.step) + 1];
  if next_step is null then
    return;
  end if;

  if answer is not null and (
    jsonb_typeof(answer) is distinct from 'object'
    or jsonb_typeof(answer -> 'value') is distinct from 'string'
    or char_length(answer ->> 'value') > 2000
    or (answer ? 'correct' and jsonb_typeof(answer -> 'correct') is distinct from 'boolean')
  ) then
    raise exception 'Resposta inválida.';
  end if;

  update public.miracast_enrollments
  set step = next_step,
      answers = case when answer is null then answers
        else answers || jsonb_build_object(expected_step, jsonb_strip_nulls(
          jsonb_build_object('value', answer -> 'value', 'correct', answer -> 'correct')
        ))
      end
  where student_id = student;
end;
$$;

create function public.miracast_join_class(room_code text, student_name text)
returns void
language sql
set search_path = ''
as $$ select miracast_private.join_class(room_code, student_name); $$;

create function public.miracast_class_student_state()
returns jsonb
language sql
stable
set search_path = ''
as $$ select miracast_private.class_student_state(); $$;

create function public.miracast_advance_class(expected_step text, answer jsonb default null)
returns void
language sql
set search_path = ''
as $$ select miracast_private.advance_class(expected_step, answer); $$;

revoke execute on function
  miracast_private.join_class(text, text), miracast_private.class_student_state(),
  miracast_private.advance_class(text, jsonb), public.miracast_join_class(text, text),
  public.miracast_class_student_state(), public.miracast_advance_class(text, jsonb)
from public, anon, authenticated;

grant execute on function
  miracast_private.join_class(text, text), miracast_private.class_student_state(),
  miracast_private.advance_class(text, jsonb), public.miracast_join_class(text, text),
  public.miracast_class_student_state(), public.miracast_advance_class(text, jsonb)
to authenticated;

commit;
