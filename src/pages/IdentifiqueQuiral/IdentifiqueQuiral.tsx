import illustration from "../../assets/ident-quiral.svg";
import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./IdentifiqueQuiral.css";

export function IdentifiqueQuiral({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="identify-chiral"
      frame="2003:709"
      guidance="Observe os três modelos. Identifique aquele que tem um carbono ligado a quatro grupos diferentes."
    >
      <ChoiceQuestion
        question={questions["identify-chiral"]}
        onContinue={onContinue}
        illustration={
          <img
            className="activity-illustration"
            src={illustration}
            width="364"
            height="269"
            alt="M1: H, H, Cl e F. M2: H, Cl, Br e F. M3: Br, Cl, Cl e H."
          />
        }
      />
    </ActivityLayout>
  );
}
