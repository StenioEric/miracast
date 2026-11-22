import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoFinalQV5.css";

export function VerificacaoFinalQV5({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv5"
      stage="Verificação Síntese · Tela 20"
      title="VERIFICAÇÃO FINAL Q.V5"
      guidance="A síntese da expedição: por que o cristal tem duas formas que desviam a luz em direções opostas?"
    >
      <ChoiceQuestion
        question={questions["qv5"]}
        reviewOnSelect
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
