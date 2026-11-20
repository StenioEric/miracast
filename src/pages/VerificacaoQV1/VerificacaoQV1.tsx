import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV1.css";

const question: Question = {
  prompt: "Quando um objeto rígido gira, o que muda?",
  options: ["Sua orientação no espaço", "A forma do objeto", "A identidade do objeto"],
  correct: 0,
  explanation: "Uma rotação rígida muda a orientação. As distâncias e os ângulos internos permanecem iguais.",
};

export function VerificacaoQV1({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv1">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
