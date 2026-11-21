import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import identQuiral from "../../assets/ident-quiral.svg";
import "./IdentifiqueQuiral.css";

const options = ["M1", "M2", "M3"];

export function IdentifiqueQuiral({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === 1;

  function verify() {
    if (selected !== null) setSubmitted(true);
  }

  return (
    <main className="identifique-quiral" data-node-id="2003:709">
      <div className="identifique-quiral__shell">
        <div className="identifique-quiral__etapa">
          Atividade de identificação · Carão central quiral
        </div>

        <h1 className="identifique-quiral__titulo">IDENTIFIQUE O QUIRAL</h1>

        <section
          className="identifique-quiral__guia"
          aria-label="Orientação da Dra. Mira"
        >
          <div className="identifique-quiral__avatar" aria-hidden="true">
            👩‍🔬
          </div>
          <div className="identifique-quiral__balao">
            <p>DRA. MIRA</p>
            <span>
              Observe os três modelos. Identifique aquele que tem um carbono
              ligado a quatro grupos diferentes.
            </span>
          </div>
        </section>

        <section
          className="identifique-quiral__card"
          aria-labelledby="identifique-quiral-pergunta"
        >
          <img
            className="identifique-quiral__quadro"
            src={identQuiral}
            width="364"
            height="269"
            alt="Três modelos moleculares para comparação"
          />

          <h2 id="identifique-quiral-pergunta">
            Qual modelo representa um carbono quiral?
          </h2>

          <div
            className="identifique-quiral__opcoes"
            role="radiogroup"
            aria-label="Modelos moleculares"
          >
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === index}
                disabled={submitted}
                className={
                  selected === index
                    ? "identifique-quiral__opcao identifique-quiral__opcao--selecionada"
                    : "identifique-quiral__opcao"
                }
                onClick={() => setSelected(index)}
              >
                {option}
              </button>
            ))}
          </div>

          {submitted && (
            <p
              className={
                correct
                  ? "identifique-quiral__feedback identifique-quiral__feedback--correto"
                  : "identifique-quiral__feedback"
              }
              role="status"
            >
              <strong>
                {correct ? "Resposta correta. " : "Vamos revisar. "}
              </strong>
              Em CHClBrF, os ligantes H, Cl, Br e F são todos distintos.
            </p>
          )}

          {submitted ? (
            <button
              type="button"
              className="identifique-quiral__botao"
              onClick={() =>
                onContinue({
                  value: selected === null ? "" : options[selected],
                  correct,
                })
              }
            >
              CONTINUAR
            </button>
          ) : (
            <button
              type="button"
              className="identifique-quiral__botao"
              disabled={selected === null}
              onClick={verify}
            >
              VERIFICAR RESPOSTA
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
