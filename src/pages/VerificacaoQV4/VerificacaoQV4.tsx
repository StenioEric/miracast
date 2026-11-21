import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV4.css";

export function VerificacaoQV4({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv4">
      <ChoiceQuestion question={questions["qv4"]} onContinue={onContinue} />
    </ActivityLayout>
  );
}
