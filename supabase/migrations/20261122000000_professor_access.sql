begin;

create table public.miracast_teachers (
  id uuid primary key references auth.users (id) on delete cascade
);

create table public.miracast_rooms (
  code text primary key check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  owner_id uuid not null default auth.uid() references auth.users (id),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  started boolean not null default false
);

create index miracast_rooms_owner_idx on public.miracast_rooms (owner_id);

create table public.miracast_participants (
  id uuid primary key references auth.users (id) on delete cascade,
  "roomCode" text not null references public.miracast_rooms (code) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  step text not null default 'motivation',
  answers jsonb not null default '{}'::jsonb
);

create index miracast_participants_room_idx on public.miracast_participants ("roomCode");

alter table public.miracast_teachers enable row level security;
alter table public.miracast_rooms enable row level security;
alter table public.miracast_participants enable row level security;

revoke all on public.miracast_teachers, public.miracast_rooms, public.miracast_participants
  from public, anon, authenticated;
grant select on public.miracast_teachers, public.miracast_rooms, public.miracast_participants to authenticated;
grant insert (code, name), update (started) on public.miracast_rooms to authenticated;

create policy miracast_teacher_own_permission on public.miracast_teachers
  for select to authenticated
  using (
    id = (select auth.uid())
    and (select auth.jwt() ->> 'is_anonymous') = 'false'
  );

create policy miracast_teacher_read_rooms on public.miracast_rooms
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (select 1 from public.miracast_teachers)
  );

create policy miracast_teacher_create_room on public.miracast_rooms
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and not started
    and exists (select 1 from public.miracast_teachers)
  );

create policy miracast_teacher_start_room on public.miracast_rooms
  for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (select 1 from public.miracast_teachers)
  )
  with check (
    owner_id = (select auth.uid())
    and started
    and exists (select 1 from public.miracast_teachers)
  );

create policy miracast_teacher_read_participants on public.miracast_participants
  for select to authenticated
  using (
    exists (
      select 1 from public.miracast_rooms
      where code = "roomCode" and owner_id = (select auth.uid())
    )
  );

create function public.miracast_join_room(room_code text, student_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_id uuid := auth.uid();
  normalized_code text := upper(btrim(room_code));
  enrolled_code text;
begin
  if student_id is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'true' then
    raise exception 'Entre pelo perfil de aluno.';
  end if;

  if student_name is null or char_length(btrim(student_name)) not between 1 and 100 then
    raise exception 'Informe um nome de até 100 caracteres.';
  end if;

  if not exists (select 1 from public.miracast_rooms where code = normalized_code) then
    raise exception 'Sala não encontrada. Confira o código com o professor.';
  end if;

  insert into public.miracast_participants (id, "roomCode", name)
  values (student_id, normalized_code, btrim(student_name))
  on conflict (id) do nothing;

  select "roomCode" into enrolled_code from public.miracast_participants where id = student_id;
  if enrolled_code <> normalized_code then
    raise exception 'Já existe uma inscrição nesta aba. Saia da sessão para trocar de sala.';
  end if;
end;
$$;

create function public.miracast_student_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'room', jsonb_build_object('code', room.code, 'name', room.name, 'started', room.started),
    'participant', to_jsonb(student),
    'participantCount', (
      select count(*) from public.miracast_participants where "roomCode" = room.code
    )
  )
  from public.miracast_participants as student
  join public.miracast_rooms as room on room.code = student."roomCode"
  where student.id = auth.uid() and auth.jwt() ->> 'is_anonymous' = 'true'
$$;

create function public.miracast_advance(expected_step text, answer jsonb default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_id uuid := auth.uid();
  student public.miracast_participants;
  steps constant text[] := array[
    'motivation', 'protocol', 'classification', 'rotation-identity', 'axis-rotation', 'qv1',
    'qv1b', 'build-molecule', 'repeat-ligand', 'identify-chiral', 'qv2', 'superposition',
    'explain-chirality', 'active-form', 'qv3', 'lactic-acid', 'compare-forms', 'qv4',
    'augmented-reality', 'qv5', 'master'
  ];
  next_step text;
begin
  if student_id is null or (auth.jwt() ->> 'is_anonymous') is distinct from 'true' then
    raise exception 'Entre pelo perfil de aluno.';
  end if;

  select * into student from public.miracast_participants where id = student_id for update;
  if not found or not exists (
    select 1 from public.miracast_rooms where code = student."roomCode" and started
  ) then
    raise exception 'Aguarde o início da expedição.';
  end if;

  if student.step is distinct from expected_step then
    return;
  end if;
  next_step := steps[array_position(steps, student.step) + 1];
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

  update public.miracast_participants
  set step = next_step,
      answers = case when answer is null then answers else answers || jsonb_build_object(expected_step, answer) end
  where id = student_id;
end;
$$;

revoke execute on function public.miracast_join_room(text, text), public.miracast_student_state(),
  public.miracast_advance(text, jsonb) from public, anon, authenticated;
grant execute on function public.miracast_join_room(text, text), public.miracast_student_state(),
  public.miracast_advance(text, jsonb) to authenticated;

commit;
