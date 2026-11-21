import { useState } from "react";

import { Molecule } from "../../components/Molecule/Molecule";
import type { Answer } from "../../domain/expedition";
import type { Ligands } from "../../utils/moleculeGeometry";
import "./MonteCHClBrF.css";

const atoms = ["H", "Cl", "Br", "F"] as const;

type Atom = (typeof atoms)[number];

export function MonteCHClBrF({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [ligands, setLigands] = useState<Ligands>(["", "", "", ""]);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | null>(null);
  const complete = ligands.every((ligand) => ligand !== "");

  function placeAtom(atom: Atom) {
    if (ligands.includes(atom) || complete) return;

    const firstEmpty = ligands.findIndex((ligand) => ligand === "");
    if (firstEmpty === -1) return;

    const next: [string, string, string, string] = [...ligands];
    next[firstEmpty] = atom;
    setLigands(next);
  }

  function removeAtom(index: number) {
    const next: [string, string, string, string] = [...ligands];
    next[index] = "";
    setSelectedAnswer(null);
    setLigands(next);
  }

  function reset() {
    setSelectedAnswer(null);
    setLigands(["", "", "", ""]);
  }

  return (
    <main className="monte-chclbrf" data-node-id={complete ? "2003:865" : "2003:914"}>
      <div className="monte-chclbrf__shell">
        <div className="monte-chclbrf__etapa">
          {complete ? "Montagem concluída" : "Fase 1 · Monte o carbono quiral"}
        </div>

        <h1 className="monte-chclbrf__titulo">
          {complete ? "Quatro átomos posicionados" : "Monte o CHClBrF"}
        </h1>

        <section className="monte-chclbrf__orientacao" aria-label="Orientação da Dra. Mira">
          <div className="monte-chclbrf__avatar" aria-hidden="true">👩‍🔬</div>
          <div className="monte-chclbrf__balao">
            <p>DRA. MIRA</p>
            <span>
              {complete
                ? "Muito bem! Agora os quatro ligantes estão ocupando as posições do carbono central."
                : "Clique nos átomos abaixo e coloque cada um em uma posição da molécula."}
            </span>
          </div>
        </section>

        <section
          className={complete ? "monte-chclbrf__card monte-chclbrf__card--completo" : "monte-chclbrf__card"}
          aria-label={complete ? "Molécula com quatro átomos posicionados" : "Montagem da molécula CHClBrF"}
        >
          <div className="monte-chclbrf__canvas">
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
                onClick={() => ligand && removeAtom(index)}
                aria-label={ligand ? `Remover átomo ${ligand} da posição ${index + 1}` : `Posição ${index + 1} vazia`}
              >
                {ligand || index + 1}
              </button>
            ))}
          </div>

          <div className="monte-chclbrf__divider" />

          {complete ? (
            <>
              <div className="monte-chclbrf__completo" role="status">
                <strong>CHClBrF montado</strong>
                <span>O carbono central está ligado a quatro átomos diferentes.</span>
              </div>

              <section className="monte-chclbrf__pergunta" aria-labelledby="monte-chclbrf-pergunta">
                <h2 id="monte-chclbrf-pergunta">Com os 4 átomos posicionados, esse carbono é quiral?</h2>
                <button
                  type="button"
                  aria-pressed={selectedAnswer === "A"}
                  className={selectedAnswer === "A" ? "monte-chclbrf__opcao monte-chclbrf__opcao--selecionada" : "monte-chclbrf__opcao"}
                  onClick={() => setSelectedAnswer("A")}
                >
                  A. Sim — possui 4 átomos todos diferentes
                </button>
                <button
                  type="button"
                  aria-pressed={selectedAnswer === "B"}
                  className={selectedAnswer === "B" ? "monte-chclbrf__opcao monte-chclbrf__opcao--selecionada" : "monte-chclbrf__opcao"}
                  onClick={() => setSelectedAnswer("B")}
                >
                  B. Não — ainda faltam ligações
                </button>
              </section>
            </>
          ) : (
            <p className="monte-chclbrf__instrucao">
              Escolha H, Cl, Br e F. Cada átomo pode ser colocado uma única vez.
            </p>
          )}

          <div className="monte-chclbrf__atomos" aria-label="Átomos disponíveis">
            {atoms.map((atom) => {
              const placed = ligands.includes(atom);
              return (
                <button
                  type="button"
                  className={placed ? "monte-chclbrf__atomo monte-chclbrf__atomo--usado" : "monte-chclbrf__atomo"}
                  key={atom}
                  disabled={placed || complete}
                  onClick={() => placeAtom(atom)}
                >
                  {atom}
                </button>
              );
            })}
          </div>

          {complete ? (
            <button
              type="button"
              className="monte-chclbrf__acao"
              onClick={() => onContinue({ value: ligands.join(", "), correct: selectedAnswer === "A" })}
              disabled={!selectedAnswer}
            >
              CONTINUAR
            </button>
          ) : (
            <button
              type="button"
              className="monte-chclbrf__acao monte-chclbrf__acao--reset"
              disabled={!ligands.some((ligand) => ligand)}
              onClick={reset}
            >
              LIMPAR POSIÇÕES
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
