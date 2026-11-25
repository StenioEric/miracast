import { useState } from "react";

import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { Molecule, RotatableMolecule } from "../../components/Molecule/Molecule";
import { chclbrf } from "../../utils/moleculeGeometry";
import "./TenteSobrepor.css";

export function TenteSobrepor({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [overlay, setOverlay] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <ActivityLayout step="superposition" title="Tente sobrepor" frameInContent>
      <div className="activity-comparison" data-node-id={checked ? "2003:623" : "2003:1089"}>
        <ContentCard>
          <h2>{checked ? "Correto: as imagens não se sobrepõem" : "Compare com a imagem no espelho"}</h2>
          <p>Gire a imagem espelhada para comparar a posição dos quatro ligantes com a do modelo original.</p>
          <div className="activity-models">
            <Molecule ligands={chclbrf} label="Modelo original de CHClBrF" />
            <RotatableMolecule ligands={chclbrf} mirror overlay={overlay} label="Imagem espelhada de CHClBrF" />
          </div>
          <label><input type="checkbox" checked={overlay} onChange={(event) => setOverlay(event.target.checked)} /> Mostrar a referência no mesmo diagrama</label>
        </ContentCard>
        <ChoiceQuestion onEvaluate={setChecked} onContinue={onContinue} question={questions["superposition"]} />
      </div>
    </ActivityLayout>
  );
}
