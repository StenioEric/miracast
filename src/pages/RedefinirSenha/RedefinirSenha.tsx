import { useState } from "react";
import { passwordProblems } from "../../domain/passwordPolicy";
import { PasswordField } from "../../components/PasswordField/PasswordField";
import type { FormEvent } from "react";

import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./RedefinirSenha.css";

type RedefinirSenhaProps = {
  available: boolean;
  pending: boolean;
  error: string;
  onBack: () => void;
  onReset: (password: string) => void;
};

export function RedefinirSenha({ available, pending, error, onBack, onReset }: RedefinirSenhaProps) {
  const [passwordError, setPasswordError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || pending) return;
    const password = String(new FormData(event.currentTarget).get("password"));
    const missing = passwordProblems(password);
    if (missing.length) {
      setPasswordError(`A senha precisa de ${new Intl.ListFormat("pt-BR").format(missing)}.`);
      const field = event.currentTarget.elements.namedItem("password");
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    setPasswordError("");
    onReset(password);
  }

  return (
    <ProfessorLayout frame="2020:2" title="Redefinir senha" className="redefinir-senha"
      navigation={<Button variant="link" disabled={pending} onClick={onBack}>Voltar ao login</Button>}
    >
      {available ? <ContentCard as="form" method="post" onSubmit={submit}>
        <PasswordField label="Nova senha" isNew error={passwordError} />
        {error && <p className="app-error" role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar nova senha"}</Button>
      </ContentCard> : <ContentCard>
        <p>Abra o link de recuperação enviado ao seu e-mail ou solicite um novo link na tela de login.</p>
      </ContentCard>}
    </ProfessorLayout>
  );
}
