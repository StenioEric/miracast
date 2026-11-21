import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import "./VerbalizePrincipio.css";

export function VerbalizePrincipio({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [value, setValue] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;

    onContinue({ value: value.trim() });
  }

  return (
    <main className="verbalize-principio" data-node-id="2003:1046">
      <div className="verbalize-principio__shell">
        <div className="verbalize-principio__etapa">Princípio da quiralidade · Tela 15</div>
        <h1 className="verbalize-principio__titulo">VERBALIZE O PRINCÍPIO</h1>

        <section className="verbalize-principio__guia" aria-label="Orientação da Dra. Mira">
          <div className="verbalize-principio__avatar" aria-hidden="true">👩‍🔬</div>
          <div className="verbalize-principio__balao">
            <p>DRA. MIRA</p>
            <span>
              Em uma frase: por que as duas moléculas não se sobrepõem?
            </span>
          </div>
        </section>

        <section className="verbalize-principio__card">

          <h2>Escreva por que as moléculas não se sobrepõem, mesmo girando.</h2>

          <form className="verbalize-principio__form" onSubmit={submit}>
            <label>
              <span>Sua explicação</span>
              <textarea
                value={value}
                maxLength={2000}
                rows={6}
                placeholder="Escreva sua resposta..."
                onChange={(event) => setValue(event.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="verbalize-principio__botao"
              disabled={!value.trim()}
            >
              Continuar
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
