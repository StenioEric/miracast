import type { FormEvent } from "react";

import type { TeacherClass } from "../../services/teacherClasses";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorRoom.css";

type ProfessorRoomProps = {
  room: TeacherClass;
  created?: boolean;
  pending: boolean;
  onViewRoom: () => void;
  onRename: (name: string) => void;
  onBackToDashboard: () => void;
};

export function ProfessorRoom({ room, created, pending, onViewRoom, onRename, onBackToDashboard }: ProfessorRoomProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("roomName")).trim();
    if (name && name !== room.name) onRename(name);
  }

  return (
    <ProfessorLayout frame={created ? "2020:44" : "2020:58"}
      title={created ? "Turma criada" : room.name}
      navigation={<Button variant="link" disabled={pending} onClick={onBackToDashboard}>Voltar ao painel</Button>}
    >
      <ContentCard>
        {created && <p>{room.name}</p>}
        <p>Código da turma</p>
        <output className="professor__code" aria-label="Código da turma">{room.code}</output>
        {created && <Button onClick={onViewRoom}>Acessar turma</Button>}
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
          <p>O acompanhamento desta turma ficará disponível quando o ingresso por código estiver integrado.</p>
        </ContentCard>
      </>}
    </ProfessorLayout>
  );
}
