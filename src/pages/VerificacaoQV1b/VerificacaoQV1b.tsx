import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV1b.css";

const question: Question = {
  prompt: "Uma imagem no espelho pode sempre ser obtida girando o objeto original?",
  options: ["Sim, basta encontrar o ângulo", "Não, objetos quirais são um contraexemplo"],
  correct: 1,
  explanation: "Um objeto quiral e sua imagem especular não coincidem por rotação e translação.",
};

export function VerificacaoQV1b({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv1b">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
