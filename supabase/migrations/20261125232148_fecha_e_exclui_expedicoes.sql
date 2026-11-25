begin;

-- A turma continua encerrada mesmo depois da exclusão dos resultados.
create table public.miracast_closed_classes (
  turma_id uuid primary key references public.turmas (id) on delete cascade,
  closed_at timestamptz not null
);

alter table public.miracast_closed_classes enable row level security;
revoke all on public.miracast_closed_classes from public, anon, authenticated;
grant select on public.miracast_closed_classes to authenticated;

create policy miracast_closed_class_teacher_select on public.miracast_closed_classes
  for select to authenticated
  using (exists (
    select 1 from public.turmas t
    where t.id = miracast_closed_classes.turma_id and t.professor_id = (select auth.uid())
  ));

-- Preserve as rodadas que já estavam em curso ou com alunos na sala de espera.
insert into public.miracast_closed_classes (turma_id, closed_at)
select h.turma_id, max(h.ended_at)
from public.miracast_expedition_history h
where not exists (select 1 from public.miracast_expeditions x where x.turma_id = h.turma_id)
  and not exists (select 1 from public.miracast_enrollments e where e.turma_id = h.turma_id)
group by h.turma_id;

grant delete on public.miracast_expedition_history to authenticated;

create policy miracast_history_teacher_delete on public.miracast_expedition_history
  for delete to authenticated
  using (exists (
    select 1 from public.turmas t
    where t.id = miracast_expedition_history.turma_id and t.professor_id = (select auth.uid())
  ) and ((select auth.jwt()) ->> 'is_anonymous') = 'false');

-- O mesmo bloqueio serializa o início, inclusive via API antiga, e o encerramento.
create function miracast_private.prevent_closed_class_start()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  teacher uuid := auth.uid();
begin
  perform 1 from public.turmas t
    where t.id = new.turma_id and (teacher is null or t.professor_id = teacher)
    for update;

  if found and exists (select 1 from public.miracast_closed_classes c where c.turma_id = new.turma_id) then
    raise exception 'Esta turma já encerrou a expedição. Crie outra turma para uma nova aplicação.';
  end if;
  return new;
end;
$$;

revoke execute on function miracast_private.prevent_closed_class_start() from public, anon, authenticated;

create trigger miracast_prevent_closed_class_start
  before insert on public.miracast_expeditions
  for each row execute function miracast_private.prevent_closed_class_start();

create or replace function miracast_private.manage_class(room_code text, action text, expected_start timestamptz)
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
  finished_at timestamptz;
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

  finished_at := clock_timestamp();
  insert into public.miracast_expedition_history (turma_id, started_at, ended_at)
    values (target_class, actual_start, finished_at) returning id into history_id;
  insert into public.miracast_archived_enrollments (expedition_id, student_id, name, step, answers)
    select history_id, student_id, name, step, answers
    from public.miracast_enrollments where turma_id = target_class;
  delete from public.miracast_enrollments where turma_id = target_class;
  delete from public.miracast_expeditions where turma_id = target_class;
  insert into public.miracast_closed_classes (turma_id, closed_at) values (target_class, finished_at);
end;
$$;

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

  if exists (select 1 from public.miracast_closed_classes c where c.turma_id = target_class) then
    raise exception 'A expedição desta turma foi encerrada. Peça ao professor um novo código.';
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
