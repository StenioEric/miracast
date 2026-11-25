import { useStudentDraft } from "../StudentWork/studentWork";
import { chclbrf } from "../../utils/moleculeGeometry";
import { Molecule, RotatableMolecule } from "./Molecule";

export function MoleculeComparison() {
  const [overlay, setOverlay] = useStudentDraft("overlay", false);
  return <>
    <div className="activity-models">
      <div>
        <h3>Modelo original</h3>
        <Molecule ligands={chclbrf} label="Modelo original de CHClBrF" />
      </div>
      <div>
        <h3>Imagem no espelho</h3>
        <RotatableMolecule ligands={chclbrf} mirror overlay={overlay} label="Imagem espelhada de CHClBrF" />
      </div>
    </div>
    <label><input type="checkbox" checked={overlay} onChange={(event) => setOverlay(event.target.checked)} />
      {" "}Mostrar o modelo original sobre a imagem espelhada
    </label>
  </>;
}
