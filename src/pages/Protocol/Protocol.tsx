import type { ReactElement } from "react";

import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

const questions = [
  "O objeto/molécula ocupa três dimensões simultaneamente (largura, altura, profundidade)?",
  "Girar o objeto muda sua identidade ou apenas o ângulo de observação?",
  "O carbono central tem 4 átomos TODOS diferentes entre si?",
  "A imagem especular pode ser sobreposta à original em alguma orientação?",
  "As duas formas (enantiômeros) interagem de forma diferente com o mundo (luz, receptores)?",
];

export const Protocol = (): ReactElement => (
  <main className="protocolo" data-node-id="13:1261">
    <div className="protocolo__shell">
      <img
        className="protocolo__forma protocolo__forma--superior"
        src={formaDecorativa}
        alt=""
        aria-hidden="true"
      />
      <img
        className="protocolo__forma protocolo__forma--inferior"
        src={formaDecorativa}
        alt=""
        aria-hidden="true"
      />

      <div className="protocolo__etapa">Base Orientadora da Ação · Tela 2</div>
      <h1 className="protocolo__titulo">PROTOCOLO MIRACAST</h1>

      <section className="protocolo__orientacao" aria-label="Orientação da Dra. Mira">
        <DraMiraAvatar className="protocolo__avatar" />
        <div className="protocolo__fala">
          <p className="protocolo__nome">DRA. MIRA</p>
          <p className="protocolo__mensagem">
            Tome meu caderno de campo. Estas 5 perguntas vão guiar toda a sua
            análise. Consulte sempre que precisar — nas fases finais, você
            seguirá sozinho.
          </p>
        </div>
      </section>

      <section className="protocolo__caderno" aria-label="Caderno de campo">
        <ol className="protocolo__perguntas">
          {questions.map((question, index) => (
            <li className="protocolo__pergunta" key={question}>
              <span className="protocolo__numero">{index + 1}</span>
              <p>{question}</p>
            </li>
          ))}
        </ol>

        <p className="protocolo__guia">
          Seu guia de investigação ao longo de toda a expedição:
        </p>
        <button className="protocolo__acao" type="button">
          INICIAR FASE 1
        </button>
      </section>
    </div>
  </main>
);