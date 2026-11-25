import { expeditionSteps, stepTitle } from "../../domain/expedition";
import type { Answer, ExpeditionStep } from "../../domain/expedition";
import { classificationItems, questions } from "../../domain/questions";
import type { Question } from "../../domain/questions";

function feedbackFor(step: ExpeditionStep, answer: Answer) {
  if (step === "classification") {
    return classificationItems.map(({ name, explanation }) => `${name}. ${explanation}`).join(" ");
  }
  const question = (questions as Partial<Record<ExpeditionStep, Question>>)[step];
  if (!question) return undefined;

  const option = question.options.find(({ value }) =>
    value === answer.value || (step === "build-molecule" && answer.value.endsWith(`\n${value}`)));
  return (option ?? question.options[question.correct])?.explanation;
}

export function AnswerReview({ answers }: { answers: Partial<Record<ExpeditionStep, Answer>> }) {
  const answered = expeditionSteps.flatMap((step) => {
    const answer = answers[step];
    return answer ? [{ step, answer }] : [];
  });
  if (!answered.length) return null;

  return <details className="answer-review">
    <summary>Rever respostas e explicações</summary>
    <dl>
      {answered.map(({ step, answer }) => {
        const feedback = feedbackFor(step, answer);
        return <div key={step}>
          <dt>{stepTitle(step)}</dt>
          <dd>
            <p>Sua resposta</p>
            <p className="answer-review__value">{answer.value}</p>
            <p><strong>{answer.correct === undefined ? "Resposta aberta" : answer.correct ? "Correta" : "Incorreta"}</strong></p>
            {feedback && <p>{feedback}</p>}
          </dd>
        </div>;
      })}
    </dl>
  </details>;
}
