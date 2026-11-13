import { useState } from "react";
import type { ReactElement } from "react";

import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

const answers = [
  "A. Sim — ficou com aparência diferente, então é outra figura",
  "B. Não — permaneceu a mesma pirâmide, apenas em outra posição",
  "C. Sim — girar sempre cria um objeto novo",
  "D. Depende do ângulo em que eu paro de girar",
];

export const AxisRotation = (): ReactElement => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <main className="eixo-rotacao" data-node-id="2003:91">
      <div className="eixo-rotacao__shell">
        <img
          className="eixo-rotacao__forma eixo-rotacao__forma--superior"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />
        <img
          className="eixo-rotacao__forma eixo-rotacao__forma--inferior"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="eixo-rotacao__etapa">Ação Material Concreta · Tela 5</div>
        <h1 className="eixo-rotacao__titulo">MISSÃO 1.3 - O EIXO DE ROTAÇÃO</h1>

        <section className="eixo-rotacao__orientacao" aria-label="Orientação da Dra. Mira">
          <DraMiraAvatar className="eixo-rotacao__avatar" />
          <div className="eixo-rotacao__fala">
            <p className="eixo-rotacao__nome">DRA. MIRA</p>
            <p>Gire esta pirâmide em torno do seu eixo. A figura mudou de forma?</p>
          </div>
        </section>

        <section className="eixo-rotacao__cartao" aria-labelledby="eixo-rotacao-pergunta">
          <h2 id="eixo-rotacao-pergunta">
            Ao girar a pirâmide em torno do seu eixo, ela mudou de forma?
          </h2>
          <div className="eixo-rotacao__divisor" />
          <div className="eixo-rotacao__diagrama" role="img" aria-label="Pirâmide girando em torno de um eixo vertical">
            <span className="eixo-rotacao__arco" aria-hidden="true">↻</span>
            <div className="eixo-rotacao__piramide">
              <span className="eixo-rotacao__face eixo-rotacao__face--traseira" />
              <span className="eixo-rotacao__face eixo-rotacao__face--frontal" />
              <span className="eixo-rotacao__aresta" />
            </div>
            <span className="eixo-rotacao__linha-eixo" />
            <span className="eixo-rotacao__rotulo-eixo">Eixo</span>
          </div>
        </section>

        <div className="eixo-rotacao__respostas" role="group" aria-label="Escolha uma resposta">
          {answers.map((answer, index) => (
            <button
              aria-pressed={selectedAnswer === index}
              className={
                selectedAnswer === index
                  ? "eixo-rotacao__resposta eixo-rotacao__resposta--selecionada"
                  : "eixo-rotacao__resposta"
              }
              key={answer}
              onClick={() => setSelectedAnswer(index)}
              type="button"
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};