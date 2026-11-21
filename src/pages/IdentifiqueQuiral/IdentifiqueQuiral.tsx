import illustration from "../../assets/ident-quiral.svg";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import type { Answer } from "../../domain/expedition";
import "./IdentifiqueQuiral.css";

const question: Question = {
  prompt: "Qual modelo representa um carbono quiral?",
  options: [
    "M1",
    "M2",
    "M3",
  ],
  correct: 1,
  explanation: "Em CHClBrF, os ligantes H, Cl, Br e F são todos distintos.",
};

export function IdentifiqueQuiral({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <GuidedActivity
      className="identifique-quiral"
      frame="2003:709"
      stage="Atividade de identificação · Carão central quiral"
      title="IDENTIFIQUE O QUIRAL"
      guidance="Observe os três modelos. Identifique aquele que tem um carbono ligado a quatro grupos diferentes."
    >
      <ChoiceQuestion
        className="guided-activity__card"
        question={question}
        onContinue={onContinue}
        verifyLabel="VERIFICAR RESPOSTA"
        continueLabel="CONTINUAR"
        illustration={
          <img
            className="guided-activity__illustration"
            src={illustration}
            width="364"
            height="269"
            alt="Três modelos moleculares para comparação"
          />
        }
      />
    </GuidedActivity>
  );
}
