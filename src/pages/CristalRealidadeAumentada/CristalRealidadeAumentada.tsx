import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import { RotatableMolecule } from "../../components/Molecule/Molecule";
import { chclbrf } from "../../utils/moleculeGeometry";
import "./CristalRealidadeAumentada.css";

export function CristalRealidadeAumentada({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="augmented-reality"
      footer={<PageFooter><Button onClick={() => onContinue({ value: "Visualização alternativa em tela." })}>Continuar para a verificação final</Button></PageFooter>}
    >
      <ContentCard>
        <h2>Experiência alternativa</h2>
        <p>A visualização pela câmera está indisponível nesta versão. Explore o modelo molecular interativo na tela antes da última verificação.</p>
        <RotatableMolecule ligands={chclbrf} label="Modelo tetraédrico explorável na tela" />
      </ContentCard>
    </ActivityLayout>
  );
}
