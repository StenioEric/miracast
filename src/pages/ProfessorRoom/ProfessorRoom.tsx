import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { getArchivedParticipants } from "../../services/teacherClasses";
import type { ClassParticipant, ExpeditionHistory, TeacherClassState } from "../../services/teacherClasses";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { CopyTextButton } from "../../components/CopyTextButton/CopyTextButton";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import { TeacherResults } from "./TeacherResults";
import "./ProfessorRoom.css";

type ProfessorRoomProps = TeacherClassState & {
  created?: boolean;
  pending: boolean;
  status?: string;
  onViewRoom: () => void;
  onRename: (name: string) => void;
  onStart: () => void;
  onEnd: (startedAt: string) => void;
  onBackToDashboard: () => void;
};

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function ArchivedResults({ expedition }: { expedition: ExpeditionHistory }) {
  const [participants, setParticipants] = useState<ClassParticipant[]>();
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    void getArchivedParticipants(expedition.id).then(
      (value) => { if (active) setParticipants(value); },
      () => { if (active) setError("Não foi possível carregar os resultados desta expedição."); },
    );
    return () => { active = false; };
  }, [expedition.id, revision]);

  return <>
    <h3>Expedição de {dateFormat.format(new Date(expedition.started_at))}</h3>
    {error ? <>
      <p className="app-error" role="alert">{error}</p>
      <Button variant="secondary" onClick={() => { setError(""); setRevision(revision + 1); }}>Tentar novamente</Button>
    </> : participants ? <TeacherResults participants={participants} started archived />
      : <p role="status">Carregando resultados…</p>}
  </>;
}

export function ProfessorRoom({
  room, startedAt, participants, history, created, pending, status, onViewRoom, onRename, onStart, onEnd, onBackToDashboard,
}: ProfessorRoomProps) {
  const [editionToEnd, setEditionToEnd] = useState<string | null>(null);
  const confirmEnd = startedAt !== null && startedAt === editionToEnd;
  const [selectedHistory, setSelectedHistory] = useState("");
  const previous = history.find(({ id }) => id === selectedHistory);
  const invitePath = `${import.meta.env.BASE_URL}?turma=${encodeURIComponent(room.code)}`;
  const invite = typeof window === "undefined" ? invitePath : new URL(invitePath, window.location.origin).toString();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("roomName")).trim();
    if (name && name !== room.name) onRename(name);
  }

  return (
    <ProfessorLayout frame={created ? "2020:44" : participants.length ? "2020:72" : "2020:58"}
      title={created ? "Turma criada" : room.name}
      navigation={<Button variant="link" disabled={pending} onClick={onBackToDashboard}>Voltar ao painel</Button>}
    >
      <ContentCard>
        {created && <p>{room.name}</p>}
        <p>Código da turma</p>
        <output className="professor__code" aria-label="Código da turma">{room.code}</output>
        <div className="professor__actions">
          <CopyTextButton value={room.code} label="Copiar código" />
          <CopyTextButton value={invite} label="Copiar link de convite" />
        </div>
        {created ? <>
          <p>Compartilhe o convite com os alunos.</p>
          <Button onClick={onViewRoom}>Acessar turma</Button>
        </> : <>
          <p>{startedAt ? "Expedição iniciada" : "Aguardando início"}</p>
          {status && <p role="status">{status}</p>}
          {!startedAt && <Button disabled={pending} onClick={onStart}>
            {history.length ? "Iniciar nova expedição" : "Iniciar expedição"}
          </Button>}
          {startedAt && !confirmEnd && <Button variant="secondary" disabled={pending} onClick={() => setEditionToEnd(startedAt)}>
            Encerrar expedição
          </Button>}
          {startedAt && confirmEnd && <div className="professor__end">
            <p>Encerrar salva os resultados no histórico e impede novos envios nesta expedição.</p>
            <div className="professor__actions">
              <Button disabled={pending} onClick={() => onEnd(startedAt)}>Confirmar encerramento</Button>
              <Button variant="secondary" disabled={pending} onClick={() => setEditionToEnd(null)}>Cancelar</Button>
            </div>
          </div>}
        </>}
      </ContentCard>

      {!created && <>
        <ContentCard as="form" key={room.name} onSubmit={submit}>
          <label className="form-field">
            Nome da turma
            <input className="form-control" name="roomName" defaultValue={room.name} maxLength={120} required />
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar nome"}</Button>
        </ContentCard>
        <ContentCard>
          <h2>Alunos e progresso</h2>
          <TeacherResults key={startedAt ?? "waiting"} participants={participants} started={Boolean(startedAt)} />
        </ContentCard>
        {history.length > 0 && <ContentCard>
          <h2>Expedições anteriores</h2>
          <label className="form-field">Selecione uma expedição
            <select className="form-control" value={selectedHistory} onChange={(event) => setSelectedHistory(event.target.value)}>
              <option value="">Escolha pela data de início</option>
              {history.map(({ id, started_at }) => <option key={id} value={id}>{dateFormat.format(new Date(started_at))}</option>)}
            </select>
          </label>
          {previous && <ArchivedResults key={previous.id} expedition={previous} />}
        </ContentCard>}
      </>}
    </ProfessorLayout>
  );
}
