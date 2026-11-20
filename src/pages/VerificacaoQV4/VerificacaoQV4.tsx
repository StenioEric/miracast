import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV4.css";

const question: Question = {
  prompt: "Quais são os quatro ligantes do carbono quiral do ácido lático?",
  options: ["H, OH, CH₃ e COOH", "H, H, OH e COOH", "H, OH, OH e CH₃"],
  correct: 0,
  explanation: "A fórmula condensada CH₃–CH(OH)–COOH mostra que o carbono central está ligado a H, OH, CH₃ e COOH.",
};

export function VerificacaoQV4({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv4">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
