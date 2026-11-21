import type { Answer } from "../../domain/expedition";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import "./VerificacaoQV2.css";

const question: Question = {
  prompt: "Qual molécula possui carbono quiral?",
  options: [
    "A. M1 (H, H, Cl, F) — tem hidrogênio e flúor, átomos bem diferentes",
    "B. M2 (H, Cl, Br, F) — quatro átomos todos diferentes entre si",
    "C. M3 (Cl, Cl, Br, H) — tem três tipos de átomos diferentes",
    "D. M4 (F, F, F, Cl) — tem flúor, o átomo mais eletronegativo",
  ],
  correct: 1,
};

export function VerificacaoQV2({ onContinue }: { onContinue: (answer: Answer) => void }) {

  return (
    <ActivityLayout
      step="qv2"
      frame="2003:670"
      stage="Verificação · Tela 11"
      guidance="Quatro moléculas. Qual possui um carbono quiral?"
    >
      <ChoiceQuestion
        question={question}
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
