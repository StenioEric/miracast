import type { FormEvent } from "react";

import { activities, activityProgress, scoreSummary } from "../../domain/expedition";
import type { ExpeditionStep } from "../../domain/expedition";
import type { TeacherClassState } from "../../services/teacherClasses";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import { ProgressIndicator } from "../../components/ProgressIndicator/ProgressIndicator";
import "./ProfessorRoom.css";

type ProfessorRoomProps = TeacherClassState & {
  created?: boolean;
  pending: boolean;
  onViewRoom: () => void;
  onRename: (name: string) => void;
  onStart: () => void;
  onBackToDashboard: () => void;
};

export function ProfessorRoom({
  room, started, participants, created, pending, onViewRoom, onRename, onStart, onBackToDashboard,
}: ProfessorRoomProps) {
  const graded = participants.map(({ answers }) => scoreSummary(answers)).filter(({ total }) => total > 0);
  const average = graded.length > 0
    ? Math.round(graded.reduce((sum, score) => sum + 100 * score.correct / score.total, 0) / graded.length)
    : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("roomName")).trim();
    if (name && name !== room.name) onRename(name);
  }

  return (
    <ProfessorLayout frame={created ? "2020:44" : participants.length ? "2020:72" : "2020:58"}
      title={created ? "Turma criada" : room.name}
      navigation={<Button variant="link" disabled={pending} onClick={onBackToDashboard}>Voltar ao painel</Button>}
    >
      <ContentCard>
        {created && <p>{room.name}</p>}
        <p>Código da turma</p>
        <output className="professor__code" aria-label="Código da turma">{room.code}</output>
        {created ? <>
          <p>Compartilhe o código com os alunos.</p>
          <Button onClick={onViewRoom}>Acessar turma</Button>
        </> : <>
          <p role="status">{started ? "Expedição iniciada" : "Aguardando início"}</p>
          {!started && <Button disabled={pending} onClick={onStart}>Iniciar expedição</Button>}
        </>}
      </ContentCard>

      {!created && <>
        <ContentCard as="form" key={room.name} onSubmit={submit}>
          <label className="form-field">
            Nome da turma
            <input className="form-control" name="roomName" defaultValue={room.name} maxLength={120} required />
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar nome"}</Button>
        </ContentCard>
        <ContentCard>
          <h2>Alunos e progresso</h2>
          {average !== null && <p>Média nas respostas avaliadas: {average}%</p>}
          {participants.length ? <ul className="professor__list">
            {participants.map((participant) => {
              const progress = activityProgress(participant.step);
              const score = scoreSummary(participant.answers);
              return <li key={participant.id}>
                <h3>{participant.name}</h3>
                <p>{started ? stepTitle(participant.step) : "Na sala de espera"}</p>
                <ProgressIndicator {...progress} label="Atividades concluídas" />
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
        </ContentCard>
      </>}
    </ProfessorLayout>
  );
}

function stepTitle(step: ExpeditionStep) {
  if (step === "motivation") return "Motivação";
  if (step === "protocol") return "Protocolo";
  if (step === "classification") return "Classificação";
  return activities.find(({ id }) => id === step)?.title;
}
