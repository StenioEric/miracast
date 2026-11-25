import { useContext } from "react";
import type { ReactNode } from "react";

import { activities, activityProgress, expeditionPhases, phaseIndex } from "../../domain/expedition";
import type { ExpeditionStep } from "../../domain/expedition";
import { DraMiraAvatar } from "../DraMiraAvatar/DraMiraAvatar";
import { PageHeader, PageLayout } from "../PageLayout/PageLayout";
import { ProgressIndicator } from "../ProgressIndicator/ProgressIndicator";
import { StudentWorkContext } from "../StudentWork/studentWork";
import { StudentWorkStatus } from "../StudentWork/StudentWorkStatus";
import "./ActivityLayout.css";

type ActivityLayoutProps = {
  step: ExpeditionStep;
  frame?: string;
  frameInContent?: boolean;
  title?: string;
  stage?: string;
  guidance?: ReactNode;
  className?: string;
  introductory?: boolean;
  footer?: ReactNode;
  children: ReactNode;
};

export function ActivityLayout({
  step, frame, frameInContent, title, stage, guidance,
  className, introductory, footer, children,
}: ActivityLayoutProps) {
  const resume = useContext(StudentWorkContext)?.resume;
  const activity = activities.find(({ id }) => id === step);
  const progress = activityProgress(step);
  const phaseNumber = phaseIndex(step);
  const phase = expeditionPhases[phaseNumber];
  const header = (
    <PageHeader title={title ?? activity?.title} label={phase ? `Fase ${phaseNumber + 1} · ${phase.title}` : stage}>
      {phase && <>
        <ProgressIndicator {...progress} />
        <p className="activity-position">Atividade {progress.completed + 1} de {progress.total}</p>
      </>}
    </PageHeader>
  );

  return (
    <PageLayout
      frame={frameInContent ? undefined : frame ?? activity?.frame}
      theme={introductory ? "intro" : "expedition"}
      className={className}
      header={header}
      footer={footer}
    >
      <div className="activity-tools">
        {resume}
      </div>
      {phase?.first === step && <p className="activity-objective">{phase.objective}</p>}
      {guidance && <aside className="activity-guide" aria-label="Orientação da Dra. Mira">
        <DraMiraAvatar />
        <div className="activity-guide__message">
          <p className="activity-guide__name">Dra. Mira</p>
          <p>{guidance}</p>
        </div>
      </aside>}
      {children}
      <StudentWorkStatus />
    </PageLayout>
  );
}
