import type { FormEvent, ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type ProfessorLoginProps = {
  onBackToStudent: () => void;
  onLogin: () => void;
};

export const ProfessorLogin = ({
  onBackToStudent,
  onLogin,
}: ProfessorLoginProps): ReactElement => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main className="professor-login" data-node-id="2020:2">
      <div className="professor-login__shell">
        <img
          className="professor-login__forma"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="professor-login__content">
          <div className="professor-login__brand">
            <Brand />
          </div>

          <div className="professor-login__badge">ÁREA DO PROFESSOR</div>

          <form className="professor-login__form" onSubmit={handleSubmit}>
            <h1>Entrar no MiraCast</h1>
            <p className="professor-login__description">
              Acesse suas salas e acompanhe a turma.
            </p>

            <label className="professor-login__field">
              <span>E-mail</span>
              <input
                type="email"
                name="email"
                placeholder="professor@escola.edu.br"
                autoComplete="username"
                required
              />
            </label>

            <label className="professor-login__field">
              <span>Senha</span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <button className="professor-login__submit" type="submit">
              Entrar
            </button>
          </form>

          <footer className="professor-login__footer">
            <p>MiraCast · PROFQUI/UFRN</p>
            <button type="button" onClick={onBackToStudent}>
              Voltar à entrada do aluno
            </button>
          </footer>
        </div>
      </div>
    </main>
  );
};