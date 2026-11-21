import type { FormEvent } from "react";

import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorCreateRoom.css";

type ProfessorCreateRoomProps = {
  onBackToDashboard: () => void;
  onRoomCreated: (name: string) => void;
};

export function ProfessorCreateRoom({ onBackToDashboard, onRoomCreated }: ProfessorCreateRoomProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRoomCreated(String(new FormData(event.currentTarget).get("roomName")));
  }

  return (
    <ProfessorLayout frame="2020:30"
      title="Criar nova sala"
      navigation={<Button variant="link" onClick={onBackToDashboard}>Voltar ao painel</Button>}
    >
      <ContentCard as="form" onSubmit={submit}>
        <p>Defina um nome para identificar sua turma.</p>
        <label className="form-field">
          Nome da sala
          <input className="form-control" name="roomName" placeholder="Ex.: Estereoquímica – Turma A" maxLength={100} required />
        </label>
        <Button type="submit">Criar sala</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
