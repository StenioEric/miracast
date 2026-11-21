import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoFinalQV5.css";

const question: Question = {
  prompt: "Qual procedimento distingue um modelo quiral de um aquiral?",
  options: ["Contar todos os átomos da fórmula", "Comparar a imagem no espelho usando apenas rotações e translações", "Alterar uma ligação até os modelos coincidirem"],
  correct: 1,
  explanation: "A comparação conserva as ligações e a geometria. Se a imagem especular não puder ser sobreposta, o modelo é quiral.",
};

export function VerificacaoFinalQV5({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="qv5">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
