import type { ReactElement } from "react";

import formaDecorativa from "../../assets/forma-decorativa.svg";
import limoneno from "../../assets/limoneno.svg";
import "./style.css";

export const Motivation = (): ReactElement => (
  <main className="motivacao" data-node-id="13:1225">
    <div className="motivacao__shell">
      <img
        className="motivacao__forma motivacao__forma--superior"
        src={formaDecorativa}
        alt=""
        aria-hidden="true"
      />
      <img
        className="motivacao__forma motivacao__forma--inferior"
        src={formaDecorativa}
        alt=""
        aria-hidden="true"
      />

      <div className="motivacao__etapa">Motivação&nbsp;&nbsp;&nbsp;&nbsp;Tela 1</div>
      <h1 className="motivacao__titulo">MiraCast</h1>

      <section className="motivacao__orientacao" aria-label="Orientação da Dra. Mira">
        <div className="motivacao__avatar" aria-hidden="true">
          👩‍🔬
        </div>
        <div className="motivacao__fala">
          <p className="motivacao__nome">DRA. MIRA</p>
          <p>
            Encontramos algo único nesta caverna. Este cristal tem duas formas
            moleculares que desviam a luz em direções opostas. Você toparia
            desvendar esse segredo?
          </p>
        </div>
      </section>

      <section className="motivacao__expedicao" aria-labelledby="motivacao-titulo">
        <h2 id="motivacao-titulo">O Segredo do Cristal Quiral</h2>
        <p className="motivacao__introducao">
          💎 Uma expedição pela estereoquímica. A rotação da luz polarizada por
          moléculas quirais é um fenômeno real: o limoneno-R gira para a direita
          (+), o limoneno-S para a esquerda (−).
        </p>
        <div className="motivacao__divisor" />
        <img
          className="motivacao__diagrama"
          src={limoneno}
          alt="Duas formas espelhadas de limoneno, R e S, separadas por um plano do espelho."
          width="325"
          height="229"
        />
        <button className="motivacao__botao" type="button">
          ACEITAR A EXPEDIÇÃO
        </button>
      </section>
    </div>
  </main>
);