import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import { evaluateQuestion } from "../../domain/questions";
import type { Question } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { Button } from "../Button/Button";
import { ContentCard } from "../ContentCard/ContentCard";
import { PageFooter } from "../PageLayout/PageLayout";
import { AnswerFeedback } from "./AnswerFeedback";
import { AnswerOption } from "./AnswerOption";
import { useStudentDraft } from "../StudentWork/studentWork";
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
  illustration?: ReactNode | ((selection: IllustrationSelection) => ReactNode);
  incorrectContinueLabel?: string;
};

export function ChoiceQuestion({
  question,
  onContinue,
  onEvaluate,
  illustration,
  incorrectContinueLabel = "Continuar",
}: ChoiceQuestionProps) {
  const groupName = useId();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useStudentDraft<number | null>("choice", null);
  const [submitted, setSubmitted] = useStudentDraft("choice-submitted", false);
  const evaluated = selected === null ? undefined : evaluateQuestion(question, selected);
  const feedback = submitted ? evaluated : undefined;
  const actionLabel = !submitted ? "Verificar resposta" : feedback?.answer.correct === false ? incorrectContinueLabel : "Continuar";

  useEffect(() => {
    if (submitted) feedbackRef.current?.focus();
  }, [submitted]);

  function submit(correct: boolean) {
    setSubmitted(true);
    onEvaluate?.(correct);
  }

  function selectOption(index: number) {
    if (!submitted && evaluateQuestion(question, index)) setSelected(index);
  }

  function handleAction() {
    if (!evaluated) return;
    if (!submitted) {
      submit(evaluated.answer.correct);
    } else {
      onContinue(evaluated.answer);
    }
  }

  return (
    <div className="choice-question">
      <ContentCard>
        {typeof illustration === "function"
          ? illustration({ selected, disabled: submitted, onSelect: selectOption })
          : illustration}
        <fieldset className="activity-options" disabled={submitted}>
          <legend>{question.prompt}</legend>
          {question.options.map((option, index) => (
            <AnswerOption key={option.value} name={groupName} label={option.label ?? option.value}
              selected={selected === index} correct={feedback?.answer.correct} onSelect={() => selectOption(index)} />
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
