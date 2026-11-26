import { useState } from "react";
import type { FormEvent } from "react";

import decoration from "../../assets/forma-expedicao.svg";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./ExpeditionEntry.css";

type ExpeditionEntryProps = {
  onJoin: (code: string, name: string) => void;
  onBack: () => void;
  pending?: boolean;
  inviteCode?: string;
  error?: string;
};

export function ExpeditionEntry({ onJoin, onBack, pending, inviteCode, error }: ExpeditionEntryProps) {
  const [code, setCode] = useState(inviteCode ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onJoin(code, String(values.get("name")));
  }

  return (
    <PageLayout
      frame="7:101"
      illustration={decoration}
      header={<PageHeader brand title="Entrar na expedição" />}
      footer={<PageFooter credits="full">
        <Button variant="link" disabled={pending} onClick={onBack}>Voltar à seleção de perfil</Button>
      </PageFooter>}
    >
      <ContentCard as="form" onSubmit={submit}>
        <p id="expedicao-codigo-ajuda">Use o código de 10 caracteres fornecido pelo professor.</p>
        <label className="form-field">
          Código da turma
          <input className="form-control expedicao__codigo" name="code"
            pattern="[A-F0-9]{10}" autoCapitalize="characters"
            aria-describedby="expedicao-codigo-ajuda"
            autoComplete="off" spellCheck={false} placeholder="Ex.: A1B2C3D4E5" required
            value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, "").toUpperCase())} />
        </label>
        <label className="form-field">
          Seu nome
          <input className="form-control" name="name" maxLength={100}
            placeholder="Seu nome completo" autoComplete="name" required />
        </label>
        {error && <p className="app-error" role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Aguarde…" : "Entrar na expedição"}</Button>
      </ContentCard>
    </PageLayout>
  );
}
