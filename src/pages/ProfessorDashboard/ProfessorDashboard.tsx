import type { ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

export const ProfessorDashboard = (): ReactElement => (
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
            <h3>Estereoquímica - Turma A</h3>
            <p className="professor-dashboard__code">Código: ABC123</p>
            <p className="professor-dashboard__students">3 alunos</p>
            <button type="button">Acessar · Turma A</button>
          </article>

          <button className="professor-dashboard__create" type="button">
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