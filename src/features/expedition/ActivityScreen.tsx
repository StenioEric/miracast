import type { ReactNode } from "react";

import crystal from "../../assets/cristal.svg";
import decoration from "../../assets/forma-decorativa.svg";
import { AxisRotation } from "../../pages/AxisRotation/AxisRotation";
import { RotationIdentity } from "../../pages/RotationIdentity/RotationIdentity";
import { RotatableMolecule } from "./Molecule";
import { chclbrf } from "./moleculeGeometry";
import { BuildMolecule, LacticAcid, RepeatLigand, Superposition } from "./MoleculeActivities";
import { questions } from "./questions";
import type { Question } from "./questions";
import { ChoiceQuestion, WrittenResponse } from "./Response";
import { activities, activityProgress, scoreSummary } from "./steps";
import type { ActivityId, Answer, ExpeditionStep } from "./steps";
import "./style.css";

type ActivityScreenProps = {
  step: ActivityId;
  answers: Partial<Record<ExpeditionStep, Answer>>;
  studentName: string;
  onContinue: (answer: Answer) => void;
  onFinish: () => void;
};

export function ActivityScreen({ step, answers, studentName, onContinue, onFinish }: ActivityScreenProps) {
  if (step === "rotation-identity") return <RotationIdentity onContinue={onContinue} />;
  if (step === "axis-rotation") return <AxisRotation onContinue={onContinue} />;

  const activity = activities.find(({ id }) => id === step);
  if (!activity) return null;
  const progress = activityProgress(step);
  const frame = step === "build-molecule" || step === "superposition" ? undefined : activity.frame;

  let content: ReactNode;
  switch (step) {
    case "build-molecule":
      content = <BuildMolecule onContinue={onContinue} />;
      break;
    case "repeat-ligand":
      content = <RepeatLigand onContinue={onContinue} />;
      break;
    case "superposition":
      content = <Superposition onContinue={onContinue} />;
      break;
    case "explain-chirality":
      content = <WrittenResponse prompt="Como você explicaria a quiralidade a outro estudante?"
        guidance="Compare o que acontece com o modelo ao girá-lo e ao espelhá-lo. Inclua a ideia de sobreposição."
        onContinue={onContinue} />;
      break;
    case "lactic-acid":
      content = <LacticAcid onContinue={onContinue} />;
      break;
    case "augmented-reality":
      content = (
        <section className="activity-card">
          <h2>Experiência alternativa</h2>
          <p>A visualização pela câmera está indisponível nesta versão. Explore o modelo molecular interativo na tela antes da última verificação.</p>
          <RotatableMolecule ligands={chclbrf} label="Modelo tetraédrico explorável na tela" />
          <button className="flow-button" type="button" onClick={() => onContinue({ value: "Visualização alternativa em tela." })}>
            Continuar para a verificação final
          </button>
        </section>
      );
      break;
    case "master": {
      const score = scoreSummary(answers);
      content = (
        <section className="activity-card activity-result">
          <img src={crystal} alt="" width="72" height="72" />
          <h2>Expedição concluída, {studentName}!</h2>
          <p>{progress.completed} de {progress.total} atividades concluídas.</p>
          <p>{score.correct} de {score.total} respostas avaliadas corretas.</p>
          <button className="flow-button" type="button" onClick={onFinish}>Voltar à seleção de perfil</button>
        </section>
      );
      break;
    }
    default: {
      const question: Question = questions[step];
      content = <ChoiceQuestion question={question} onContinue={onContinue} />;
    }
  }

  return (
    <main className="activity" data-node-id={frame}>
      <div className="activity__shell">
        <img className="activity__decoration" src={decoration} alt="" />
        <header className="activity__header">
          <p>Expedição de estereoquímica</p>
          <h1>{activity.title}</h1>
          <progress value={progress.completed} max={progress.total} aria-label="Progresso da expedição" />
        </header>
        {content}
      </div>
    </main>
  );
}
