-- Execute com as migrações e as tabelas profiles e turmas em uma base de teste.
begin;

insert into auth.users (id, is_anonymous) values
  ('30400000-0000-0000-0000-000000000001', false),
  ('30400000-0000-0000-0000-000000000002', false),
  ('30400000-0000-0000-0000-000000000003', true),
  ('30400000-0000-0000-0000-000000000004', true),
  ('30400000-0000-0000-0000-000000000005', true);

insert into public.turmas (id, professor_id, codigo, nome) values
  ('30500000-0000-0000-0000-000000000001', '30400000-0000-0000-0000-000000000001', 'ABCDE00001', 'Histórico A'),
  ('30500000-0000-0000-0000-000000000002', '30400000-0000-0000-0000-000000000002', 'ABCDE00002', 'Histórico B'),
  ('30500000-0000-0000-0000-000000000003', '30400000-0000-0000-0000-000000000001', 'ABCDE00003', 'Nova turma A');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_join_class('ABCDE00001', 'Ana');
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

do $$
begin
  delete from public.miracast_expedition_history where turma_id = '30500000-0000-0000-0000-000000000001';
  if found or not exists (select 1 from public.miracast_expeditions) then
    raise exception 'Uma expedição ativa não pode ser excluída pelo histórico';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_advance_class('motivation');
select public.miracast_advance_class('protocol', '{"value":"Resposta preservada"}');

do $$
declare
  snapshot jsonb := public.miracast_class_student_state();
begin
  if snapshot #>> '{participant,name}' is distinct from 'Ana'
    or snapshot #>> '{participant,step}' is distinct from 'classification'
    or snapshot #>> '{participant,answers,protocol,value}' is distinct from 'Resposta preservada'
    or snapshot ->> 'participantCount' is distinct from '1' then
    raise exception 'A participação deveria preservar nome, etapa e resposta';
  end if;
end;
$$;
select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000004","is_anonymous":true}', true);
do $$
begin
  if public.miracast_class_student_state() is not null then
    raise exception 'Uma sessão recebeu a participação de outro aluno';
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
    or (select count(*) from public.miracast_closed_classes) <> 1
    or (select count(*) from public.miracast_expedition_history) <> 1
    or (select answers #>> '{protocol,value}' from public.miracast_archived_enrollments) is distinct from 'Resposta preservada' then
    raise exception 'O encerramento deveria bloquear a turma e preservar o histórico';
  end if;
end;
$$;

select set_config('miracast.test.history_id', id::text, true) from public.miracast_expedition_history;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000002","is_anonymous":false}', true);
do $$
begin
  if exists (select 1 from public.miracast_expedition_history)
    or exists (select 1 from public.miracast_archived_enrollments)
    or exists (select 1 from public.miracast_closed_classes) then
    raise exception 'O histórico apareceu para professor de outra turma';
  end if;
  delete from public.miracast_expedition_history where id = current_setting('miracast.test.history_id')::uuid;
  if found then raise exception 'Professor de outra turma excluiu a expedição'; end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000005","is_anonymous":true}', true);
do $$
begin
  begin
    perform public.miracast_join_class('ABCDE00001', 'Rita');
    raise exception 'A turma encerrada aceitou um ingresso';
  exception when raise_exception then
    if sqlerrm <> 'A expedição desta turma foi encerrada. Peça ao professor um novo código.' then raise; end if;
  end;

  delete from public.miracast_expedition_history where id = current_setting('miracast.test.history_id')::uuid;
  if found then raise exception 'Aluno excluiu a expedição'; end if;
end;
$$;

select public.miracast_join_class('ABCDE00003', 'Rita');
do $$
begin
  if public.miracast_class_student_state() #>> '{room,started}' is distinct from 'false'
    or public.miracast_class_student_state() #>> '{room,code}' is distinct from 'ABCDE00003' then
    raise exception 'O aluno deveria aguardar a expedição na nova turma';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
do $$
begin
  if public.miracast_class_student_state() ->> 'ended' is distinct from 'true'
    or public.miracast_class_student_state() #>> '{participant,name}' is distinct from 'Ana' then
    raise exception 'A sessão do aluno deveria mostrar o resultado da expedição encerrada';
  end if;
  begin
    perform public.miracast_advance_class('classification', '{"value":"Envio atrasado"}');
    raise exception 'A expedição encerrada aceitou um novo envio';
  exception when raise_exception then
    if sqlerrm <> 'Aguarde o início da expedição.' then raise; end if;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000001","is_anonymous":false}', true);
do $$
begin
  begin
    perform public.miracast_manage_class('ABCDE00001', 'start');
    raise exception 'O professor conseguiu reabrir a turma encerrada';
  exception when raise_exception then
    if sqlerrm <> 'Esta turma já encerrou a expedição. Crie outra turma para uma nova aplicação.' then raise; end if;
  end;

  delete from public.miracast_expedition_history where id = current_setting('miracast.test.history_id')::uuid;
  if not found then raise exception 'O proprietário não conseguiu excluir a expedição'; end if;

  begin
    insert into public.miracast_expeditions (turma_id)
      values ('30500000-0000-0000-0000-000000000001') on conflict do nothing;
    raise exception 'O início pela API anterior reabriu a turma depois da exclusão';
  exception when raise_exception then
    if sqlerrm <> 'Esta turma já encerrou a expedição. Crie outra turma para uma nova aplicação.' then raise; end if;
  end;
end;
$$;

select public.miracast_manage_class('ABCDE00003', 'start');

select set_config('request.jwt.claims', '{"sub":"30400000-0000-0000-0000-000000000004","is_anonymous":true}', true);
do $$
begin
  begin
    perform public.miracast_join_class('ABCDE00001', 'Eva');
    raise exception 'A exclusão do histórico reabriu o código da turma';
  exception when raise_exception then
    if sqlerrm <> 'A expedição desta turma foi encerrada. Peça ao professor um novo código.' then raise; end if;
  end;
end;
$$;

reset role;
do $$
begin
  if exists (select 1 from public.miracast_expedition_history where id = current_setting('miracast.test.history_id')::uuid)
    or exists (select 1 from public.miracast_archived_enrollments where expedition_id = current_setting('miracast.test.history_id')::uuid)
    or not exists (select 1 from public.miracast_closed_classes where turma_id = '30500000-0000-0000-0000-000000000001')
    or not exists (select 1 from public.miracast_expeditions where turma_id = '30500000-0000-0000-0000-000000000003')
    or not exists (select 1 from public.turmas where codigo = 'ABCDE00001') then
    raise exception 'A exclusão deveria apagar os resultados e preservar o encerramento e a nova turma';
  end if;
end;
$$;

rollback;
