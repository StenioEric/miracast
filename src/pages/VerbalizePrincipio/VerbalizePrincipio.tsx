import { useState } from "react";
import type { FormEvent } from "react";

import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import type { Answer } from "../../domain/expedition";
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
    <GuidedActivity
      className="verbalize-principio guided-activity--purple"
      frame="2003:1046"
      stage="Princípio da quiralidade · Tela 15"
      title="VERBALIZE O PRINCÍPIO"
      guidance="Em uma frase: por que as duas moléculas não se sobrepõem?"
    >
      <form className="guided-activity__card verbalize-principio__form" onSubmit={submitExplanation}>
        <h2>Escreva por que as moléculas não se sobrepõem, mesmo girando.</h2>
        <label>
          <span>Sua explicação</span>
          <textarea
            value={explanation}
            maxLength={2000}
            rows={6}
            placeholder="Escreva sua resposta..."
            onChange={(event) => setExplanation(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="guided-activity__action" disabled={!explanation.trim()}>
          Continuar
        </button>
      </form>
    </GuidedActivity>
  );
}
