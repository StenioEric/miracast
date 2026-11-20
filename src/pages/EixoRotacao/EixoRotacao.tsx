import { useState } from "react";
import "../../components/ActivityLayout/ActivityLayout.css";
import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import decoration from "../../assets/forma-decorativa.svg";
import { projectPoint } from "../../utils/moleculeGeometry";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Answer } from "../../domain/expedition";
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
    <main className="activity eixo-rotacao" data-node-id="2003:91">
      <div className="activity__shell">
        <img className="activity__decoration" src={decoration} alt="" />
        <header className="activity__header">
          <p>Ação Material Concreta · Tela 5</p>
          <h1>MISSÃO 1.3 - O EIXO DE ROTAÇÃO</h1>
        </header>
        <aside className="activity__guide" aria-label="Orientação da Dra. Mira">
          <DraMiraAvatar />
          <p><strong>Dra. Mira</strong><br />Gire a pirâmide em torno do eixo. Observe o que muda.</p>
        </aside>
        <section className="activity-card">
          <svg viewBox="0 0 240 200" role="img" aria-label="Pirâmide ajustável em torno do eixo vertical">
            {polygons.map((polygon) => <polygon key={polygon.index}
              points={polygon.points.map(([x, y]) => `${120 + x * 42},${101 - y * 42}`).join(" ")}
              fill={faceColors[polygon.index]} stroke="#623719" strokeWidth={2} />)}
            <line x1={120} y1={20} x2={120} y2={178} stroke="#282c29" strokeWidth={2} strokeDasharray="4 4" />
            <text x={128} y={27}>Eixo</text>
          </svg>
          <label className="activity-field">
            Ângulo de rotação
            <input type="range" min={0} max={360} value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
          </label>
        </section>
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
      </div>
    </main>
  );
}
