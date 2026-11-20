import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./IdentifiqueQuiral.css";

const question: Question = {
  prompt: "Qual modelo tem um carbono tetraédrico com quatro ligantes diferentes?",
  options: ["CHClBrF", "CH₂ClBr", "CH₄"],
  correct: 0,
  explanation: "Em CHClBrF, os ligantes H, Cl, Br e F são todos distintos. Os outros exemplos repetem H.",
};

export function IdentifiqueQuiral({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="identify-chiral">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
