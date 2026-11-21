import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { Answer } from "../../domain/expedition";
import { Button } from "../Button/Button";
import { ContentCard } from "../ContentCard/ContentCard";
import { PageFooter } from "../PageLayout/PageLayout";
import "./ActivityResponse.css";

export type Question = {
  prompt: string;
  options: readonly [string, string, ...string[]];
  correct: number;
  explanation?: string;
};

type ChoiceQuestionProps = {
  question: Question;
  onContinue: (answer: Answer) => void;
  onEvaluate?: (correct: boolean) => void;
  requireCorrect?: boolean;
  illustration?: ReactNode;
  verifyLabel?: string;
  continueLabel?: string;
  incorrectContinueLabel?: string;
};

export function ChoiceQuestion({
  question,
  onContinue,
  onEvaluate,
  requireCorrect,
  illustration,
  verifyLabel = "Verificar resposta",
  continueLabel = "Continuar",
  incorrectContinueLabel = continueLabel,
}: ChoiceQuestionProps) {
  const groupName = useId();
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === question.correct;
  const needsReview = question.explanation !== undefined && !submitted;
  const retry = submitted && requireCorrect && !correct;
  let actionLabel = correct ? continueLabel : incorrectContinueLabel;
  if (needsReview) actionLabel = verifyLabel;
  if (retry) actionLabel = "Tentar novamente";

  function handleAction() {
    if (selected === null) return;
    if (needsReview) {
      setSubmitted(true);
      onEvaluate?.(correct);
    } else if (retry) {
      setSelected(null);
      setSubmitted(false);
      requestAnimationFrame(() => optionsRef.current?.querySelector("input")?.focus());
    } else {
      onContinue({ value: question.options[selected], correct });
    }
  }

  return (
    <div className="choice-question">
      <ContentCard>
        {illustration}
        <fieldset ref={optionsRef} className="activity-options" disabled={submitted}>
          <legend>{question.prompt}</legend>
          {question.options.map((option, index) => (
            <label key={option} data-selected={selected === index}>
              <input
                type="radio"
                name={groupName}
                checked={selected === index}
                onChange={() => setSelected(index)}
              />
              {option}
            </label>
          ))}
        </fieldset>
        <div role="status">
          {submitted && (
            <p className="activity-feedback" data-correct={correct}>
              <strong>{correct ? "Resposta correta. " : "Vamos revisar. "}</strong>
              {question.explanation}
            </p>
          )}
        </div>
      </ContentCard>
      <PageFooter>
        <Button disabled={selected === null} onClick={handleAction}>{actionLabel}</Button>
      </PageFooter>
    </div>
  );
}
