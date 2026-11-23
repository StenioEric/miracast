import type { FormEvent } from "react";

import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorCreateRoom.css";

type ProfessorCreateRoomProps = {
  onBackToDashboard: () => void;
  onRoomCreated: (name: string) => void;
  pending?: boolean;
};

export function ProfessorCreateRoom({ onBackToDashboard, onRoomCreated, pending }: ProfessorCreateRoomProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRoomCreated(String(new FormData(event.currentTarget).get("roomName")));
  }

  return (
    <ProfessorLayout frame="2020:30"
      title="Criar nova turma"
      navigation={<Button variant="link" disabled={pending} onClick={onBackToDashboard}>Voltar ao painel</Button>}
    >
      <ContentCard as="form" onSubmit={submit}>
        <p>Defina um nome para identificar sua turma.</p>
        <label className="form-field">
          Nome da turma
          <input className="form-control" name="roomName" placeholder="Ex.: Estereoquímica – Turma A" maxLength={120} required />
        </label>
        <Button type="submit" disabled={pending}>{pending ? "Aguarde…" : "Criar turma"}</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
