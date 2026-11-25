import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV4.css";

export function VerificacaoQV4({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv4"
      title="VERIFICAÇÃO Q.V4"
      guidance={'Um estudante olhou os dois enantiômeros do ácido lático e disse: "são iguais — têm os mesmos átomos, só estão desenhados invertidos". Qual o erro fundamental?'}
    >
      <ChoiceQuestion
        question={questions["qv4"]}
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
