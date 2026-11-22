-- Execute em uma base de teste após aplicar a migração.
begin;

insert into auth.users (id) values
  ('11111111-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000002'),
  ('11111111-0000-0000-0000-000000000003'),
  ('11111111-0000-0000-0000-000000000004'),
  ('11111111-0000-0000-0000-000000000005');
insert into public.miracast_teachers (id) values
  ('11111111-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000002');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000001","is_anonymous":false}', true);
insert into public.miracast_rooms (code, name) values ('QAX234', 'Turma A');

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000002","is_anonymous":false}', true);
insert into public.miracast_rooms (code, name) values ('QBY345', 'Turma B');

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_join_room(' qax234 ', 'Ana');
select public.miracast_join_room('QAX234', 'Ana');

do $$
begin
  if exists (select 1 from public.miracast_rooms) or exists (select 1 from public.miracast_participants) then
    raise exception 'Aluno recebeu acesso às tabelas de turmas ou participantes';
  end if;
  if public.miracast_student_state() #>> '{participant,name}' is distinct from 'Ana' then
    raise exception 'Aluno não recebeu a sua própria participação';
  end if;
  begin
    perform public.miracast_advance('motivation');
    raise exception 'Aluno avançou antes do início';
  exception when raise_exception then
    if sqlerrm <> 'Aguarde o início da expedição.' then raise; end if;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000004","is_anonymous":true}', true);
select public.miracast_join_room('QBY345', 'Bruno');

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000001","is_anonymous":false}', true);
do $$
begin
  if (select array_agg(code) from public.miracast_rooms) is distinct from array['QAX234'] then
    raise exception 'As turmas retornadas não correspondem ao professor A';
  end if;
  if (select array_agg(name) from public.miracast_participants) is distinct from array['Ana'] then
    raise exception 'Os alunos retornados não correspondem ao professor A';
  end if;
  update public.miracast_rooms set started = true where code = 'QBY345';
  if found then raise exception 'O professor A alterou uma turma de outra conta'; end if;
end;
$$;
update public.miracast_rooms set started = true where code = 'QAX234';

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000002","is_anonymous":false}', true);
do $$
begin
  if (select array_agg(code) from public.miracast_rooms) is distinct from array['QBY345']
    or (select array_agg(name) from public.miracast_participants) is distinct from array['Bruno'] then
    raise exception 'As turmas ou os alunos retornados não correspondem ao professor B';
  end if;
  if public.miracast_student_state() is not null then
    raise exception 'A consulta do aluno devolveu dados para outro perfil';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000005","is_anonymous":false}', true);
do $$
begin
  if exists (select 1 from public.miracast_teachers) or exists (select 1 from public.miracast_rooms) then
    raise exception 'Conta sem autorização recebeu dados do professor';
  end if;
  begin
    insert into public.miracast_rooms (code, name) values ('QCZ456', 'Turma sem professor');
    raise exception 'Conta sem autorização criou uma turma';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"11111111-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_advance('motivation');
select public.miracast_advance('classification', '{"value":"fora de ordem"}');
select public.miracast_advance('protocol', '{"value":"Protocolo consultado"}');
select public.miracast_advance('protocol', '{"value":"Envio repetido"}');
do $$
declare
  snapshot jsonb := public.miracast_student_state();
begin
  if snapshot #>> '{participant,step}' is distinct from 'classification'
    or snapshot #>> '{participant,answers,protocol,value}' is distinct from 'Protocolo consultado'
    or snapshot #> '{participant,answers,classification}' is not null then
    raise exception 'O avanço não preservou a sequência ou a primeira resposta';
  end if;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform public.miracast_student_state();
    raise exception 'A consulta de participação aceitou um visitante sem sessão';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
