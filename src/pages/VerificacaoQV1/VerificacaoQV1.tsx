import illustration from "../../assets/verif-qv1.svg";
import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV1.css";

export function VerificacaoQV1({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv1"
      frame="2003:54"
      guidance="Ao girar um objeto rígido, observe com atenção o que realmente mudou."
    >
      <ChoiceQuestion
        question={questions["qv1"]}
        onContinue={onContinue}
        incorrectContinueLabel="Continuar mesmo assim"
        illustration={
          <img
            className="activity-illustration"
            src={illustration}
            width="364"
            height="225"
            alt="Rotação rígida de um objeto no espaço"
          />
        }
      />
    </ActivityLayout>
  );
}
