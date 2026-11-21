import { useState } from "react";

import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import { Molecule } from "../../components/Molecule/Molecule";
import type { Answer } from "../../domain/expedition";
import { chclbrf } from "../../utils/moleculeGeometry";
import type { Ligands } from "../../utils/moleculeGeometry";
import "./SeRepetir.css";

const replacedLigands: Ligands = ["H", "Cl", "Br", "H"];

export function SeRepetir({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [replaced, setReplaced] = useState(false);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const ligands = replaced ? replacedLigands : chclbrf;
  const correct = selected === "B";

  function replaceLigand() {
    setReplaced(true);
    setSelected(null);
  }

  function resetLigand() {
    setReplaced(false);
    setSelected(null);
  }

  function continueActivity() {
    if (!replaced || selected === null) return;

    onContinue({
      value: selected === "A"
        ? "Sim, ainda há quatro ligações"
        : "Não, há dois hidrogênios iguais",
      correct,
    });
  }

  return (
    <GuidedActivity
      className="se-repetir guided-activity--molecule"
      frame="2003:798"
      stage="Ação Material Concreta · Tela 10"
      title={replaced ? "A repetição muda tudo" : "E se repetir?"}
      guidance={replaced
        ? "Agora substituímos F por H. O que aconteceu com os ligantes do carbono?"
        : "Substitua um dos ligantes e observe se o carbono continua quiral."}
    >
      <section className="guided-activity__card" aria-label="Modelo da molécula">
        <div className="se-repetir__formula">
          <span>{replaced ? "CH₂ClBr" : "CHClBrF"}</span>
          <small>{replaced ? "Ligantes repetidos" : "Quatro ligantes diferentes"}</small>
        </div>

        <div className="guided-activity__model">
          <Molecule
            ligands={ligands}
            label={replaced ? "Modelo de CH₂ClBr com dois hidrogênios iguais" : "Modelo de CHClBrF com quatro ligantes diferentes"}
          />
        </div>

        <div className="se-repetir__comparacao">
          <div>
            <span className="se-repetir__ligante se-repetir__ligante--h">H</span>
            <span className="se-repetir__ligante se-repetir__ligante--cl">Cl</span>
          </div>
          <div>
            <span className="se-repetir__ligante se-repetir__ligante--br">Br</span>
            <span className={replaced ? "se-repetir__ligante se-repetir__ligante--h" : "se-repetir__ligante se-repetir__ligante--f"}>
              {replaced ? "H" : "F"}
            </span>
          </div>
        </div>

        {!replaced ? (
          <button type="button" className="se-repetir__acao" onClick={replaceLigand}>
            SUBSTITUIR F POR H
          </button>
        ) : (
          <button type="button" className="se-repetir__acao se-repetir__acao--reset" onClick={resetLigand}>
            VOLTAR PARA CHClBrF
          </button>
        )}
      </section>

      {replaced && (
        <section className="se-repetir__pergunta" aria-labelledby="se-repetir-pergunta">
          <h2 id="se-repetir-pergunta">
            Depois da substituição, esse carbono permanece um centro quiral?
          </h2>

          <button
            type="button"
            aria-pressed={selected === "A"}
            className="se-repetir__opcao"
            onClick={() => setSelected("A")}
          >
            A. Sim, ainda há quatro ligações
          </button>

          <button
            type="button"
            aria-pressed={selected === "B"}
            className="se-repetir__opcao"
            onClick={() => setSelected("B")}
          >
            B. Não, há dois hidrogênios iguais
          </button>

          <button
            type="button"
            className="se-repetir__continuar"
            disabled={selected === null}
            onClick={continueActivity}
          >
            CONTINUAR
          </button>
        </section>
      )}
    </GuidedActivity>
  );
}
