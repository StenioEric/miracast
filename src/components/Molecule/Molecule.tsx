import { useState } from "react";

import { chemicalElements, projectPoint, reflectPoint, tetrahedralVertices } from "../../utils/moleculeGeometry";
import type { Ligands } from "../../utils/moleculeGeometry";
import { Button } from "../Button/Button";
import "./Molecule.css";

const initialYaw = 25;
const initialPitch = 15;
const ligandNames: Record<string, string> = {
  H: "hidrogênio (H)", Cl: "cloro (Cl)", Br: "bromo (Br)", F: "flúor (F)",
  OH: "hidroxila (OH)", "CH₃": "metila (CH₃)", COOH: "carboxila (COOH)",
};

const colors: Record<string, string> = {
  H: chemicalElements.H.color, Cl: chemicalElements.Cl.color, Br: chemicalElements.Br.color, F: chemicalElements.F.color,
  OH: "#f7a7ba", "CH₃": "#bedaef", COOH: "#ffd475",
};

export function Molecule({ ligands, yaw = initialYaw, pitch = initialPitch, mirror = false, label, overlay }: {
  ligands: Ligands; yaw?: number; pitch?: number; mirror?: boolean; label: string; overlay?: boolean;
}) {
  function joints(reflected: boolean, angle: number, tilt: number) {
    return tetrahedralVertices.map((point, index) => {
      const [right, up, depth] = projectPoint(reflected ? reflectPoint(point) : point, angle, tilt);
      return { index, x: 120 + 44 * right, y: 106 - 44 * up, depth };
    }).sort((left, right) => left.depth - right.depth);
  }

  const positions = joints(mirror, yaw, pitch);
  const description = ligands.map((ligand, index) => ligand ? ligandNames[ligand] ?? ligand : `posição ${index + 1} vazia`);

  return (
    <svg className="molecule" viewBox="0 0 240 212" role="img" aria-label={`${label}. Carbono central. Ligantes e posições: ${description.join(", ")}.`}>
      {overlay && <g opacity=".25">
        {joints(false, initialYaw, initialPitch).map(({ index, x, y }) => <g key={index}>
          <line x1={120} y1={106} x2={x} y2={y} stroke="#282c29" strokeWidth={4} />
          <circle cx={x} cy={y} r={19} fill={colors[ligands[index]]} stroke="#282c29" strokeWidth={2} />
        </g>)}
      </g>}
      {positions.map(({ index, x, y, depth }) => (
        <line key={index} x1={120} y1={106} x2={x} y2={y}
          stroke="#3c4b4e" strokeWidth={depth < 0 ? 3 : 5} strokeDasharray={depth < 0 ? "4 3" : undefined} />
      ))}
      <circle cx={120} cy={106} r={17} fill={chemicalElements.C.color} />
      <text x={120} y={106} fill="white">C</text>
      {positions.map(({ index, x, y }) => {
        const ligand = ligands[index];
        return <g key={index}>
          <circle cx={x} cy={y} r={ligand.length > 3 ? 23 : 18} fill={colors[ligand] ?? "#fff"}
            stroke="#282c29" strokeWidth={2} />
          <text x={x} y={y}>{ligand || index + 1}</text>
        </g>;
      })}
    </svg>
  );
}

export function RotatableMolecule({ ligands, mirror, label, overlay }: {
  ligands: Ligands; mirror?: boolean; label: string; overlay?: boolean;
}) {
  const [yaw, setYaw] = useState(initialYaw);
  const [pitch, setPitch] = useState(initialPitch);
  return (
    <div className="molecule-controls">
      <Molecule ligands={ligands} yaw={yaw} pitch={pitch} mirror={mirror} label={label} overlay={overlay} />
      <p className="molecule-controls__hint">Toque ou arraste os controles. Pelo teclado, use as setas.</p>
      <label>Rotação horizontal <input type="range" min={-180} max={180} value={yaw} onChange={(event) => setYaw(Number(event.target.value))} /></label>
      <label>Inclinação <input type="range" min={-90} max={90} value={pitch} onChange={(event) => setPitch(Number(event.target.value))} /></label>
      <Button variant="secondary" onClick={() => { setYaw(initialYaw); setPitch(initialPitch); }}>Restaurar posição</Button>
      <details>
        <summary>Descrição da molécula</summary>
        <p>Carbono central ligado a {new Intl.ListFormat("pt-BR").format(ligands.map((item) => ligandNames[item] ?? item))}.</p>
        <p>Ligações tracejadas indicam ligantes atrás do carbono nesta posição.</p>
      </details>
    </div>
  );
}
