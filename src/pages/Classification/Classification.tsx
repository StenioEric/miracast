import { useState } from "react";
import type { ReactElement } from "react";

import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import tabelaClassificacao from "../../assets/tabela_tela3.svg";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

const objects = [
  { id: "folha", name: "Folha de papel" },
  { id: "circulo", name: "Círculo" },
  { id: "cubo", name: "Cubo" },
  { id: "piramide", name: "Pirâmide" },
  { id: "esfera", name: "Esfera" },
] as const;

type ObjectId = (typeof objects)[number]["id"];
type Category = "plano" | "espacial";

export const Classification = (): ReactElement => {
  const [answers, setAnswers] = useState<Partial<Record<ObjectId, Category>>>({});
  const [submitted, setSubmitted] = useState(false);
  const allClassified = objects.every(({ id }) => answers[id] !== undefined);

  const chooseCategory = (objectId: ObjectId, category: Category) => {
    setAnswers((current) => ({ ...current, [objectId]: category }));
    setSubmitted(false);
  };

  return (
    <main className="classificacao" data-node-id="13:1307">
      <div className="classificacao__shell">
        <img
          className="classificacao__forma"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="classificacao__etapa">
          Ação Material Concreta · Tela 3
        </div>
        <h1 className="classificacao__titulo">
          MISSÃO 1.1 - PLANO OU ESPACIAL?
        </h1>

        <section className="classificacao__orientacao" aria-label="Orientação da Dra. Mira">
          <DraMiraAvatar className="classificacao__avatar" />
          <div className="classificacao__fala">
            <p className="classificacao__nome">DRA. MIRA</p>
            <p>
              Veja estes objetos flutuando na caverna. Classifique cada um: ele
              é PLANO OU ESPACIAL?
            </p>
          </div>
        </section>

        <img
          className="classificacao__tabela"
          src={tabelaClassificacao}
          alt="Galeria com folha, círculo, cubo, pirâmide e esfera."
          width="367"
          height="171"
        />

        <div className="classificacao__cartoes">
          {objects.map(({ id, name }) => (
            <section
              className="classificacao__cartao"
              key={id}
              aria-labelledby={`classificacao-${id}`}
            >
              <h2 id={`classificacao-${id}`}>{name}</h2>
              <div
                className="classificacao__categorias"
                role="group"
                aria-label={`Classificação de ${name}`}
              >
                {(["plano", "espacial"] as const).map((category) => (
                  <button
                    aria-pressed={answers[id] === category}
                    className={
                      answers[id] === category
                        ? "classificacao__opcao classificacao__opcao--selecionada"
                        : "classificacao__opcao"
                    }
                    key={category}
                    onClick={() => chooseCategory(id, category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <button
          className="classificacao__enviar"
          disabled={!allClassified || submitted}
          onClick={() => setSubmitted(true)}
          type="button"
        >
          {submitted ? "CLASSIFICAÇÃO REGISTRADA" : "Classificar todos"}
        </button>
        <span className="classificacao__status" aria-live="polite">
          {submitted ? "Classificação registrada." : ""}
        </span>
      </div>
    </main>
  );
};