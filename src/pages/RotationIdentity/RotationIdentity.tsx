import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type RotationIdentityProps = {
  onContinue: () => void;
};

const supportIdeas = [
  "identidade",
  "ângulo",
  "mesma",
  "forma",
  "não muda",
  "continua",
];

export const RotationIdentity = ({
//   onContinue,
}: RotationIdentityProps): ReactElement => {
  const [answer, setAnswer] = useState("");
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (answer.trim()) setSubmitted(true);
  };

  const toggleIdea = (idea: string) => {
    setSelectedIdeas((selected) =>
      selected.includes(idea)
        ? selected.filter((item) => item !== idea)
        : [...selected, idea],
    );
  };

  return (
    <main className="girar-identidade" data-node-id="2003:131">
      <div className="girar-identidade__shell">
        <img
          className="girar-identidade__forma girar-identidade__forma--superior"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />
        <img
          className="girar-identidade__forma girar-identidade__forma--inferior"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="girar-identidade__etapa">
          Ação Material Concreta · Tela 4
        </div>
        <h1 className="girar-identidade__titulo">
          MISSÃO 1.2 — GIRAR MUDA A IDENTIDADE?
        </h1>

        <section className="girar-identidade__orientacao" aria-label="Orientação da Dra. Mira">
          <DraMiraAvatar className="girar-identidade__avatar" />
          <div className="girar-identidade__fala">
            <p className="girar-identidade__nome">DRA. MIRA</p>
            <p>
              Observe o cubo girando. Em uma palavra: o objeto mudou de
              identidade ao girar? Por quê?
            </p>
          </div>
        </section>

        <section className="girar-identidade__cartao" aria-label="Pergunta sobre rotação">
          <div className="girar-identidade__cubo-area" aria-label="Cubo girando">
            <div className="girar-identidade__cubo">
              <span className="girar-identidade__face girar-identidade__face--traseira" />
              <span className="girar-identidade__face girar-identidade__face--superior" />
              <span className="girar-identidade__face girar-identidade__face--lateral" />
              <span className="girar-identidade__face girar-identidade__face--frontal" />
            </div>
          </div>
          <p className="girar-identidade__legenda">cubo girando...</p>
          <h2>O cubo mudou de identidade ao girar? Escreva sua resposta explicando o motivo.</h2>

          <form className="girar-identidade__formulario" onSubmit={handleSubmit}>
            <label className="girar-identidade__resposta">
              <span className="girar-identidade__sr-only">Escreva sua resposta</span>
              <textarea
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="Escreva sua resposta..."
                required
              />
            </label>

            <fieldset className="girar-identidade__apoio">
              <legend>Ideias-chave de apoio:</legend>
              <div className="girar-identidade__ideias">
                {supportIdeas.map((idea) => (
                  <button
                    aria-pressed={selectedIdeas.includes(idea)}
                    className={
                      selectedIdeas.includes(idea)
                        ? "girar-identidade__ideia girar-identidade__ideia--selecionada"
                        : "girar-identidade__ideia"
                    }
                    key={idea}
                    onClick={() => toggleIdea(idea)}
                    type="button"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </fieldset>

            {submitted ? (
              <button
                className="girar-identidade__enviar"
                // onClick={onContinue}
                type="button"
              >
                CONTINUAR
              </button>
            ) : (
              <button
                className="girar-identidade__enviar"
                disabled={!answer.trim()}
                type="submit"
              >
                ENVIAR RESPOSTA ✍️
              </button>
            )}
          </form>
        </section>
      </div>
    </main>
  );
};