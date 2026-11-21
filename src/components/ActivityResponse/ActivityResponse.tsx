import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { Answer } from "../../domain/expedition";
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
  className?: string;
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
  className = "activity-card",
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
    <div className={`choice-question ${className}`.trim()}>
      <div className="choice-question__content">
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
      </div>
      <button className="flow-button" type="button" disabled={selected === null} onClick={handleAction}>
        {actionLabel}
      </button>
    </div>
  );
}
