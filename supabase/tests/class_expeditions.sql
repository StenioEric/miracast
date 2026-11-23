-- Execute em uma base de teste com profiles, turmas e a migração de expedições.
begin;

insert into auth.users (id, is_anonymous) values
  ('20400000-0000-0000-0000-000000000001', false),
  ('20400000-0000-0000-0000-000000000002', false),
  ('20400000-0000-0000-0000-000000000003', true),
  ('20400000-0000-0000-0000-000000000004', true),
  ('20400000-0000-0000-0000-000000000005', true);

insert into public.turmas (id, professor_id, codigo, nome) values
  ('20500000-0000-0000-0000-000000000001', '20400000-0000-0000-0000-000000000001', 'F1A2B3C4D5', 'Turma A'),
  ('20500000-0000-0000-0000-000000000002', '20400000-0000-0000-0000-000000000002', 'F2A3B4C5D6', 'Turma B');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20400000-0000-0000-0000-000000000003","is_anonymous":true}', true);

do $$
begin
  begin
    perform public.miracast_join_class('CODIGO ERRADO', 'Ana');
    raise exception 'Código inexistente aceito';
  exception when raise_exception then
    if sqlerrm <> 'Turma não encontrada. Confira o código com o professor.' then raise; end if;
  end;
end;
$$;

select public.miracast_join_class(' f1a2b3c4d5 ', 'Ana');
select public.miracast_join_class('F1A2B3C4D5', 'Nome de um envio repetido');

do $$
begin
  if exists (select 1 from public.turmas)
    or exists (select 1 from public.miracast_enrollments)
    or exists (select 1 from public.miracast_expeditions) then
    raise exception 'Aluno recebeu acesso direto a dados da turma';
  end if;
  if public.miracast_class_student_state() #>> '{participant,name}' is distinct from 'Ana'
    or public.miracast_class_student_state() #>> '{room,started}' is distinct from 'false' then
    raise exception 'A própria participação deveria estar na sala de espera';
  end if;
  begin
    perform public.miracast_join_class('F2A3B4C5D6', 'Ana');
    raise exception 'Inscrição mudou de turma';
  exception when raise_exception then
    if sqlerrm <> 'Já existe uma inscrição nesta aba. Saia da sessão para trocar de turma.' then raise; end if;
  end;
  begin
    perform public.miracast_advance_class('motivation');
    raise exception 'Aluno avançou antes do início';
  exception when raise_exception then
    if sqlerrm <> 'Aguarde o início da expedição.' then raise; end if;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"20400000-0000-0000-0000-000000000004","is_anonymous":true}', true);
select public.miracast_join_class('F2A3B4C5D6', 'Bruno');

select set_config('request.jwt.claims', '{"sub":"20400000-0000-0000-0000-000000000005","is_anonymous":true}', true);
select public.miracast_join_class('F1A2B3C4D5', 'Carla');
do $$
begin
  if public.miracast_class_student_state() #>> '{participant,name}' is distinct from 'Carla'
    or public.miracast_class_student_state() ->> 'participantCount' is distinct from '2' then
    raise exception 'O aluno recebeu um resultado diferente da própria participação e a contagem da turma';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"20400000-0000-0000-0000-000000000001","is_anonymous":false}', true);
do $$
begin
  if (select array_agg(name order by name) from public.miracast_enrollments) is distinct from array['Ana', 'Carla'] then
    raise exception 'Professor A recebeu participantes da turma errada';
  end if;
  begin
    insert into public.miracast_expeditions (turma_id) values ('20500000-0000-0000-0000-000000000002');
    raise exception 'Professor A iniciou uma turma de outra conta';
  exception when insufficient_privilege then null;
  end;
end;
$$;
insert into public.miracast_expeditions (turma_id) values ('20500000-0000-0000-0000-000000000001') on conflict do nothing;
insert into public.miracast_expeditions (turma_id) values ('20500000-0000-0000-0000-000000000001') on conflict do nothing;

select set_config('request.jwt.claims', '{"sub":"20400000-0000-0000-0000-000000000003","is_anonymous":true}', true);
select public.miracast_advance_class('classification', '{"value":"fora de ordem"}');
select public.miracast_advance_class('motivation');
select public.miracast_advance_class('protocol', '{"value":"Protocolo consultado"}');
select public.miracast_advance_class('protocol', '{"value":"envio repetido"}');

do $$
declare
  snapshot jsonb := public.miracast_class_student_state();
begin
  if snapshot #>> '{room,started}' is distinct from 'true'
    or snapshot #>> '{participant,step}' is distinct from 'classification'
    or snapshot #> '{participant,answers}' is distinct from '{"protocol":{"value":"Protocolo consultado"}}'::jsonb then
    raise exception 'O progresso não respeitou a ordem ou a primeira resposta';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"20400000-0000-0000-0000-000000000002","is_anonymous":false}', true);
do $$
begin
  if (select array_agg(name) from public.miracast_enrollments) is distinct from array['Bruno']
    or exists (select 1 from public.miracast_expeditions)
    or public.miracast_class_student_state() is not null then
    raise exception 'Professor B recebeu progresso, turma ou participação de outra conta';
  end if;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform public.miracast_class_student_state();
    raise exception 'Visitante sem sessão recebeu acesso ao estado da turma';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
