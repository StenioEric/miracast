import type { FormEvent, ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-expedicao.svg";
import "./style.css";

export const ExpeditionEntry = (): ReactElement => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className="expedicao" data-node-id="7:101">
      <div className="expedicao__shell">
        <img
          className="expedicao__forma"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="expedicao__marca">
          <Brand />
        </div>

        <div className="expedicao__codigo" aria-label="Código da sala ECY95R">
          SALA: ECY95R
        </div>

        <form className="expedicao__formulario" onSubmit={handleSubmit}>
          <div className="expedicao__pergunta">
            <span className="expedicao__aceno" aria-hidden="true">
              👋
            </span>
            <h2>Qual é o seu nome?</h2>
          </div>

          <p className="expedicao__instrucao">
            Seu nome aparecerá no relatório da pesquisa e no seu diploma ao
            final!
          </p>

          <input
            className="expedicao__nome"
            type="text"
            name="name"
            placeholder="Seu nome completo"
            aria-label="Seu nome completo"
            autoComplete="name"
            required
          />

          <div className="expedicao__acao">
            <button type="submit">ENTRAR NA EXPEDIÇÃO</button>
          </div>
        </form>

        <footer className="expedicao__creditos">
          <p>PROFQUI/UFRN · Dissertação de Mestrado</p>
          <p>Fundamentada na Teoria de Galperin</p>
        </footer>
      </div>
    </main>
  );
};