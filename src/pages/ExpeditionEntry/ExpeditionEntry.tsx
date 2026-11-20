import type { FormEvent } from "react";

import { Brand } from "../../components/Brand/Brand";
import decoration from "../../assets/forma-expedicao.svg";
import "./style.css";

type ExpeditionEntryProps = {
  onJoin: (code: string, name: string) => void;
  onBack: () => void;
};

export function ExpeditionEntry({ onJoin, onBack }: ExpeditionEntryProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onJoin(String(values.get("code")), String(values.get("name")));
  }

  return (
    <main className="expedicao" data-node-id="7:101">
      <div className="expedicao__shell">
        <img className="expedicao__forma" src={decoration} alt="" />
        <div className="expedicao__marca"><Brand /></div>

        <form className="expedicao__formulario" onSubmit={submit}>
          <div className="expedicao__pergunta">
            <span className="expedicao__aceno" aria-hidden="true">👋</span>
            <h2>Entrar na expedição</h2>
          </div>
          <p className="expedicao__instrucao">Use o código de seis caracteres fornecido pelo professor.</p>
          <label className="expedicao__campo">
            Código da sala
            <input className="expedicao__nome expedicao__nome--codigo" name="code"
              pattern="[A-Za-z0-9]{6}" minLength={6} maxLength={6} autoCapitalize="characters"
              autoComplete="off" spellCheck={false} placeholder="Ex.: ABC123" required />
          </label>
          <label className="expedicao__campo">
            Seu nome
            <input className="expedicao__nome" name="name" maxLength={100}
              placeholder="Seu nome completo" autoComplete="name" required />
          </label>
          <div className="expedicao__acao"><button className="flow-button" type="submit">ENTRAR NA EXPEDIÇÃO</button></div>
          <button className="flow-link" type="button" onClick={onBack}>Voltar à seleção de perfil</button>
        </form>

        <footer className="expedicao__creditos">
          <p>PROFQUI/UFRN · Dissertação de Mestrado</p>
          <p>Fundamentada na Teoria de Galperin</p>
        </footer>
      </div>
    </main>
  );
}
