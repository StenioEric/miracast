import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./MesmaOuDiferentes.css";

export function MesmaOuDiferentes({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="compare-forms">
      <ChoiceQuestion question={questions["compare-forms"]} onContinue={onContinue} />
    </ActivityLayout>
  );
}
