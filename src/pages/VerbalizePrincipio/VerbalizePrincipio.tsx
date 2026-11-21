import { useState } from "react";
import type { FormEvent } from "react";

import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import "./VerbalizePrincipio.css";

export function VerbalizePrincipio({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [explanation, setExplanation] = useState("");

  function submitExplanation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = explanation.trim();
    if (value) onContinue({ value });
  }

  return (
    <ActivityLayout
      step="explain-chirality"
      frame="2003:1046"
      stage="Princípio da quiralidade · Tela 15"
      guidance="Em uma frase: por que as duas moléculas não se sobrepõem?"
      footer={<PageFooter>
        <Button form="resposta-quiralidade" type="submit" disabled={!explanation.trim()}>Continuar</Button>
      </PageFooter>}
    >
      <ContentCard as="form" id="resposta-quiralidade" onSubmit={submitExplanation}>
        <h2>Escreva por que as moléculas não se sobrepõem, mesmo girando.</h2>
        <label className="form-field">
          <span>Sua explicação</span>
          <textarea className="form-control"
            value={explanation}
            maxLength={2000}
            rows={6}
            placeholder="Escreva sua resposta..."
            onChange={(event) => setExplanation(event.target.value)}
            required
          />
        </label>
      </ContentCard>
    </ActivityLayout>
  );
}
