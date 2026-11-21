import illustration from "../../assets/forma-ativa.svg";
import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./FormaAtiva.css";

const question: Question = {
  prompt: "As duas formas de CHClBrF desviam a luz polarizada de modos:",
  options: [
    "A. Idênticos — desviam a luz para o mesmo lado",
    "B. Opostos — uma desvia para a direita (+), a outra para a esquerda (−)",
    "C. Nenhuma das formas desvia a luz",
    "D. Aleatórios — depende da temperatura",
  ],
  correct: 1,
};

export function FormaAtiva({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="active-form"
      frame="2003:1008"
      stage="Ação Verbalizada · Tela 14"
      title="Missão 3.3 — A forma ativa"
      guidance={
        <>
          Dois frascos: (+) e (−), pelo desvio da luz.<br />
          Somente uma forma desvia a luz para a direita. Observe a posição do Br em cada forma.
        </>
      }
    >
      <ChoiceQuestion
        question={question}
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
