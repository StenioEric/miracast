import type { TeacherClass } from "../../services/teacherClasses";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorDashboard.css";

type ProfessorDashboardProps = {
  rooms: TeacherClass[];
  onCreateRoom: () => void;
  onOpenRoom: (code: string) => void;
  onBack: () => void;
};

export function ProfessorDashboard({ rooms, onCreateRoom, onOpenRoom, onBack }: ProfessorDashboardProps) {
  return (
    <ProfessorLayout frame="2020:16"
      title="Minhas turmas"
      navigation={<Button variant="link" onClick={onBack}>Sair</Button>}
    >
      <ContentCard>
        {rooms.length ? <ul className="professor__list">
          {rooms.map((room) => (
            <li key={room.code}>
              <h2>{room.name}</h2>
              <p>Código: {room.code}</p>
              <Button variant="link" onClick={() => onOpenRoom(room.code)}>Acessar {room.name}</Button>
            </li>
          ))}
        </ul> : <p>Nenhuma turma cadastrada.</p>}
        <Button onClick={onCreateRoom}>Criar nova turma</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
