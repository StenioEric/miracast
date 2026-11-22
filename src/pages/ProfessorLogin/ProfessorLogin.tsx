import type { FormEvent } from "react";

import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorLogin.css";

type ProfessorLoginProps = {
  configured: boolean;
  pending: boolean;
  error: string;
  onBackToStudent: () => void;
  onLogin: (email: string, password: string) => void;
};

export function ProfessorLogin({ configured, pending, error, onBackToStudent, onLogin }: ProfessorLoginProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || pending) return;
    const data = new FormData(event.currentTarget);
    onLogin(String(data.get("email")), String(data.get("password")));
  }

  return (
    <ProfessorLayout
      frame="2020:2"
      className="professor-login"
      navigation={<Button variant="link" disabled={pending} onClick={onBackToStudent}>Voltar à entrada do aluno</Button>}
    >
      <ContentCard as="form" method="post" aria-labelledby="professor-login-title" onSubmit={submit}>
        <h2 id="professor-login-title">Entrar no MiraCast</h2>
        <p>Acesse suas salas e acompanhe a turma.</p>
        <label className="form-field">
          E-mail
          <input className="form-control" name="email" type="email" autoComplete="username"
            autoCapitalize="none" placeholder="professor@escola.edu.br" required />
        </label>
        <label className="form-field">
          Senha
          <input className="form-control" name="password" type="password"
            autoComplete="current-password" placeholder="••••••••" required />
        </label>
        {!configured && <p role="status">O login do professor ainda não está configurado.</p>}
        {error && <p className="app-error" role="alert">{error}</p>}
        <Button type="submit" disabled={!configured || pending}>{pending ? "Aguarde…" : "Entrar"}</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
