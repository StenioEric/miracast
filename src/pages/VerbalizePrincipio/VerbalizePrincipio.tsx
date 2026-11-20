import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { WrittenResponse } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
import "./VerbalizePrincipio.css";

export function VerbalizePrincipio({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="explain-chirality">
      <WrittenResponse
        prompt="Como você explicaria a quiralidade a outro estudante?"
        guidance="Compare o que acontece com o modelo ao girá-lo e ao espelhá-lo. Inclua a ideia de sobreposição."
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
