import type { FormEvent } from "react";

import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorLogin.css";

type ProfessorLoginProps = {
  configured: boolean;
  pending: boolean;
  error: string;
  status?: string;
  onBackToStudent: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  onRecover: (email: string) => void;
};

export function ProfessorLogin({
  configured, pending, error, status, onBackToStudent, onLogin, onRegister, onRecover,
}: ProfessorLoginProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (action === "recover") {
      const emailField = form.elements.namedItem("email");
      if (emailField instanceof HTMLInputElement && emailField.reportValidity()) onRecover(email);
    } else if (action === "register") {
      onRegister(email, password);
    } else {
      onLogin(email, password);
    }
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
        {status && <p role="status">{status}</p>}
        <Button type="submit" disabled={!configured || pending}>{pending ? "Aguarde…" : "Entrar"}</Button>
        <Button type="submit" variant="secondary" value="register" disabled={!configured || pending}>Criar conta</Button>
        <Button type="submit" variant="link" value="recover" formNoValidate disabled={!configured || pending}>Esqueci minha senha</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
