import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import formaAtiva from "../../assets/forma-ativa.svg";
import "./FormaAtiva.css";

const options = [
  "A. Idênticos — desviam a luz para o mesmo lado",
  "B. Opostos — uma desvia para a direita (+), a outra para a esquerda (−)",
  "C. Nenhuma das formas desvia a luz",
  "D. Aleatórios — depende da temperatura",
];

export function FormaAtiva({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const correct = selected === 1;

  return (
    <main className="forma-ativa" data-node-id="2003:1008">
      <div className="forma-ativa__shell">
        <div className="forma-ativa__etapa">Ação Verbalizada · Tela 14</div>
        <h1 className="forma-ativa__titulo">MISSÃO 3.3 — A FORMA ATIVA</h1>

        <section className="forma-ativa__guia" aria-label="Orientação da Dra. Mira">
          <div className="forma-ativa__avatar" aria-hidden="true">👩‍🔬</div>
          <div className="forma-ativa__balao">
            <p>DRA. MIRA</p>
            <span>
              Dois frascos: (+) e (−), pelo desvio da luz.<br />
              Somente uma forma desvia a luz para a direita. Observe a posição do Br em cada forma.
            </span>
          </div>
        </section>

        <section className="forma-ativa__card" aria-labelledby="forma-ativa-pergunta">
          <img
            className="forma-ativa__quadro"
            src={formaAtiva}
            width="364"
            height="217"
            alt="Comparação das duas formas CHClBrF pela luz polarizada"
          />

          <h2 id="forma-ativa-pergunta">
            As duas formas de CHClBrF desviam a luz polarizada de modos:
          </h2>

          <div className="forma-ativa__opcoes" role="radiogroup" aria-label="Alternativas">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected === index}
                className={selected === index
                  ? "forma-ativa__opcao forma-ativa__opcao--selecionada"
                  : "forma-ativa__opcao"}
                onClick={() => setSelected(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="forma-ativa__botao"
          disabled={selected === null}
          onClick={() => onContinue({
            value: selected === null ? "" : options[selected],
            correct,
          })}
        >
          Continuar
        </button>
      </div>
    </main>
  );
}
