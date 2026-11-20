import { useState } from "react";

import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { RotatableMolecule } from "../../components/Molecule/Molecule";
import type { Answer } from "../../domain/expedition";
import { chclbrf } from "../../utils/moleculeGeometry";
import "./SeRepetir.css";

export function SeRepetir({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [replaced, setReplaced] = useState(false);
  return (
    <ActivityLayout step="repeat-ligand">
      <section className="activity-card">
        <h2>{replaced ? "CH₂ClBr" : "CHClBrF"}</h2>
        <RotatableMolecule ligands={replaced ? ["H", "Cl", "Br", "H"] : chclbrf} label="Modelo do carbono e seus quatro ligantes" />
        {!replaced && <button className="flow-button" type="button" onClick={() => setReplaced(true)}>Substituir F por H</button>}
      </section>
      {replaced && <ChoiceQuestion onContinue={onContinue} question={{
        prompt: "Depois da substituição, esse carbono permanece um centro quiral?",
        options: ["Sim, ainda há quatro ligações", "Não, há dois hidrogênios iguais"],
        correct: 1,
        explanation: "Esse carbono tem dois ligantes iguais. A troca desses dois hidrogênios não produz uma nova forma espacial.",
      }} />}
    </ActivityLayout>
  );
}
