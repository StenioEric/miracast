import enantiomers from "../../assets/enantiomeros-acido-latico.svg";
import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./MesmaouDiferentes.css";

export function MesmaOuDiferentes({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="compare-forms"
      title="MISSÃO 4.2 MESMA OU DIFERENTES?"
      guidance="Os dois enantiômeros do ácido lático, lado a lado. São a mesma substância ou substâncias diferentes?"
    >
      <ChoiceQuestion
        question={questions["compare-forms"]}
        onContinue={onContinue}
        illustration={
          <img
            className="activity-illustration"
            src={enantiomers}
            width="333"
            height="146"
            alt="Dois enantiômeros do ácido lático separados por um eixo de espelho. Em ambos, CH₃ está acima do carbono central e COOH abaixo. Na primeira forma, OH está à esquerda e H à direita. Na segunda forma, as posições de OH e H estão invertidas."
          />
        }
      />
    </ActivityLayout>
  );
}
