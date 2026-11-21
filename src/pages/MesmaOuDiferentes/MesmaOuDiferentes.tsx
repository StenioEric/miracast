import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./MesmaOuDiferentes.css";

const question: Question = {
  prompt: "As duas formas espelhadas do ácido lático têm a mesma conectividade e não se sobrepõem. Qual é a relação entre elas?",
  options: ["São a mesma forma em ângulos diferentes", "São enantiômeros", "São isômeros com conectividades diferentes"],
  correct: 1,
  explanation: "Enantiômeros são imagens especulares não sobreponíveis e têm a mesma conectividade.",
};

export function MesmaOuDiferentes({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="compare-forms">
      <ChoiceQuestion question={question} onContinue={onContinue} />
    </ActivityLayout>
  );
}
