import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV2.css";

const question: Question = {
  prompt: "Por que substituir F por H nesse modelo elimina o centro quiral?",
  options: ["Porque o carbono deixa de ter quatro ligações", "Porque o carbono passa a ter dois ligantes idênticos", "Porque o carbono perde a geometria tetraédrica"],
  correct: 1,
  explanation: "A substituição mantém as quatro ligações e deixa dois hidrogênios equivalentes nesse carbono.",
};

export function VerificacaoQV2({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv2">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
