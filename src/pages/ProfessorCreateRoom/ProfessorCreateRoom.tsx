import type { FormEvent } from "react";
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
    <ProfessorLayout frame="2020:30">
      <form className="professor__panel" onSubmit={submit}>
        <h1>Criar nova sala</h1>
        <p>Defina um nome para identificar sua turma.</p>
        <label className="professor__field">
          Nome da sala
          <input name="roomName" placeholder="Ex.: Estereoquímica – Turma A" maxLength={100} required />
        </label>
        <button className="flow-button" type="submit">Criar sala</button>
      </form>
      <button className="flow-link" type="button" onClick={onBackToDashboard}>Voltar ao painel</button>
    </ProfessorLayout>
  );
}
