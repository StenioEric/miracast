import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import verifQv1 from "../../assets/verif-qv1.svg";
import "./VerificacaoQV1.css";

const options = [
  "A forma do objeto",
  "A orientação do objeto",
  "A identidade do objeto",
];

export function VerificacaoQV1({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function verify() {
    if (selected !== null) setSubmitted(true);
  }

  const correct = selected === 1;

  return (
    <main className="verificacao-qv1" data-node-id="2003:54">
      <div className="verificacao-qv1__shell">
        <div className="verificacao-qv1__etapa">
          Verificação · Ação Material Concreta
        </div>

        <h1 className="verificacao-qv1__titulo">VERIFICAÇÃO Q.V1</h1>

        <section className="verificacao-qv1__guia" aria-label="Orientação da Dra. Mira">
          <div className="verificacao-qv1__avatar" aria-hidden="true">👩‍🔬</div>
          <div className="verificacao-qv1__balao">
            <p>DRA. MIRA</p>
            <span>
              Ao girar um objeto rígido, observe com atenção o que realmente
              mudou.
            </span>
          </div>
        </section>

        <section className="verificacao-qv1__card" aria-labelledby="qv1-pergunta">
          <img
            className="verificacao-qv1__quadro"
            src={verifQv1}
            width="364"
            height="225"
            alt="Rotação rígida de um objeto no espaço"
          />

          <h2 id="qv1-pergunta">
            Quando um objeto rígido gira, o que muda?
          </h2>

          <div className="verificacao-qv1__opcoes" role="radiogroup" aria-label="Alternativas">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === index}
                disabled={submitted}
                className={
                  selected === index
                    ? "verificacao-qv1__opcao verificacao-qv1__opcao--selecionada"
                    : "verificacao-qv1__opcao"
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
                  ? "verificacao-qv1__feedback verificacao-qv1__feedback--correto"
                  : "verificacao-qv1__feedback"
              }
              role="status"
            >
              <strong>{correct ? "Resposta correta. " : "Vamos revisar. "}</strong>
              Uma rotação rígida muda a orientação do objeto. Forma, tamanho e
              identidade permanecem iguais.
            </p>
          )}

          {submitted ? (
            <button
              type="button"
              className="verificacao-qv1__botao"
              onClick={() =>
                onContinue({
                  value: selected === null ? "" : options[selected],
                  correct,
                })
              }
            >
              {correct ? "CONTINUAR" : "CONTINUAR MESMO ASSIM"}
            </button>
          ) : (
            <button
              type="button"
              className="verificacao-qv1__botao"
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
