import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PasswordField } from "../../components/PasswordField/PasswordField";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import { passwordProblems } from "../../domain/passwordPolicy";
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
  onResend?: (email: string) => void;
  onModeChange?: () => void;
};

type Mode = "login" | "register" | "recover";

const titles: Record<Mode, string> = {
  login: "Entrar no MiraCast",
  register: "Criar conta de professor",
  recover: "Recuperar senha",
};

export function ProfessorLogin({
  configured, pending, error, status, onBackToStudent, onLogin, onRegister, onRecover, onResend, onModeChange,
}: ProfessorLoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [requestedEmail, setRequestedEmail] = useState("");

  function changeMode(next: Mode) {
    setMode(next);
    setRequestedEmail("");
    setPasswordError("");
    onModeChange?.();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || pending) return;
    const form = event.currentTarget;
    const address = email.trim();
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    setPasswordError("");
    if (action === "resend") {
      const field = form.elements.namedItem("email");
      if (!(field instanceof HTMLInputElement) || !field.reportValidity()) return;
      onResend?.(address);
      setRequestedEmail(address);
      return;
    }
    if (mode === "recover") {
      onRecover(address);
      setRequestedEmail(address);
      return;
    }
    const password = String(new FormData(form).get("password"));
    if (mode === "login") {
      onLogin(address, password);
      return;
    }
    const missing = passwordProblems(password);
    if (missing.length) {
      setPasswordError(`A senha precisa de ${new Intl.ListFormat("pt-BR").format(missing)}.`);
      const field = form.elements.namedItem("password");
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    onRegister(address, password);
    setRequestedEmail(address);
  }

  return (
    <ProfessorLayout frame="2020:2" className="professor-login"
      navigation={<Button variant="link" disabled={pending} onClick={onBackToStudent}>Voltar à entrada do aluno</Button>}
    >
      <ContentCard as="form" method="post" aria-labelledby="professor-login-title" onSubmit={submit}>
        <h2 id="professor-login-title">{titles[mode]}</h2>
        {mode === "login" && <p>Acesse suas salas e acompanhe a turma.</p>}
        {mode === "recover" && <p>Informe o e-mail associado à sua conta.</p>}
        <label className="form-field">
          E-mail
          <input className="form-control" name="email" type="email" autoComplete="username" autoCapitalize="none"
            placeholder="professor@escola.edu.br" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {mode !== "recover" && <PasswordField key={mode} label="Senha" isNew={mode === "register"} error={passwordError} />}
        {!configured && <p role="status">O login do professor ainda não está configurado.</p>}
        {error && <p className="app-error" role="alert">{error}</p>}
        {status && <div role="status">
          <p>{status}</p>
          {requestedEmail && <p>
            Confira <strong>{requestedEmail}</strong> e a pasta de spam. Abra o link no navegador em que fez o pedido.
          </p>}
        </div>}
        <Button type="submit" disabled={!configured || pending}>
          {pending ? "Aguarde…" : mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : status ? "Reenviar link" : "Enviar link"}
        </Button>
        {mode === "login" ? <>
          <Button variant="secondary" disabled={!configured || pending} onClick={() => changeMode("register")}>Criar conta</Button>
          <Button variant="link" disabled={!configured || pending} onClick={() => changeMode("recover")}>Esqueci minha senha</Button>
          {error && onResend && <Button type="submit" variant="link" value="resend" formNoValidate disabled={pending || !email}>Reenviar confirmação</Button>}
        </> : <>
          {mode === "register" && status && onResend && <Button type="submit" variant="secondary" value="resend" formNoValidate disabled={pending}>Reenviar confirmação</Button>}
          {status && <Button variant="link" disabled={pending} onClick={(event) => {
            const field = event.currentTarget.form?.elements.namedItem("email");
            if (field instanceof HTMLInputElement) {
              field.focus();
              field.select();
            }
          }}>Corrigir e-mail</Button>}
          <Button variant="link" disabled={pending} onClick={() => changeMode("login")}>Voltar ao login</Button>
        </>}
      </ContentCard>
    </ProfessorLayout>
  );
}
