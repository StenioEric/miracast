import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { RotatableMolecule } from "../../components/Molecule/Molecule";
import type { Answer } from "../../domain/expedition";
import { chclbrf } from "../../utils/moleculeGeometry";
import "./CristalRealidadeAumentada.css";

export function CristalRealidadeAumentada({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout step="augmented-reality">
      <section className="activity-card">
        <h2>Experiência alternativa</h2>
        <p>A visualização pela câmera está indisponível nesta versão. Explore o modelo molecular interativo na tela antes da última verificação.</p>
        <RotatableMolecule ligands={chclbrf} label="Modelo tetraédrico explorável na tela" />
        <button className="flow-button" type="button" onClick={() => onContinue({ value: "Visualização alternativa em tela." })}>
          Continuar para a verificação final
        </button>
      </section>
    </ActivityLayout>
  );
}
