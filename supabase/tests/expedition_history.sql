-- Execute com as migrações e as tabelas profiles e turmas em uma base de teste.
begin;

insert into auth.users (id, is_anonymous) values
  ('30400000-0000-0000-0000-000000000001', false),
  ('30400000-0000-0000-0000-000000000002', false),
  ('30400000-0000-0000-0000-000000000003', true),
  ('30400000-0000-0000-0000-000000000004', true),
  ('30400000-0000-0000-0000-000000000005', true),
  ('30400000-0000-0000-0000-000000000006', true);

insert into public.turmas (id, professor_id, codigo, nome) values
  ('30500000-0000-0000-0000-000000000001', '30400000-0000-0000-0000-000000000001', 'ABCDE00001', 'Histórico A'),
  ('30500000-0000-0000-0000-000000000002', '30400000-0000-0000-0000-000000000002', 'ABCDE00002', 'Histórico B');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_join_class('ABCDE00001', 'Ana');
do $$
declare
  old_code text := public.miracast_issue_class_resume_code();
  code text := public.miracast_issue_class_resume_code();
begin
  if code !~ '^[0-9a-f]{32}$' or code = old_code then raise exception 'O código deveria ser individual e renovável'; end if;
  perform set_config('miracast.test.resume_code', code, true);
  begin
    perform public.miracast_resume_class(old_code);
    raise exception 'O código substituído continuou ativo';
  exception when raise_exception then
    if sqlerrm not like 'Sai%participação atual%' then raise; end if;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000002","is_anonymous":false}', true);
do $$
begin
  begin
    perform public.miracast_manage_class('ABCDE00001', 'start');
    raise exception 'Uma conta iniciou a turma de outra';
  exception when raise_exception then
    if sqlerrm <> 'Turma não encontrada.' then raise; end if;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000001","is_anonymous":false}', true);
select public.miracast_manage_class('ABCDE00001', 'start');
select set_config('miracast.test.started_at', started_at::text, true) from public.miracast_expeditions;
select public.miracast_manage_class('ABCDE00001', 'start');

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_advance_class('motivation');
select public.miracast_advance_class('protocol', '{"value":"Resposta preservada"}');

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000004","is_anonymous":true}', true);
select public.miracast_resume_class(current_setting('miracast.test.resume_code'));
do $$
declare
  snapshot jsonb := public.miracast_class_student_state();
begin
  if snapshot #>> '{participant,name}' is distinct from 'Ana'
    or snapshot #>> '{participant,step}' is distinct from 'classification'
    or snapshot #>> '{participant,answers,protocol,value}' is distinct from 'Resposta preservada'
    or snapshot ->> 'participantCount' is distinct from '1' then
    raise exception 'A retomada deveria preservar nome, etapa e resposta';
  end if;
end;
$$;
select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
do $$
begin
  if public.miracast_class_student_state() is not null then
    raise exception 'A sessão anterior manteve acesso à participação transferida';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000001","is_anonymous":false}', true);
select public.miracast_manage_class('ABCDE00001', 'end', current_setting('miracast.test.started_at')::timestamptz);
select public.miracast_manage_class('ABCDE00001', 'end', current_setting('miracast.test.started_at')::timestamptz);

do $$
begin
  if exists (select 1 from public.miracast_expeditions)
    or exists (select 1 from public.miracast_enrollments)
    or (select count(*) from public.miracast_expedition_history) <> 1
    or (select answers #>> '{protocol,value}' from public.miracast_archived_enrollments) is distinct from 'Resposta preservada' then
    raise exception 'O encerramento deveria abrir espaço para outra expedição e preservar o histórico';
  end if;
  begin
    perform resume_code_hash from public.miracast_archived_enrollments;
    raise exception 'O painel do professor recebeu os hashes de retomada';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000002","is_anonymous":false}', true);
do $$
begin
  if exists (select 1 from public.miracast_expedition_history)
    or exists (select 1 from public.miracast_archived_enrollments) then
    raise exception 'O histórico apareceu para professor de outra turma';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000005","is_anonymous":true}', true);
select public.miracast_join_class('ABCDE00001', 'Rita');
do $$
begin
  if public.miracast_class_student_state() #>> '{room,started}' is distinct from 'false' then
    raise exception 'O novo aluno deveria aguardar o início da próxima expedição';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000006","is_anonymous":true}', true);
select public.miracast_resume_class(current_setting('miracast.test.resume_code'));
do $$
begin
  if public.miracast_class_student_state() ->> 'ended' is distinct from 'true'
    or public.miracast_class_student_state() #>> '{participant,name}' is distinct from 'Ana' then
    raise exception 'A retomada de uma expedição encerrada deveria abrir o resultado anterior';
  end if;
end;
$$;

rollback;
