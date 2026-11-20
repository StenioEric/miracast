import { useState } from "react";

import { projectPoint } from "./moleculeGeometry";
import type { Ligands } from "./moleculeGeometry";

const vertices = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as const;
const colors: Record<string, string> = { H: "#edf2f5", Cl: "#90e098", Br: "#f7a66d", F: "#b9e9ff", OH: "#f7a7ba", "CH₃": "#bedaef", COOH: "#ffd475" };

export function Molecule({ ligands, yaw = 25, pitch = 15, mirror = false, label, overlay }: {
  ligands: Ligands; yaw?: number; pitch?: number; mirror?: boolean; label: string; overlay?: boolean;
}) {
  function joints(reflected: boolean, angle: number, tilt: number) {
    return vertices.map(([x, y, z], index) => {
      const [right, up, depth] = projectPoint([reflected ? -x : x, y, z], angle, tilt);
      return { index, x: 120 + 44 * right, y: 106 - 44 * up, depth };
    }).sort((left, right) => left.depth - right.depth);
  }

  const positions = joints(mirror, yaw, pitch);

  return (
    <svg className="molecule" viewBox="0 0 240 212" role="img" aria-label={label}>
      {overlay && <g opacity=".25">
        {joints(false, 25, 15).map(({ index, x, y }) => <g key={index}>
          <line x1={120} y1={106} x2={x} y2={y} stroke="#282c29" strokeWidth={4} />
          <circle cx={x} cy={y} r={19} fill={colors[ligands[index]]} stroke="#282c29" strokeWidth={2} />
        </g>)}
      </g>}
      {positions.map(({ index, x, y, depth }) => (
        <line key={index} x1={120} y1={106} x2={x} y2={y}
          stroke="#3c4b4e" strokeWidth={depth < 0 ? 3 : 5} strokeDasharray={depth < 0 ? "4 3" : undefined} />
      ))}
      <circle cx={120} cy={106} r={17} fill="#26332f" />
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
  const [yaw, setYaw] = useState(25);
  const [pitch, setPitch] = useState(15);
  return (
    <div className="molecule-controls">
      <Molecule ligands={ligands} yaw={yaw} pitch={pitch} mirror={mirror} label={label} overlay={overlay} />
      <label>Rotação horizontal <input type="range" min={-180} max={180} value={yaw} onChange={(event) => setYaw(Number(event.target.value))} /></label>
      <label>Inclinação <input type="range" min={-90} max={90} value={pitch} onChange={(event) => setPitch(Number(event.target.value))} /></label>
    </div>
  );
}
