import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./WaitingRoom.css";

type WaitingRoomProps = {
  participantName: string;
  participantCount: number;
  roomCode: string;
  onBack: () => void;
};

export function WaitingRoom({ participantName, participantCount, roomCode, onBack }: WaitingRoomProps) {
  return (
    <PageLayout
      frame="13:1202"
      header={<PageHeader title="Aguardando o professor iniciar…" />}
      footer={<PageFooter credits="short">
        <Button variant="link" onClick={onBack}>Voltar à seleção de perfil</Button>
      </PageFooter>}
    >
      <ContentCard className="sala-espera__participacao" aria-labelledby="sala-espera-titulo">
        <h2 id="sala-espera-titulo">Você está na sala!</h2>
        <p className="sala-espera__codigo" aria-label={`Código da sala ${roomCode}`}>{roomCode}</p>
        <p><span aria-hidden="true">👤 </span>{participantName}</p>
        <p role="status">{participantCount} {participantCount === 1 ? "aluno inscrito" : "alunos inscritos"}</p>
      </ContentCard>
    </PageLayout>
  );
}
