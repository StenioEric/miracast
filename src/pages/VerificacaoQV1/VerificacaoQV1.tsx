import illustration from "../../assets/verif-qv1.svg";
import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV1.css";

const question: Question = {
  prompt: "Quando um objeto rígido gira, o que muda?",
  options: [
    "A forma do objeto",
    "A orientação do objeto",
    "A identidade do objeto",
  ],
  correct: 1,
  explanation: "Uma rotação rígida muda a orientação do objeto. Forma, tamanho e identidade permanecem iguais.",
};

export function VerificacaoQV1({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv1"
      frame="2003:54"
      stage="Verificação · Ação Material Concreta"
      guidance="Ao girar um objeto rígido, observe com atenção o que realmente mudou."
    >
      <ChoiceQuestion
        question={question}
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
