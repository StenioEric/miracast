import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./FormaAtiva.css";

const question: Question = {
  prompt: "Uma amostra gira o plano da luz polarizada. Como descrevemos essa propriedade?",
  options: ["Atividade óptica", "Mudança de conectividade", "Isomeria constitucional"],
  correct: 0,
  explanation: "Atividade óptica é a capacidade da amostra de girar o plano da luz polarizada. O sinal da rotação é medido sob condições definidas.",
};

export function FormaAtiva({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="active-form">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
