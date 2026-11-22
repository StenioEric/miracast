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

type ChoiceQuestionProps = {
  question: Question;
  onContinue: (answer: Answer) => void;
  onEvaluate?: (correct: boolean) => void;
  requireCorrect?: boolean;
  reviewOnSelect?: boolean;
  illustration?: ReactNode;
  optionsOutsideCard?: boolean;
  incorrectContinueLabel?: string;
};

export function ChoiceQuestion({
  question,
  onContinue,
  onEvaluate,
  requireCorrect = false,
  reviewOnSelect = false,
  illustration,
  optionsOutsideCard = false,
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

  const responses = <>
    <fieldset
      ref={optionsRef}
      className="activity-options"
      disabled={submitted}
      aria-labelledby={optionsOutsideCard ? groupName : undefined}
    >
      {!optionsOutsideCard && <legend>{question.prompt}</legend>}
      {question.options.map((option, index) => (
        <AnswerOption key={option.value} name={groupName} label={option.label ?? option.value}
          selected={selected === index} correct={feedback?.answer.correct} onSelect={() => setSelected(index)} />
      ))}
    </fieldset>
    <AnswerFeedback ref={feedbackRef} correct={feedback?.answer.correct}>
      {feedback && <p>{feedback.explanation}</p>}
    </AnswerFeedback>
  </>;

  return (
    <div className="choice-question">
      <ContentCard>
        {optionsOutsideCard && <h2 id={groupName}>{question.prompt}</h2>}
        {illustration}
        {!optionsOutsideCard && responses}
      </ContentCard>
      {optionsOutsideCard && responses}
      <PageFooter>
        <Button disabled={!evaluated} onClick={handleAction}>{actionLabel}</Button>
      </PageFooter>
    </div>
  );
}
