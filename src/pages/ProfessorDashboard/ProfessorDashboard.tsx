import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import type { Room } from "../../features/rooms/rooms";

type ProfessorDashboardProps = {
  rooms: (Room & { participantCount: number })[];
  onCreateRoom: () => void;
  onOpenRoom: (code: string) => void;
  onBack: () => void;
};

export function ProfessorDashboard({ rooms, onCreateRoom, onOpenRoom, onBack }: ProfessorDashboardProps) {
  return (
    <ProfessorLayout frame="2020:16">
      <section className="professor__panel">
        <h1>Minhas salas</h1>
        {rooms.length ? <ul className="professor__list">
          {rooms.map((room) => (
            <li key={room.code}>
              <h2>{room.name}</h2>
              <p>Código: {room.code}</p>
              <p>{room.participantCount} {room.participantCount === 1 ? "aluno" : "alunos"} · {room.started ? "Em andamento" : "Aguardando início"}</p>
              <button className="flow-link" type="button" onClick={() => onOpenRoom(room.code)}>Acessar {room.name}</button>
            </li>
          ))}
        </ul> : <p>Nenhuma sala criada.</p>}
        <button className="flow-button" type="button" onClick={onCreateRoom}>Criar nova sala</button>
      </section>
      <button className="flow-link" type="button" onClick={onBack}>Voltar à seleção de perfil</button>
    </ProfessorLayout>
  );
}
