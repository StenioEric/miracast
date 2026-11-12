import type { ReactElement } from "react";

import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type WaitingRoomProps = {
  participantName: string;
  roomCode: string;
};

export const WaitingRoom = ({
  participantName,
  roomCode,
}: WaitingRoomProps): ReactElement => (
  <main className="sala-espera" data-node-id="13:1202">
    <div className="sala-espera__shell">
      <img
        className="sala-espera__forma"
        src={formaDecorativa}
        alt=""
        aria-hidden="true"
      />

      <section className="sala-espera__status" aria-live="polite">
        <h1>
          Aguardando o
          <br />
          professor iniciar...
        </h1>
      </section>

      <section className="sala-espera__participacao" aria-labelledby="sala-espera-titulo">
        <h2 id="sala-espera-titulo">Você está na sala!</h2>
        <p className="sala-espera__codigo">{roomCode}</p>
        <div className="sala-espera__participante">
          <span aria-hidden="true">👤</span>
          <span>{participantName}</span>
        </div>
        <p className="sala-espera__conectados">0 alunos conectados</p>
      </section>

      <footer className="sala-espera__rodape">
        <p>O jogo começará quando o professor clicar em Iniciar</p>
        <p>MiraCast · PROFQUI/UFRN</p>
      </footer>
    </div>
  </main>
);