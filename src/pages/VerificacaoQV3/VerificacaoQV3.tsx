import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV3.css";

const options = [
  "Porque uma tem átomos de cor diferente da outra",
  "Porque são opostas — uma é esquerda e a outra é direita",
  "Porque possuem átomos em quantidades diferentes",
  "Porque são imagens especulares com organização espacial oposta — em nenhuma rotação os 4 átomos coincidem"
];

export function VerificacaoQV3({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === 3;

  function verify() {
    if (selected !== null) setSubmitted(true);
  }

  return (
    <main className="verificacao-qv3" data-node-id="2003:968">
      <div className="verificacao-qv3__shell">
        <div className="verificacao-qv3__etapa">Verificação · Tela 13</div>
        <h1 className="verificacao-qv3__titulo">VERIFICAÇÃO Q.V3</h1>

        <section className="verificacao-qv3__guia" aria-label="Orientação da Dra. Mira">
          <div className="verificacao-qv3__avatar" aria-hidden="true">👩‍🔬</div>
          <div className="verificacao-qv3__balao">
            <p>DRA. MIRA</p>
            <span>
              Quatro estudantes explicaram por que o CHClBrF e seu
              enantiômero não são a mesma molécula. Qual explicação está conceitualmente correta?
            </span>
          </div>
        </section>

        <section className="verificacao-qv3__card" aria-labelledby="qv3-pergunta">
          <h2 id="qv3-pergunta">
            Qual explicação para a não-equivalência dos enantiômeros está correta?
          </h2>

          <div className="verificacao-qv3__opcoes" role="radiogroup" aria-label="Alternativas">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === index}
                disabled={submitted}
                className={selected === index
                  ? "verificacao-qv3__opcao verificacao-qv3__opcao--selecionada"
                  : "verificacao-qv3__opcao"}
                onClick={() => setSelected(index)}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>

          {submitted && (
            <p
              className={correct
                ? "verificacao-qv3__feedback verificacao-qv3__feedback--correto"
                : "verificacao-qv3__feedback"}
              role="status"
            >
              <strong>{correct ? "Resposta correta. " : "Vamos revisar. "}</strong>
              A alternativa D está certa porque ela define exatamente o conceito de quiralidade: o carbono ligado a quatro átomos diferentes cria duas estruturas que são imagens no espelho não sobreponíveis
            </p>
          )}

          {submitted ? (
            <button
              type="button"
              className="verificacao-qv3__botao"
              onClick={() => onContinue({
                value: selected === null ? "" : options[selected],
                correct,
              })}
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              className="verificacao-qv3__botao"
              disabled={selected === null}
              onClick={verify}
            >
              Verificar resposta
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
