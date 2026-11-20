import { useState } from "react";

import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Molecule } from "../../components/Molecule/Molecule";
import type { Answer } from "../../domain/expedition";
import { chclbrf } from "../../utils/moleculeGeometry";
import type { Ligands } from "../../utils/moleculeGeometry";
import "./MonteCHClBrF.css";

export function MonteCHClBrF({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [ligands, setLigands] = useState<Ligands>(["", "", "", ""]);
  const complete = chclbrf.every((atom) => ligands.includes(atom));
  return (
    <ActivityLayout step="build-molecule" frameInContent>
      <section className="activity-card" data-node-id={complete ? "2003:865" : "2003:914"}>
        <h2>{complete ? "Quatro átomos posicionados" : "Monte a molécula"}</h2>
        <p>Preencha as quatro posições em torno do carbono com H, Cl, Br e F, usando cada átomo uma vez.</p>
        <Molecule ligands={ligands} label="Esquema tetraédrico com quatro posições ao redor do carbono" />
        <div className="activity-slots">
          {ligands.map((ligand, index) => (
            <label key={index} className="activity-field">
              Posição {index + 1}
              <select value={ligand} onChange={(event) => {
                const updated: [string, string, string, string] = [...ligands];
                updated[index] = event.target.value;
                setLigands(updated);
              }}>
                <option value="">Escolha</option>
                {chclbrf.map((atom) => <option key={atom} disabled={ligands.includes(atom) && atom !== ligand}>{atom}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div role="status">{complete && <p className="activity-feedback">O carbono está ligado a quatro átomos diferentes.</p>}</div>
        <button className="flow-button" type="button" disabled={!complete}
          onClick={() => onContinue({ value: ligands.join(", "), correct: true })}>Continuar</button>
      </section>
    </ActivityLayout>
  );
}
