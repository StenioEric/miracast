import crystal from "../../assets/cristal.svg";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { activityProgress, scoreSummary } from "../../domain/expedition";
import type { Answer, ExpeditionStep } from "../../domain/expedition";
import "./MestreDoQuiral.css";

type MestreDoQuiralProps = {
  answers: Partial<Record<ExpeditionStep, Answer>>;
  studentName: string;
  onFinish: () => void;
};

export function MestreDoQuiral({ answers, studentName, onFinish }: MestreDoQuiralProps) {
  const progress = activityProgress("master");
  const score = scoreSummary(answers);
  return (
    <ActivityLayout step="master">
      <section className="activity-card activity-result">
        <img src={crystal} alt="" width="72" height="72" />
        <h2>Expedição concluída, {studentName}!</h2>
        <p>{progress.completed} de {progress.total} atividades concluídas.</p>
        <p>{score.correct} de {score.total} respostas avaliadas corretas.</p>
        <button className="flow-button" type="button" onClick={onFinish}>Voltar à seleção de perfil</button>
      </section>
    </ActivityLayout>
  );
}
