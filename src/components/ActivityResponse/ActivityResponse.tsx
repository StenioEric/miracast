import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { evaluateQuestion } from "../../domain/questions";
import type { Question } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { Button } from "../Button/Button";
import { ContentCard } from "../ContentCard/ContentCard";
import { PageFooter } from "../PageLayout/PageLayout";
import { AnswerFeedback } from "./AnswerFeedback";
import { AnswerOption } from "./AnswerOption";
import "./ActivityResponse.css";

type IllustrationSelection = {
  selected: number | null;
  disabled: boolean;
  onSelect: (index: number) => void;
};

type ChoiceQuestionProps = {
  question: Question;
  onContinue: (answer: Answer) => void;
  onEvaluate?: (correct: boolean) => void;
  requireCorrect?: boolean;
  reviewOnSelect?: boolean;
  illustration?: ReactNode | ((selection: IllustrationSelection) => ReactNode);
  incorrectContinueLabel?: string;
};

export function ChoiceQuestion({
  question,
  onContinue,
  onEvaluate,
  requireCorrect = false,
  reviewOnSelect = false,
  illustration,
  incorrectContinueLabel = "Continuar",
}: ChoiceQuestionProps) {
  const groupName = useId();
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const evaluated = selected === null ? undefined : evaluateQuestion(question, selected);
  const needsConfirmation = !reviewOnSelect && !submitted;
  const feedback = needsConfirmation ? undefined : evaluated;
  const retry = feedback?.answer.correct === false && requireCorrect;
  let actionLabel = feedback?.answer.correct === false ? incorrectContinueLabel : "Continuar";
  if (needsConfirmation) actionLabel = "Verificar resposta";
  if (retry) actionLabel = "Tentar novamente";

  function handleAction() {
    if (!evaluated) return;
    if (needsConfirmation) {
      setSubmitted(true);
      onEvaluate?.(evaluated.answer.correct);
      requestAnimationFrame(() => feedbackRef.current?.focus());
    } else if (retry) {
      setSelected(null);
      setSubmitted(false);
      requestAnimationFrame(() => optionsRef.current?.querySelector("input")?.focus());
    } else {
      onContinue(evaluated.answer);
    }
  }

  return (
    <div className="choice-question">
      <ContentCard>
        {typeof illustration === "function"
          ? illustration({ selected, disabled: submitted, onSelect: setSelected })
          : illustration}
        <fieldset ref={optionsRef} className="activity-options" disabled={submitted}>
          <legend>{question.prompt}</legend>
          {question.options.map((option, index) => (
            <AnswerOption key={option.value} name={groupName} label={option.label ?? option.value}
              selected={selected === index} correct={feedback?.answer.correct} onSelect={() => setSelected(index)} />
          ))}
        </fieldset>
        <AnswerFeedback ref={feedbackRef} correct={feedback?.answer.correct}>
          {feedback && <p>{feedback.explanation}</p>}
        </AnswerFeedback>
      </ContentCard>
      <PageFooter>
        <Button disabled={!evaluated} onClick={handleAction}>{actionLabel}</Button>
      </PageFooter>
    </div>
  );
}
