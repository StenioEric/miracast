import type { ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type ProfessorDashboardProps = {
  room: {
    name: string;
    code: string;
    students: number;
  };
  onCreateRoom: () => void;
};

export const ProfessorDashboard = ({
  room,
  onCreateRoom,
}: ProfessorDashboardProps): ReactElement => (
  <main className="professor-dashboard" data-node-id="2020:16">
    <div className="professor-dashboard__shell">
      <img
        className="professor-dashboard__forma"
        src={formaDecorativa}
        alt=""
        aria-hidden="true"
      />

      <div className="professor-dashboard__content">
        <div className="professor-dashboard__brand">
          <Brand />
        </div>

        <div className="professor-dashboard__badge">ÁREA DO PROFESSOR</div>

        <section className="professor-dashboard__rooms" aria-label="Salas do professor">
          <h1>Olá, professor!</h1>
          <h2>Minhas salas</h2>

          <article className="professor-dashboard__room">
            <h3>{room.name}</h3>
            <p className="professor-dashboard__code">Código: {room.code}</p>
            <p className="professor-dashboard__students">
              {room.students} {room.students === 1 ? "aluno" : "alunos"}
            </p>
            <button type="button">Acessar · {room.name}</button>
          </article>

          <button
            className="professor-dashboard__create"
            onClick={onCreateRoom}
            type="button"
          >
            Criar nova sala
          </button>
        </section>

        <footer className="professor-dashboard__footer">
          MiraCast · PROFQUI/UFRN
        </footer>
      </div>
    </div>
  </main>
);