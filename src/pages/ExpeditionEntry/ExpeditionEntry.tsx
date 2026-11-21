import type { FormEvent } from "react";

import decoration from "../../assets/forma-expedicao.svg";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./ExpeditionEntry.css";

type ExpeditionEntryProps = {
  onJoin: (code: string, name: string) => void;
  onBack: () => void;
};

export function ExpeditionEntry({ onJoin, onBack }: ExpeditionEntryProps) {
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
        <Button variant="link" onClick={onBack}>Voltar à seleção de perfil</Button>
      </PageFooter>}
    >
      <ContentCard as="form" onSubmit={submit}>
        <p>Use o código de seis caracteres fornecido pelo professor.</p>
        <label className="form-field">
          Código da sala
          <input className="form-control expedicao__codigo" name="code"
            pattern="[A-Za-z0-9]{6}" minLength={6} maxLength={6} autoCapitalize="characters"
            autoComplete="off" spellCheck={false} placeholder="Ex.: ABC123" required />
        </label>
        <label className="form-field">
          Seu nome
          <input className="form-control" name="name" maxLength={100}
            placeholder="Seu nome completo" autoComplete="name" required />
        </label>
        <Button type="submit">Entrar na expedição</Button>
      </ContentCard>
    </PageLayout>
  );
}
