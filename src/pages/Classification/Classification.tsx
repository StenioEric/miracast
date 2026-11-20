import { useState } from "react";
import type { ReactElement } from "react";
import type { Answer } from "../../domain/expedition";

import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import tabelaClassificacao from "../../assets/tabela_tela3.svg";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./Classification.css";

const objects = [
  { id: "folha", name: "Folha de papel" },
  { id: "circulo", name: "Círculo" },
  { id: "cubo", name: "Cubo" },
  { id: "piramide", name: "Pirâmide" },
  { id: "esfera", name: "Esfera" },
] as const;

type ObjectId = (typeof objects)[number]["id"];
type Category = "plano" | "espacial";

const categoriesByObject: Record<ObjectId, Category> = {
  folha: "plano", circulo: "plano", cubo: "espacial", piramide: "espacial", esfera: "espacial",
};

export const Classification = ({ onContinue }: { onContinue: (answer: Answer) => void }): ReactElement => {
  const [answers, setAnswers] = useState<Partial<Record<ObjectId, Category>>>({});
  const [submitted, setSubmitted] = useState(false);
  const allClassified = objects.every(({ id }) => answers[id] !== undefined);
  const correct = objects.every(({ id }) => answers[id] === categoriesByObject[id]);

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
              Classifique cada representação como plana ou espacial. Considere a
              folha como uma superfície ideal, sem espessura.
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
          disabled={!allClassified}
          onClick={() => submitted
            ? onContinue({ value: objects.map(({ id, name }) => `${name}: ${answers[id]}`).join(", "), correct })
            : setSubmitted(true)}
          type="button"
        >
          {submitted ? "Continuar" : "Classificar todos"}
        </button>
        <p className="classificacao__feedback" role="status">
          {submitted && (correct ? "Classificação correta!" : "Folha e círculo são planos nesta atividade. Cubo, pirâmide e esfera são espaciais.")}
        </p>
      </div>
    </main>
  );
};