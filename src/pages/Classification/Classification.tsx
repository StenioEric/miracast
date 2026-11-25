import { useStudentDraft } from "../../components/StudentWork/studentWork";
import { useRef } from "react";

import tabelaClassificacao from "../../assets/tabela_tela3.svg";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { AnswerFeedback } from "../../components/ActivityResponse/AnswerFeedback";
import { AnswerOption } from "../../components/ActivityResponse/AnswerOption";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import type { Answer } from "../../domain/expedition";
import { classificationItems, evaluateClassification } from "../../domain/questions";
import type { Category } from "../../domain/questions";
import "./Classification.css";

type ObjectId = (typeof classificationItems)[number]["id"];

export function Classification({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useStudentDraft<Partial<Record<ObjectId, Category>>>("classification", {});
  const [submitted, setSubmitted] = useStudentDraft("classification-submitted", false);
  const assessment = evaluateClassification(answers);
  const feedback = submitted ? assessment : undefined;

  function chooseCategory(objectId: ObjectId, category: Category) {
    if (submitted) return;
    setAnswers((current) => ({ ...current, [objectId]: category }));
  }

  function handleAction() {
    if (!assessment) return;
    if (submitted) {
      onContinue(assessment.answer);
    } else {
      setSubmitted(true);
      requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  }

  return (
    <ActivityLayout
      step="classification"
      frame="13:1307"
      title="Missão 1.1 — Plano ou espacial?"
      guidance="Classifique cada representação como plana ou espacial. Considere a folha como uma superfície ideal, sem espessura."
      footer={<PageFooter>
        <Button disabled={!assessment} onClick={handleAction}>
          {submitted ? "Continuar" : "Classificar todos"}
        </Button>
      </PageFooter>}
    >
      <img className="activity-illustration" src={tabelaClassificacao}
        alt="Galeria com folha, círculo, cubo, pirâmide e esfera." width="367" height="171" />
      {classificationItems.map(({ id, name, category }) => (
        <ContentCard key={id} aria-label={`Classificação de ${name}`}>
          <fieldset className="activity-options classificacao__categorias" disabled={submitted}>
            <legend>{name}</legend>
            {(["plano", "espacial"] as const).map((option) => (
              <AnswerOption key={option} name={id} label={option} selected={answers[id] === option}
                correct={submitted ? option === category : undefined} onSelect={() => chooseCategory(id, option)} />
            ))}
          </fieldset>
        </ContentCard>
      ))}
      <AnswerFeedback ref={feedbackRef} correct={feedback?.answer.correct}>
        {feedback?.answer.correct ? (
          <p>Folha e círculo foram representados em um plano. Cubo, pirâmide e esfera ocupam três dimensões.</p>
        ) : feedback && (
          <ul className="classificacao__feedback">
            {feedback.mistakes.map(({ id, name, explanation }) => (
              <li key={id}><strong>{name}.</strong> {explanation}</li>
            ))}
          </ul>
        )}
      </AnswerFeedback>
    </ActivityLayout>
  );
}
