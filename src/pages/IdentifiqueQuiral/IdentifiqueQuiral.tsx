import illustration from "../../assets/ident-quiral.svg";
import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
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
    <ActivityLayout
      step="identify-chiral"
      frame="2003:709"
      stage="Atividade de identificação · Carbono central quiral"
      guidance="Observe os três modelos. Identifique aquele que tem um carbono ligado a quatro grupos diferentes."
    >
      <ChoiceQuestion
        question={question}
        onContinue={onContinue}
        illustration={
          <img
            className="activity-illustration"
            src={illustration}
            width="364"
            height="269"
            alt="Três modelos moleculares para comparação"
          />
        }
      />
    </ActivityLayout>
  );
}
