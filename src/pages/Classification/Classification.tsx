import { useState } from "react";

import tabelaClassificacao from "../../assets/tabela_tela3.svg";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import "./Classification.css";

const objects = [
  { id: "folha", name: "Folha de papel", category: "plano" },
  { id: "circulo", name: "Círculo", category: "plano" },
  { id: "cubo", name: "Cubo", category: "espacial" },
  { id: "piramide", name: "Pirâmide", category: "espacial" },
  { id: "esfera", name: "Esfera", category: "espacial" },
] as const;

type ObjectId = (typeof objects)[number]["id"];
type Category = (typeof objects)[number]["category"];

export function Classification({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [answers, setAnswers] = useState<Partial<Record<ObjectId, Category>>>({});
  const [submitted, setSubmitted] = useState(false);
  const allClassified = objects.every(({ id }) => answers[id] !== undefined);
  const correct = objects.every(({ id, category }) => answers[id] === category);

  function chooseCategory(objectId: ObjectId, category: Category) {
    setAnswers((current) => ({ ...current, [objectId]: category }));
    setSubmitted(false);
  }

  function handleAction() {
    if (submitted) {
      onContinue({ value: objects.map(({ id, name }) => `${name}: ${answers[id]}`).join(", "), correct });
    } else {
      setSubmitted(true);
    }
  }

  return (
    <ActivityLayout
      step="classification"
      frame="13:1307"
      stage="Ação Material Concreta · Tela 3"
      title="Missão 1.1 — Plano ou espacial?"
      guidance="Classifique cada representação como plana ou espacial. Considere a folha como uma superfície ideal, sem espessura."
      footer={<PageFooter>
        <Button disabled={!allClassified} onClick={handleAction}>
          {submitted ? "Continuar" : "Classificar todos"}
        </Button>
      </PageFooter>}
    >
      <img className="activity-illustration" src={tabelaClassificacao}
        alt="Galeria com folha, círculo, cubo, pirâmide e esfera." width="367" height="171" />
      {objects.map(({ id, name }) => (
        <ContentCard key={id} aria-labelledby={`classificacao-${id}`}>
          <h2 id={`classificacao-${id}`}>{name}</h2>
          <div className="classificacao__categorias" role="group" aria-label={`Classificação de ${name}`}>
            {(["plano", "espacial"] as const).map((category) => (
              <Button variant="secondary" aria-pressed={answers[id] === category}
                key={category} onClick={() => chooseCategory(id, category)}>
                {category}
              </Button>
            ))}
          </div>
        </ContentCard>
      ))}
      <p role="status">
        {submitted && (correct ? "Classificação correta!" : "Folha e círculo são planos nesta atividade. Cubo, pirâmide e esfera são espaciais.")}
      </p>
    </ActivityLayout>
  );
}
