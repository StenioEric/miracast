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
};

export function ExpeditionEntry({ onJoin, onBack, pending }: ExpeditionEntryProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onJoin(String(values.get("code")), String(values.get("name")));
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
        <p>Use o código da turma fornecido pelo professor.</p>
        <label className="form-field">
          Código da sala
          <input className="form-control expedicao__codigo" name="code"
            pattern="[A-Za-z0-9]{6}|[A-Fa-f0-9]{10}" minLength={6} maxLength={10} autoCapitalize="characters"
            autoComplete="off" spellCheck={false} placeholder="Ex.: A1B2C3D4E5" required />
        </label>
        <label className="form-field">
          Seu nome
          <input className="form-control" name="name" maxLength={100}
            placeholder="Seu nome completo" autoComplete="name" required />
        </label>
        <Button type="submit" disabled={pending}>{pending ? "Aguarde…" : "Entrar na expedição"}</Button>
      </ContentCard>
    </PageLayout>
  );
}
