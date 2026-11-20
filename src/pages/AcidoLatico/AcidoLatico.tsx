import { useState } from "react";

import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { RotatableMolecule } from "../../components/Molecule/Molecule";
import type { Answer } from "../../domain/expedition";
import { lactateLigands } from "../../utils/moleculeGeometry";
import "./AcidoLatico.css";

export function AcidoLatico({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [mirror, setMirror] = useState(false);
  return (
    <ActivityLayout step="lactic-acid">
      <section className="activity-card">
        <h2>CH₃–CH(OH)–COOH</h2>
        <p>Observe os quatro grupos ligados ao carbono central e compare as duas formas.</p>
        <RotatableMolecule ligands={lactateLigands} mirror={mirror}
          label={mirror ? "Imagem espelhada do modelo do ácido lático" : "Modelo do carbono central do ácido lático"} />
        <button className="flow-link" type="button" aria-pressed={mirror}
          onClick={() => setMirror((current) => !current)}>Imagem espelhada</button>
        <button className="flow-button" type="button"
          onClick={() => onContinue({ value: "Modelo do ácido lático consultado." })}>Continuar</button>
      </section>
    </ActivityLayout>
  );
}
