import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import verifQv1b from "../../assets/verif-qv1b.svg";
import "./VerificacaoQV1b.css";

const options = [
  "Sim — basta girar o objeto até que ele coincida",
  "Não — objetos quirais não podem ser sobrepostos à imagem especular",
];

export function VerificacaoQV1b({
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
    <main className="verificacao-qv1b" data-node-id="2003:2">
      <div className="verificacao-qv1b__shell">
        <div className="verificacao-qv1b__etapa">
          Verificação · Ação Material Concreta
        </div>

        <h1 className="verificacao-qv1b__titulo">VERIFICAÇÃO Q.V1b</h1>

        <section className="verificacao-qv1b__guia" aria-label="Orientação da Dra. Mira">
          <div className="verificacao-qv1b__avatar" aria-hidden="true">👩‍🔬</div>
          <div className="verificacao-qv1b__balao">
            <p>DRA. MIRA</p>
            <span>
              Compare o objeto com a imagem no espelho. Girar resolve o
              espelhamento?
            </span>
          </div>
        </section>

        <section className="verificacao-qv1b__card" aria-labelledby="qv1b-pergunta">
          <img
            className="verificacao-qv1b__quadro"
            src={verifQv1b}
            width="364"
            height="214"
            alt="Objeto original e sua imagem especular"
          />

          <h2 id="qv1b-pergunta">
            Uma imagem no espelho pode ser obtida girando o objeto original?
          </h2>

          <div className="verificacao-qv1b__opcoes" role="radiogroup" aria-label="Alternativas">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === index}
                disabled={submitted}
                className={
                  selected === index
                    ? "verificacao-qv1b__opcao verificacao-qv1b__opcao--selecionada"
                    : "verificacao-qv1b__opcao"
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
                  ? "verificacao-qv1b__feedback verificacao-qv1b__feedback--correto"
                  : "verificacao-qv1b__feedback"
              }
              role="status"
            >
              <strong>{correct ? "Resposta correta. " : "Vamos revisar. "}</strong>
              Em objetos quirais, girar não transforma o original na sua imagem
              especular. Eles não podem ser sobrepostos por rotação.
            </p>
          )}

          {submitted ? (
            <button
              type="button"
              className="verificacao-qv1b__botao"
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
              className="verificacao-qv1b__botao"
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
