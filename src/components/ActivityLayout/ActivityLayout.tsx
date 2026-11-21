import type { ReactNode } from "react";

import { activities, activityProgress } from "../../domain/expedition";
import type { ExpeditionStep } from "../../domain/expedition";
import { DraMiraAvatar } from "../DraMiraAvatar/DraMiraAvatar";
import { PageHeader, PageLayout } from "../PageLayout/PageLayout";
import { ProgressIndicator } from "../ProgressIndicator/ProgressIndicator";
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
  step, frame, frameInContent, title, stage = "Expedição de estereoquímica", guidance,
  className, introductory, footer, children,
}: ActivityLayoutProps) {
  const activity = activities.find(({ id }) => id === step);
  const progress = activityProgress(step);
  const header = (
    <PageHeader title={title ?? activity?.title} label={stage}>
      {activity && <ProgressIndicator {...progress} />}
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
      {guidance && <aside className="activity-guide" aria-label="Orientação da Dra. Mira">
        <DraMiraAvatar />
        <div className="activity-guide__message">
          <p className="activity-guide__name">Dra. Mira</p>
          <p>{guidance}</p>
        </div>
      </aside>}
      {children}
    </PageLayout>
  );
}
