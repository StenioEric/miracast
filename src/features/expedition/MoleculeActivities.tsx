import { useState } from "react";

import { Molecule, RotatableMolecule } from "./Molecule";
import { chclbrf, lactateLigands } from "./moleculeGeometry";
import type { Ligands } from "./moleculeGeometry";
import { ChoiceQuestion } from "./Response";
import type { Answer } from "./steps";

type Submit = { onContinue: (answer: Answer) => void };

export function BuildMolecule({ onContinue }: Submit) {
  const [ligands, setLigands] = useState<Ligands>(["", "", "", ""]);
  const complete = chclbrf.every((atom) => ligands.includes(atom));
  return (
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
  );
}

export function RepeatLigand({ onContinue }: Submit) {
  const [replaced, setReplaced] = useState(false);
  return (
    <>
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
    </>
  );
}

export function Superposition({ onContinue }: Submit) {
  const [overlay, setOverlay] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <div className="activity-comparison" data-node-id={checked ? "2003:623" : "2003:1089"}>
      <section className="activity-card">
        <h2>{checked ? "Correto: as imagens não se sobrepõem" : "Compare com a imagem no espelho"}</h2>
        <p>Gire a imagem espelhada para comparar a posição dos quatro ligantes com a do modelo original.</p>
        <div className="activity-models">
          <Molecule ligands={chclbrf} label="Modelo original de CHClBrF" />
          <RotatableMolecule ligands={chclbrf} mirror overlay={overlay} label="Imagem espelhada de CHClBrF" />
        </div>
        <label><input type="checkbox" checked={overlay} onChange={(event) => setOverlay(event.target.checked)} /> Mostrar a referência no mesmo diagrama</label>
      </section>
      <ChoiceQuestion requireCorrect onEvaluate={setChecked} onContinue={onContinue} question={{
        prompt: "É possível alinhar simultaneamente os quatro ligantes correspondentes só girando o modelo espelhado?",
        options: ["Sim, os quatro ligantes podem coincidir", "Não, os modelos são imagens especulares não sobreponíveis"],
        correct: 1,
        explanation: "Um espelhamento inverte o arranjo dos ligantes. A rotação preserva esse arranjo, por isso o alinhamento simultâneo é impossível.",
      }} />
    </div>
  );
}

export function LacticAcid({ onContinue }: Submit) {
  const [mirror, setMirror] = useState(false);
  return (
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
  );
}
