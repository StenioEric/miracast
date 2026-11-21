import { useState } from "react";
import type { FormEvent } from "react";

import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import "./GirarMudaIdentidade.css";

type GirarMudaIdentidadeProps = {
  onContinue: (answer: Answer) => void;
};

const supportIdeas = [
  "identidade",
  "ângulo",
  "mesma",
  "forma",
  "não muda",
  "continua",
];

export function GirarMudaIdentidade({ onContinue }: GirarMudaIdentidadeProps) {
  const [answer, setAnswer] = useState("");
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (answer.trim()) setSubmitted(true);
  };

  const toggleIdea = (idea: string) => {
    setSelectedIdeas((selected) =>
      selected.includes(idea)
        ? selected.filter((item) => item !== idea)
        : [...selected, idea],
    );
  };

  function continueActivity() {
    const ideas = selectedIdeas.length ? `\nIdeias de apoio: ${selectedIdeas.join(", ")}` : "";
    onContinue({ value: answer.trim() + ideas });
  }

  return (
    <ActivityLayout
      step="rotation-identity"
      stage="Ação Material Concreta · Tela 4"
      title="Missão 1.2 — Girar muda a identidade?"
      guidance="Observe o cubo girando. Em uma palavra: o objeto mudou de identidade ao girar? Por quê?"
      footer={<PageFooter>
        {submitted
          ? <Button onClick={continueActivity}>Continuar</Button>
          : <Button form="resposta-giro" type="submit" disabled={!answer.trim()}>Enviar resposta</Button>}
      </PageFooter>}
    >
      <ContentCard aria-label="Pergunta sobre rotação">
        <div className="girar-identidade__cubo-area" role="img" aria-label="Cubo girando">
          <div className="girar-identidade__cubo">
            <span className="girar-identidade__face girar-identidade__face--traseira" />
            <span className="girar-identidade__face girar-identidade__face--superior" />
            <span className="girar-identidade__face girar-identidade__face--lateral" />
            <span className="girar-identidade__face girar-identidade__face--frontal" />
          </div>
        </div>
        <p className="girar-identidade__legenda">cubo girando...</p>
        <h2>O cubo mudou de identidade ao girar? Escreva sua resposta explicando o motivo.</h2>

        <form id="resposta-giro" className="girar-identidade__formulario" onSubmit={handleSubmit}>
          <label className="girar-identidade__resposta">
            <span className="girar-identidade__sr-only">Escreva sua resposta</span>
            <textarea className="form-control" rows={4}
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setSubmitted(false);
              }}
              placeholder="Escreva sua resposta..."
              maxLength={2000}
              required
            />
          </label>

          <fieldset className="girar-identidade__apoio">
            <legend>Ideias-chave de apoio:</legend>
            <div className="girar-identidade__ideias">
              {supportIdeas.map((idea) => (
                <Button variant="secondary" aria-pressed={selectedIdeas.includes(idea)}
                  key={idea} onClick={() => toggleIdea(idea)}>
                  {idea}
                </Button>
              ))}
            </div>
          </fieldset>

        </form>
      </ContentCard>
    </ActivityLayout>
  );
}
