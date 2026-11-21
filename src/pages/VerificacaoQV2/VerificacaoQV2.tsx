import { useState } from "react";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV2.css";

const options = [
  "A. M1 (H, H, Cl, F) — tem hidrogênio e flúor, átomos bem diferentes",
  "B. M2 (H, Cl, Br, F) — quatro átomos todos diferentes entre si",
  "C. M3 (Cl, Cl, Br, H) — tem três tipos de átomos diferentes",
  "D. M4 (F, F, F, Cl) — tem flúor, o átomo mais eletronegativo",
];

export function VerificacaoQV2({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const correct = selected === 1;

  return (
    <ActivityLayout step="qv2">
      <main className="verificacao-qv2" data-node-id="2003:670">
        <div className="verificacao-qv2__shell">
          <div className="verificacao-qv2__etapa">Verificação · Tela 11</div>
          <h1 className="verificacao-qv2__titulo">VERIFICAÇÃO Q.V2</h1>

          <section
            className="verificacao-qv2__guia"
            aria-label="Orientação da Dra. Mira"
          >
            <div className="verificacao-qv2__avatar" aria-hidden="true">
              👩‍🔬
            </div>
            <div className="verificacao-qv2__balao">
              <p>DRA. MIRA</p>
              <span>Quatro moléculas. Qual possui um carbono quiral?</span>
            </div>
          </section>

          <section
            className="verificacao-qv2__pergunta"
            aria-labelledby="qv2-pergunta"
          >
            <h2 id="qv2-pergunta">Qual molécula possui carbono quiral?</h2>
          </section>

          <div
            className="verificacao-qv2__opcoes"
            role="radiogroup"
            aria-label="Alternativas"
          >
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === index}
                className={
                  selected === index
                    ? "verificacao-qv2__opcao verificacao-qv2__opcao--selecionada"
                    : "verificacao-qv2__opcao"
                }
                onClick={() => setSelected(index)}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="verificacao-qv2__continuar"
            disabled={selected === null}
            onClick={() =>
              onContinue({
                value: selected === null ? "" : options[selected],
                correct,
              })
            }
          >
            Continuar
          </button>
        </div>
      </main>
    </ActivityLayout>
  );
}
