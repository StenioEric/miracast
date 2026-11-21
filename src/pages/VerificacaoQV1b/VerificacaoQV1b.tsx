import illustration from "../../assets/verif-qv1b.svg";
import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV1b.css";

const question: Question = {
  prompt: "A imagem no espelho de um objeto quiral pode ser obtida girando o objeto original?",
  options: [
    "Sim — basta girar o objeto até que ele coincida",
    "Não — objetos quirais não podem ser sobrepostos à imagem especular",
  ],
  correct: 1,
  explanation: "Em objetos quirais, girar não transforma o original na sua imagem especular. Eles não podem ser sobrepostos por rotação.",
};

export function VerificacaoQV1b({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="qv1b"
      frame="2003:2"
      stage="Verificação · Ação Material Concreta"
      guidance="Compare o objeto com a imagem no espelho. Girar resolve o espelhamento?"
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
            height="214"
            alt="Objeto original e sua imagem especular"
          />
        }
      />
    </ActivityLayout>
  );
}
