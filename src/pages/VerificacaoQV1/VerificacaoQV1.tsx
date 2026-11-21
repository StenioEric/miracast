import illustration from "../../assets/verif-qv1.svg";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import type { Answer } from "../../domain/expedition";
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
    <GuidedActivity
      className="verificacao-qv1"
      frame="2003:54"
      stage="Verificação · Ação Material Concreta"
      title="VERIFICAÇÃO Q.V1"
      guidance="Ao girar um objeto rígido, observe com atenção o que realmente mudou."
    >
      <ChoiceQuestion
        className="guided-activity__card"
        question={question}
        onContinue={onContinue}
        verifyLabel="VERIFICAR RESPOSTA"
        continueLabel="CONTINUAR"
        incorrectContinueLabel="CONTINUAR MESMO ASSIM"
        illustration={
          <img
            className="guided-activity__illustration"
            src={illustration}
            width="364"
            height="225"
            alt="Rotação rígida de um objeto no espaço"
          />
        }
      />
    </GuidedActivity>
  );
}
