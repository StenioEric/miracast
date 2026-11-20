import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV3.css";

const question: Question = {
  prompt: "O rótulo R, por si só, indica que uma substância desvia a luz para qual lado?",
  options: ["Sempre para a direita", "Sempre para a esquerda", "O sentido precisa ser determinado experimentalmente"],
  correct: 2,
  explanation: "R e S descrevem a configuração espacial. Os sinais (+) e (−) descrevem o sentido observado da rotação óptica.",
};

export function VerificacaoQV3({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv3">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
