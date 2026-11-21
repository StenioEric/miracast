import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV3.css";

export function VerificacaoQV3({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv3"
      frame="2003:968"
      stage="Verificação · Tela 13"
      guidance="Quatro estudantes explicaram por que o CHClBrF e seu enantiômero não são a mesma molécula. Qual explicação está conceitualmente correta?"
    >
      <ChoiceQuestion
        question={questions["qv3"]}
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
