import type { Room } from "../../services/rooms";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorDashboard.css";

type ProfessorDashboardProps = {
  rooms: (Room & { participantCount: number })[];
  onCreateRoom: () => void;
  onOpenRoom: (code: string) => void;
  onBack: () => void;
};

export function ProfessorDashboard({ rooms, onCreateRoom, onOpenRoom, onBack }: ProfessorDashboardProps) {
  return (
    <ProfessorLayout frame="2020:16"
      title="Minhas salas"
      navigation={<Button variant="link" onClick={onBack}>Voltar à seleção de perfil</Button>}
    >
      <ContentCard>
        {rooms.length ? <ul className="professor__list">
          {rooms.map((room) => (
            <li key={room.code}>
              <h2>{room.name}</h2>
              <p>Código: {room.code}</p>
              <p>{room.participantCount} {room.participantCount === 1 ? "aluno" : "alunos"} · {room.started ? "Em andamento" : "Aguardando início"}</p>
              <Button variant="link" onClick={() => onOpenRoom(room.code)}>Acessar {room.name}</Button>
            </li>
          ))}
        </ul> : <p>Nenhuma sala criada.</p>}
        <Button onClick={onCreateRoom}>Criar nova sala</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
