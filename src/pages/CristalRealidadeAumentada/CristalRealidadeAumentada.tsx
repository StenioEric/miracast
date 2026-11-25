import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { MoleculeComparison } from "../../components/Molecule/MoleculeComparison";
import { ContentCard } from "../../components/ContentCard/ContentCard";

export function CristalRealidadeAumentada({ onContinue }: { onContinue: (answer: Answer) => void }) {

  return (
    <ActivityLayout
      step="augmented-reality"
      title="Compare as duas formas do cristal"
      guidance="Gire a imagem espelhada e use a referência sobreposta para comparar a posição dos ligantes."
    >
      <ContentCard>
        <h2>Modelo interativo do cristal</h2>
        <p>A realidade aumentada ainda está indisponível. Explore as duas formas no modelo abaixo.</p>
        <MoleculeComparison />
      </ContentCard>
      <ChoiceQuestion
        question={questions["augmented-reality"]}
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
