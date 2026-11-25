import { useStudentDraft } from "../../components/StudentWork/studentWork";
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
  const [answer, setAnswer] = useStudentDraft("rotation-answer", "");
  const [selectedIdeas, setSelectedIdeas] = useStudentDraft<string[]>("rotation-ideas", []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (answer.trim() && remaining >= 0) onContinue({ value: answer.trim() + ideas });
  };

  const toggleIdea = (idea: string) => {
    setSelectedIdeas((selected) =>
      selected.includes(idea)
        ? selected.filter((item) => item !== idea)
        : [...selected, idea],
    );
  };

  const ideas = selectedIdeas.length ? `\nIdeias de apoio: ${selectedIdeas.join(", ")}` : "";
  const remaining = 2000 - [...(answer.trim() + ideas)].length;

  return (
    <ActivityLayout
      step="rotation-identity"
      title="Missão 1.2 — Girar muda a identidade?"
      guidance="Observe o cubo girando. O objeto mudou de identidade ao girar? Explique em uma frase."
      footer={<PageFooter>
        <Button form="resposta-giro" type="submit" disabled={!answer.trim() || remaining < 0}>Salvar resposta e continuar</Button>
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
              onChange={(event) => setAnswer(event.target.value)}
              aria-describedby="limite-resposta-giro"
              placeholder="Escreva sua resposta..."
              required
            />
          </label>

          <p id="limite-resposta-giro" className={remaining < 0 ? "app-error" : undefined}>
            {remaining < 0 ? `Reduza a resposta em ${-remaining} caracteres.` : `${remaining} caracteres disponíveis, incluindo as ideias de apoio.`}
          </p>

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
