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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || pending) return;
    onReset(String(new FormData(event.currentTarget).get("password")));
  }

  return (
    <ProfessorLayout frame="2020:2" title="Redefinir senha" className="redefinir-senha"
      navigation={<Button variant="link" disabled={pending} onClick={onBack}>Voltar ao login</Button>}
    >
      {available ? <ContentCard as="form" method="post" onSubmit={submit}>
        <label className="form-field">
          Nova senha
          <input className="form-control" type="password" name="password" autoComplete="new-password" required />
        </label>
        {error && <p className="app-error" role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar nova senha"}</Button>
      </ContentCard> : <ContentCard>
        <p>Abra o link de recuperação enviado ao seu e-mail ou solicite um novo link na tela de login.</p>
      </ContentCard>}
    </ProfessorLayout>
  );
}
