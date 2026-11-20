import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import { activities, activityProgress, scoreSummary } from "../../domain/expedition";
import type { ExpeditionStep } from "../../domain/expedition";
import type { Participant, Room } from "../../services/rooms";
import "./ProfessorRoom.css";

type ProfessorRoomProps = {
  room: Room;
  participants: Participant[];
  created?: boolean;
  onViewRoom: () => void;
  onStart: () => void;
  onBackToDashboard: () => void;
};

export function ProfessorRoom({ room, participants, created, onViewRoom, onStart, onBackToDashboard }: ProfessorRoomProps) {
  const graded = participants.map(({ answers }) => scoreSummary(answers)).filter(({ total }) => total > 0);
  const average = graded.length > 0
    ? Math.round(graded.reduce((sum, score) => sum + 100 * score.correct / score.total, 0) / graded.length)
    : null;

  return (
    <ProfessorLayout frame={created ? "2020:44" : participants.length ? "2020:72" : "2020:58"}>
      <section className="professor__panel">
        <h1>{created ? "Sala criada" : room.name}</h1>
        {created && <p>{room.name}</p>}
        <p>Código da sala</p>
        <output className="professor__code" aria-label="Código da sala">{room.code}</output>
        {created ? <>
          <p>Compartilhe o código com os alunos.</p>
          <button className="flow-button" type="button" onClick={onViewRoom}>Acessar sala</button>
        </> : <>
          <p role="status">{room.started ? "Expedição iniciada" : "Aguardando início"}</p>
          {!room.started && <button className="flow-button" type="button" onClick={onStart}>Iniciar expedição</button>}
        </>}
      </section>

      {!created && <section className="professor__panel">
        <h2>Alunos e progresso</h2>
        {average !== null && <p>Média nas respostas avaliadas: {average}%</p>}
        {participants.length ? <ul className="professor__list">
          {participants.map((participant) => {
            const progress = activityProgress(participant.step);
            const score = scoreSummary(participant.answers);
            return <li key={participant.id}>
              <h3>{participant.name}</h3>
              <p>{room.started ? stepTitle(participant.step) : "Na sala de espera"}</p>
              <progress value={progress.completed} max={progress.total} aria-label="Atividades concluídas" />
              <p>{progress.completed} de {progress.total} atividades · {score.correct} de {score.total} respostas corretas</p>
              {Object.entries(participant.answers).length > 0 && <details>
                <summary>Respostas registradas</summary>
                <dl className="professor__answers">
                  {Object.entries(participant.answers).map(([step, answer]) => (
                    <div key={step}>
                      <dt>{stepTitle(step as ExpeditionStep)}</dt>
                      <dd>{answer.value}{answer.correct === undefined ? "" : answer.correct ? " · Correta" : " · Incorreta"}</dd>
                    </div>
                  ))}
                </dl>
              </details>}
            </li>;
          })}
        </ul> : <p>Nenhum aluno entrou ainda.</p>}
      </section>}

      <button className="flow-link" type="button" onClick={onBackToDashboard}>Voltar ao painel</button>
    </ProfessorLayout>
  );
}

function stepTitle(step: ExpeditionStep) {
  if (step === "motivation") return "Motivação";
  if (step === "protocol") return "Protocolo";
  if (step === "classification") return "Classificação";
  return activities.find(({ id }) => id === step)?.title;
}
