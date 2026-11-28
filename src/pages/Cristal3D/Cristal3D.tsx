import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { MoleculeComparison } from "../../components/Molecule/MoleculeComparison";
import { MoleculeViewerButton } from "../../components/MoleculeViewer/MoleculeViewerButton";
import { bromochlorofluoromethane } from "../../utils/moleculeGeometry";

export function Cristal3D({ onContinue }: { onContinue: (answer: Answer) => void }) {

  return (
    <ActivityLayout
      step="augmented-reality"
      title="Compare as duas formas do cristal"
      guidance="Gire a imagem espelhada e use a referência sobreposta para comparar a posição dos ligantes."
    >
      <ContentCard>
        <h2>Modelo interativo do cristal</h2>
        <MoleculeComparison />
        <MoleculeViewerButton title="O Cristal em 3D" label="Explorar o cristal em 3D" molecule={bromochlorofluoromethane} />
      </ContentCard>
      <ChoiceQuestion
        question={questions["augmented-reality"]}
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
