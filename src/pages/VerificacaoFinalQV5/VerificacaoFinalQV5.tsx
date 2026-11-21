import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoFinalQV5.css";

export function VerificacaoFinalQV5({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv5">
      <ChoiceQuestion question={questions["qv5"]} onContinue={onContinue} />
    </ActivityLayout>
  );
}
