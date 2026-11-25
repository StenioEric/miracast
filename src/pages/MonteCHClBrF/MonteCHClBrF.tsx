import { useState } from "react";

import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import type { Ligands } from "../../utils/moleculeGeometry";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { Molecule } from "../../components/Molecule/Molecule";
import "./MonteCHClBrF.css";

const atoms = ["H", "Cl", "Br", "F"] as const;
type Atom = (typeof atoms)[number];

export function MonteCHClBrF({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [ligands, setLigands] = useState<Ligands>(["", "", "", ""]);
  const [answered, setAnswered] = useState(false);
  const complete = ligands.every((ligand) => ligand !== "");

  function placeAtom(atom: Atom) {
    if (ligands.includes(atom)) return;
    const firstEmpty = ligands.findIndex((ligand) => ligand === "");
    if (firstEmpty === -1) return;

    const next: [...Ligands] = [...ligands];
    next[firstEmpty] = atom;
    setLigands(next);
  }

  function removeAtom(index: number) {
    const next: [...Ligands] = [...ligands];
    next[index] = "";
    setLigands(next);
  }

  function clearPositions() {
    setLigands(["", "", "", ""]);
  }

  function continueActivity(answer: Answer) {
    if (complete) onContinue({ ...answer, value: `${ligands.join(", ")}\n${answer.value}` });
  }

  return (
    <ActivityLayout
      step="build-molecule"
      frame={complete ? "2003:865" : "2003:914"}
      stage={complete ? "Montagem concluída" : "Fase 1 · Monte o carbono quiral"}
      title={complete ? "Quatro átomos posicionados" : "Monte o CHClBrF"}
      guidance={complete
        ? "Muito bem! Agora os quatro ligantes estão ocupando as posições do carbono central."
        : "Clique nos átomos abaixo e coloque cada um em uma posição da molécula."}
    >
      <ContentCard
        aria-label={complete ? "Molécula com quatro átomos posicionados" : "Montagem da molécula CHClBrF"}
      >
        <div className="activity-model">
          <Molecule
            ligands={ligands}
            label="Modelo tetraédrico do carbono central com seus quatro ligantes"
          />
        </div>

        <div className="monte-chclbrf__posicoes" aria-label="Posições da molécula">
          {ligands.map((ligand, index) => (
            <button
              type="button"
              className={ligand ? "monte-chclbrf__posicao monte-chclbrf__posicao--preenchida" : "monte-chclbrf__posicao"}
              key={index}
              disabled={!ligand || answered}
              onClick={() => removeAtom(index)}
              aria-label={ligand ? `Remover átomo ${ligand} da posição ${index + 1}` : `Posição ${index + 1} vazia`}
            >
              {ligand || index + 1}
            </button>
          ))}
        </div>

        <div className="monte-chclbrf__divider" />

        {complete ? (
          <div className="monte-chclbrf__completo" role="status">
            <strong>CHClBrF montado</strong>
            <span>O carbono central está ligado a quatro átomos diferentes.</span>
          </div>
        ) : (
          <p className="monte-chclbrf__instrucao">Escolha H, Cl, Br e F. Cada átomo pode ser colocado uma única vez.</p>
        )}

        <div className="monte-chclbrf__atomos" aria-label="Átomos disponíveis">
          {atoms.map((atom) => {
            const placed = ligands.includes(atom);
            return (
              <button
                type="button"
                className="monte-chclbrf__atomo"
                key={atom}
                disabled={placed}
                onClick={() => placeAtom(atom)}
              >
                {atom}
              </button>
            );
          })}
        </div>

        {!complete && (
          <Button variant="secondary" disabled={!ligands.some(Boolean)} onClick={clearPositions}>
            Limpar posições
          </Button>
        )}
      </ContentCard>
      {complete && <ChoiceQuestion question={questions["build-molecule"]} reviewOnSelect
        onEvaluate={() => setAnswered(true)} onContinue={continueActivity} />}
    </ActivityLayout>
  );
}
