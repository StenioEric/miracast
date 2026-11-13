import type { ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type ProfessorRoomProps = {
  room: {
    name: string;
    code: string;
    students: { name: string; score: number }[];
  };
  onBackToDashboard: () => void;
};

export const ProfessorRoom = ({
  room,
  onBackToDashboard,
}: ProfessorRoomProps): ReactElement => {
  const hasStudents = room.students.length > 0;
  const average = hasStudents
    ? (room.students.reduce((total, student) => total + student.score, 0) /
        room.students.length).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : null;

  return (
    <main
      className="professor-room"
      data-node-id={hasStudents ? "2020:72" : "2020:58"}
    >
      <div className="professor-room__shell">
        <img
          className="professor-room__forma"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="professor-room__content">
          <div className="professor-room__brand">
            <Brand />
          </div>

          <div className="professor-room__badge">ÁREA DO PROFESSOR</div>

          <section className="professor-room__details" aria-label={room.name}>
            <article className="professor-room__summary">
              <h1>{room.name}</h1>
              <p className="professor-room__code-label">Código da sala</p>
              <p className="professor-room__code">{room.code}</p>
              <p className="professor-room__student-count">
                {room.students.length} {room.students.length === 1 ? "aluno" : "alunos"}
                {average ? ` · Média: ${average} pontos` : ""}
              </p>
            </article>

            {hasStudents ? (
              <section className="professor-room__progress" aria-labelledby="professor-room-progress-title">
                <h2 id="professor-room-progress-title">Alunos e pontuação</h2>
                <p className="professor-room__progress-caption">
                  Pontuação na atividade · de 0 a 100
                </p>
                <div className="professor-room__table" role="table" aria-label="Pontuação dos alunos">
                  <div className="professor-room__row professor-room__row--header" role="row">
                    <span role="columnheader">Aluno</span>
                    <span role="columnheader">Pontuação</span>
                  </div>
                  {room.students.map((student) => (
                    <div className="professor-room__row" role="row" key={student.name}>
                      <span role="cell">{student.name}</span>
                      <strong role="cell">{student.score}</strong>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="professor-room__empty" aria-labelledby="professor-room-empty-title">
                <h2 id="professor-room-empty-title">Alunos e pontuação</h2>
                <p className="professor-room__empty-title">
                  Nenhum aluno entrou ainda.
                </p>
                <p className="professor-room__empty-note">
                  Compartilhe o código {room.code}. Os alunos aparecerão aqui
                  ao entrar na sala.
                </p>
              </section>
            )}

            <button
              className="professor-room__back"
              onClick={onBackToDashboard}
              type="button"
            >
              Voltar ao dashboard
            </button>
          </section>

          <footer className="professor-room__footer">
            MiraCast · PROFQUI/UFRN
          </footer>
        </div>
      </div>
    </main>
  );
};