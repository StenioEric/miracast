import illustration from "../../assets/forma-ativa.svg";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import type { Answer } from "../../domain/expedition";
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
    <GuidedActivity
      className="forma-ativa guided-activity--purple guided-activity--large guided-activity--orange"
      frame="2003:1008"
      stage="Ação Verbalizada · Tela 14"
      title="MISSÃO 3.3 — A FORMA ATIVA"
      guidance={
        <>
          Dois frascos: (+) e (−), pelo desvio da luz.<br />
          Somente uma forma desvia a luz para a direita. Observe a posição do Br em cada forma.
        </>
      }
    >
      <ChoiceQuestion
        className=""
        question={question}
        onContinue={onContinue}
        illustration={
          <img
            className="guided-activity__illustration"
            src={illustration}
            width="364"
            height="217"
            alt="Comparação das duas formas CHClBrF pela luz polarizada"
          />
        }
      />
    </GuidedActivity>
  );
}
