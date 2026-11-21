import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV2.css";

export function VerificacaoQV2({ onContinue }: { onContinue: (answer: Answer) => void }) {

  return (
    <ActivityLayout
      step="qv2"
      frame="2003:670"
      stage="Verificação · Tela 11"
      guidance="Quatro moléculas. Qual possui um carbono quiral?"
    >
      <ChoiceQuestion
        question={questions["qv2"]}
        reviewOnSelect
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
