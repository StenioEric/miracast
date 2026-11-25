import { useState } from "react";

import { activityProgress, expeditionSteps, scoreSummary, stepTitle } from "../../domain/expedition";
import type { Answer, ExpeditionStep } from "../../domain/expedition";
import type { ClassParticipant } from "../../services/teacherClasses";
import { ProgressIndicator } from "../../components/ProgressIndicator/ProgressIndicator";

type Status = "waiting" | "in-progress" | "complete";

const statuses: Record<Status, string> = {
  waiting: "Na sala de espera", "in-progress": "Em andamento", complete: "Concluiu",
};

function readStatus(step: ExpeditionStep, started: boolean): Status {
  if (!started) return "waiting";
  return step === "master" ? "complete" : "in-progress";
}

function AnswerList({ entries }: { entries: [ExpeditionStep, Answer][] }) {
  return <dl className="professor__answers">
    {entries.map(([step, answer]) => (
      <div key={step}>
        <dt>{stepTitle(step)}</dt>
        <dd>{answer.value}{answer.correct === undefined ? "" : answer.correct ? " · Correta" : " · Incorreta"}</dd>
      </div>
    ))}
  </dl>;
}

const classTotals = (participants: ClassParticipant[], step: ExpeditionStep) => {
  const answers = participants.map((participant) => participant.answers[step]);
  return {
    step, total: answers.filter((answer) => typeof answer?.correct === "boolean").length,
    mistakes: answers.filter((answer) => answer?.correct === false).length,
  };
};

export function TeacherResults({ participants, started, archived = false }: {
  participants: ClassParticipant[]; started: boolean; archived?: boolean;
}) {
  const [status, setStatus] = useState("");
  const [step, setStep] = useState("");
  const graded = participants.map(({ answers }) => scoreSummary(answers)).filter(({ total }) => total > 0);
  const average = graded.length > 0
    ? Math.round(graded.reduce((sum, score) => sum + 100 * score.correct / score.total, 0) / graded.length)
    : null;
  const steps = expeditionSteps.filter((item) => participants.some((participant) => participant.step === item));
  const difficult = expeditionSteps.map((item) => classTotals(participants, item))
    .filter(({ mistakes }) => mistakes > 0)
    .sort((first, second) => second.mistakes - first.mistakes);
  const visible = participants.filter((participant) =>
    (!status || status === readStatus(participant.step, started)) && (!step || step === participant.step));

  if (!participants.length) return <p>Nenhum aluno entrou nesta expedição.</p>;

  return <>
    <p>{participants.length} {participants.length === 1 ? "aluno inscrito" : "alunos inscritos"} · {
      participants.filter((participant) => participant.step === "master").length} concluíram</p>
    {average !== null && <p>Média nas respostas avaliadas: {average}%</p>}
    {difficult.length > 0 && <details className="professor__insights">
      <summary>Questões com mais erros</summary>
      <ol>
        {difficult.map(({ step: item, total, mistakes }) => (
          <li key={item}>{stepTitle(item)} · {mistakes} de {total} respostas incorretas</li>
        ))}
      </ol>
    </details>}
    <div className="professor__filters">
      <label className="form-field">Filtrar por situação
        <select className="form-control" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todas as situações</option>
          {Object.entries(statuses).map(([key, label]) => (
            <option key={key} value={key}>{archived && key === "in-progress" ? "Incompleta" : label}</option>
          ))}
        </select>
      </label>
      <label className="form-field">Filtrar por etapa
        <select className="form-control" value={step} onChange={(event) => setStep(event.target.value)}>
          <option value="">Todas as etapas</option>
          {steps.map((item) => <option key={item} value={item}>{stepTitle(item)}</option>)}
        </select>
      </label>
    </div>
    {visible.length ? <ul className="professor__list">
      {visible.map((participant) => {
        const progress = activityProgress(participant.step);
        const score = scoreSummary(participant.answers);
        const participantStatus = readStatus(participant.step, started);
        const entries = expeditionSteps.flatMap((item): [ExpeditionStep, Answer][] => {
          const answer = participant.answers[item];
          return answer ? [[item, answer]] : [];
        });
        const open = entries.filter(([, answer]) => answer.correct === undefined);
        const objective = entries.filter(([, answer]) => answer.correct !== undefined);
        return <li key={participant.id}>
          <h3>{participant.name}</h3>
          <p>{archived && participantStatus === "in-progress" ? "Incompleta" : statuses[participantStatus]}
            {started && participantStatus !== "complete" ? ` · ${stepTitle(participant.step)}` : ""}</p>
          <ProgressIndicator {...progress} label={`Atividades concluídas por ${participant.name}`} />
          <p>{progress.completed} de {progress.total} atividades · {score.total ? `${score.correct} de ${score.total} respostas corretas` : "Sem respostas avaliadas"}</p>
          {open.length > 0 && <details><summary>Respostas abertas</summary><AnswerList entries={open} /></details>}
          {objective.length > 0 && <details><summary>Respostas avaliadas</summary><AnswerList entries={objective} /></details>}
        </li>;
      })}
    </ul> : <p role="status">Nenhum aluno corresponde aos filtros.</p>}
  </>;
}
