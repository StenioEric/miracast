import illustration from "../../assets/verif-qv1b.svg";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV1b.css";

const question: Question = {
  prompt: "Uma imagem no espelho pode ser obtida girando o objeto original?",
  options: [
    "Sim — basta girar o objeto até que ele coincida",
    "Não — objetos quirais não podem ser sobrepostos à imagem especular",
  ],
  correct: 1,
  explanation: "Em objetos quirais, girar não transforma o original na sua imagem especular. Eles não podem ser sobrepostos por rotação.",
};

export function VerificacaoQV1b({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <GuidedActivity
      className="verificacao-qv1b"
      frame="2003:2"
      stage="Verificação · Ação Material Concreta"
      title="VERIFICAÇÃO Q.V1b"
      guidance="Compare o objeto com a imagem no espelho. Girar resolve o espelhamento?"
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
            height="214"
            alt="Objeto original e sua imagem especular"
          />
        }
      />
    </GuidedActivity>
  );
}
