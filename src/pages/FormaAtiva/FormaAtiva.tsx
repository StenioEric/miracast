import illustration from "../../assets/forma-ativa.svg";
import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./FormaAtiva.css";

export function FormaAtiva({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="active-form"
      frame="2003:1008"
      title="Missão 3.3 — A forma ativa"
      guidance={
        <>
          Dois frascos: (+) e (−), pelo desvio da luz.<br />
          Observe na ilustração o sentido do desvio indicado para cada forma.
        </>
      }
    >
      <ChoiceQuestion
        question={questions["active-form"]}
        onContinue={onContinue}
        illustration={
          <img
            className="activity-illustration"
            src={illustration}
            width="364"
            height="217"
            alt="Comparação das duas formas CHClBrF pela luz polarizada"
          />
        }
      />
    </ActivityLayout>
  );
}
