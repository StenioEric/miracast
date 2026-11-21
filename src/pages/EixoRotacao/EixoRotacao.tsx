import { useState } from "react";

import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { projectPoint } from "../../utils/moleculeGeometry";
import "./EixoRotacao.css";

const vertices = [[0, 1, 0], [-1, -0.7, -1], [1, -0.7, -1], [1, -0.7, 1], [-1, -0.7, 1]] as const;
const faces = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1]];
const faceColors = ["#ffaf2b", "#ffcb63", "#f58b22", "#ffe1a6"];

export function EixoRotacao({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [angle, setAngle] = useState(28);
  const points = vertices.map((point) => projectPoint(point, angle, -16));
  const polygons = faces.map((face, index) => ({
    index,
    points: face.map((vertex) => points[vertex]),
    depth: face.reduce((total, vertex) => total + points[vertex][2], 0),
  })).sort((left, right) => left.depth - right.depth);

  return (
    <ActivityLayout
      className="eixo-rotacao"
      step="axis-rotation"
      stage="Ação Material Concreta · Tela 5"
      title="Missão 1.3 — O eixo de rotação"
      guidance="Gire a pirâmide em torno do eixo. Observe o que muda."
    >
      <ContentCard>
        <svg viewBox="0 0 240 200" role="img" aria-label="Pirâmide ajustável em torno do eixo vertical">
          {polygons.map((polygon) => <polygon key={polygon.index}
            points={polygon.points.map(([x, y]) => `${120 + x * 42},${101 - y * 42}`).join(" ")}
            fill={faceColors[polygon.index]} stroke="#623719" strokeWidth={2} />)}
          <line x1={120} y1={20} x2={120} y2={178} stroke="#282c29" strokeWidth={2} strokeDasharray="4 4" />
          <text x={128} y={27}>Eixo</text>
        </svg>
        <label className="form-field">
          Ângulo de rotação
          <input type="range" min={0} max={360} value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
        </label>
      </ContentCard>
      <ChoiceQuestion onContinue={onContinue} question={{
        prompt: "Ao girar em torno do seu eixo, a pirâmide mudou de forma?",
        options: [
          "Sim, a aparência diferente indica outra figura.",
          "Não, a pirâmide é a mesma em outra orientação.",
          "Sim, girar sempre cria um objeto novo.",
          "Depende do ângulo em que eu parar.",
        ],
        correct: 1,
        explanation: "A rotação altera a orientação da pirâmide. A forma e a identidade permanecem iguais.",
      }} />
    </ActivityLayout>
  );
}
