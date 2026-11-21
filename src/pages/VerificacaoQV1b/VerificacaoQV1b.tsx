import illustration from "../../assets/verif-qv1b.svg";
import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV1b.css";

export function VerificacaoQV1b({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv1b"
      frame="2003:2"
      stage="Verificação · Ação Material Concreta"
      guidance="Compare o objeto com a imagem no espelho. Girar resolve o espelhamento?"
    >
      <ChoiceQuestion
        question={questions["qv1b"]}
        onContinue={onContinue}
        incorrectContinueLabel="Continuar mesmo assim"
        illustration={
          <img
            className="activity-illustration"
            src={illustration}
            width="364"
            height="214"
            alt="Objeto original e sua imagem especular"
          />
        }
      />
    </ActivityLayout>
  );
}
