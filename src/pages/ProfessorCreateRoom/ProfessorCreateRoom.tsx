import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type ProfessorCreateRoomProps = {
  onBackToDashboard: () => void;
  onRoomCreated: (name: string, code: string) => void;
};

const ROOM_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRoomCode = (): string => {
  const randomValues = new Uint8Array(6);
  window.crypto.getRandomValues(randomValues);

  return Array.from(
    randomValues,
    (value) => ROOM_CODE_CHARACTERS[value % ROOM_CODE_CHARACTERS.length],
  ).join("");
};

export const ProfessorCreateRoom = ({
  onBackToDashboard,
  onRoomCreated,
}: ProfessorCreateRoomProps): ReactElement => {
  const [createdRoom, setCreatedRoom] = useState<{
    name: string;
    code: string;
  } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const roomName = formData.get("roomName");

    if (typeof roomName !== "string" || !roomName.trim()) return;

    const room = { name: roomName.trim(), code: generateRoomCode() };
    setCreatedRoom(room);
    onRoomCreated(room.name, room.code);
  };

  return (
    <main className="professor-create-room" data-node-id="2020:30">
      <div className="professor-create-room__shell">
        <img
          className="professor-create-room__forma"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="professor-create-room__content">
          <div className="professor-create-room__brand">
            <Brand />
          </div>

          <div className="professor-create-room__badge">ÁREA DO PROFESSOR</div>

          <div className="professor-create-room__actions">
            <form
              className={
                createdRoom
                  ? "professor-create-room__form professor-create-room__form--created"
                  : "professor-create-room__form"
              }
              onSubmit={handleSubmit}
            >
              <h1>Criar nova sala</h1>
              <p className="professor-create-room__description">
                Defina um nome para identificar sua turma.
              </p>

              <label className="professor-create-room__field">
                <span>Nome da sala</span>
                <input
                  type="text"
                  name="roomName"
                  defaultValue="Estereoquímica - Turma B"
                  required
                  onChange={() => setCreatedRoom(null)}
                />
              </label>

              <p className="professor-create-room__note" aria-live="polite">
                {createdRoom
                  ? "Sala criada com sucesso. Código de acesso:"
                  : "O código de acesso será gerado após a criação."}
              </p>

              {createdRoom && (
                <output
                  className="professor-create-room__code"
                  aria-label="Código da sala"
                >
                  {createdRoom.code}
                </output>
              )}

              {!createdRoom && (
                <button className="professor-create-room__submit" type="submit">
                  Criar sala
                </button>
              )}
            </form>

            <button
              className="professor-create-room__back"
              onClick={onBackToDashboard}
              type="button"
            >
              Voltar ao dashboard
            </button>
          </div>

          <footer className="professor-create-room__footer">
            MiraCast · PROFQUI/UFRN
          </footer>
        </div>
      </div>
    </main>
  );
};