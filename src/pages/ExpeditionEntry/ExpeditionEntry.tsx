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
  onResume?: (code: string) => void;
  onModeChange?: () => void;
  error?: string;
};

export function ExpeditionEntry({ onJoin, onBack, pending, inviteCode, onResume, onModeChange, error }: ExpeditionEntryProps) {
  const [resuming, setResuming] = useState(false);
  const [personalCode, setPersonalCode] = useState("");
  const [code, setCode] = useState(inviteCode ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const enteredCode = String(values.get("code")).trim();
    if (resuming) onResume?.(enteredCode);
    else onJoin(enteredCode, String(values.get("name")));
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
        {resuming ? <>
          <p>Cole ou digite o código pessoal que você guardou ao participar.</p>
          <label className="form-field">
            Código pessoal
            <input className="form-control" name="code" key="personal" pattern="[0-9A-Fa-f]{32}"
              title="Informe o código pessoal de 32 caracteres" autoComplete="off" spellCheck={false} required
              value={personalCode} onChange={(event) => setPersonalCode(event.target.value.replace(/\s/g, ""))} />
          </label>
        </> : <>
          <p>Use o código da turma fornecido pelo professor.</p>
          <label className="form-field">
            Código da turma
            <input className="form-control expedicao__codigo" name="code" key="class"
              pattern="[A-Z0-9]{6}|[A-F0-9]{10}" autoCapitalize="characters"
              title="Use o código de 10 caracteres, ou o código de 6 caracteres de uma sala antiga"
              autoComplete="off" spellCheck={false} placeholder="Ex.: A1B2C3D4E5" required
              value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, "").toUpperCase())} />
          </label>
          <label className="form-field">
            Seu nome
            <input className="form-control" name="name" maxLength={100}
              placeholder="Seu nome completo" autoComplete="name" required />
          </label>
        </>}
        {error && <p className="app-error" role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Aguarde…" : resuming ? "Retomar expedição" : "Entrar na expedição"}</Button>
        {onResume && <Button variant="link" disabled={pending} onClick={() => { setResuming(!resuming); onModeChange?.(); }}>
          {resuming ? "Entrar em uma turma" : "Já participei e quero retomar"}
        </Button>}
      </ContentCard>
    </PageLayout>
  );
}
