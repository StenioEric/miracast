import decoration from "../../assets/forma-decorativa.svg";
import "./style.css";

type WaitingRoomProps = {
  participantName: string;
  participantCount: number;
  roomCode: string;
  onBack: () => void;
};

export function WaitingRoom({ participantName, participantCount, roomCode, onBack }: WaitingRoomProps) {
  return (
    <main className="sala-espera" data-node-id="13:1202">
      <div className="sala-espera__shell">
        <img className="sala-espera__forma" src={decoration} alt="" />
        <section className="sala-espera__status">
          <h1>Aguardando o<br />professor iniciar...</h1>
        </section>
        <section className="sala-espera__participacao" aria-labelledby="sala-espera-titulo">
          <h2 id="sala-espera-titulo">Você está na sala!</h2>
          <p className="sala-espera__codigo">{roomCode}</p>
          <div className="sala-espera__participante">
            <span aria-hidden="true">👤</span><span>{participantName}</span>
          </div>
          <p className="sala-espera__conectados" role="status">
            {participantCount} {participantCount === 1 ? "aluno inscrito" : "alunos inscritos"}
          </p>
        </section>
        <footer className="sala-espera__rodape">
          <p>O jogo começará quando o professor clicar em Iniciar</p>
          <button className="flow-link" type="button" onClick={onBack}>Voltar à seleção de perfil</button>
          <p>MiraCast · PROFQUI/UFRN</p>
        </footer>
      </div>
    </main>
  );
}
