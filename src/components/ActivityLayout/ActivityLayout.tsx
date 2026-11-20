import type { ReactNode } from "react";

import decoration from "../../assets/forma-decorativa.svg";
import { activities, activityProgress } from "../../domain/expedition";
import type { ActivityId } from "../../domain/expedition";
import "./ActivityLayout.css";

type ActivityLayoutProps = {
  step: ActivityId;
  frameInContent?: boolean;
  children: ReactNode;
};

export function ActivityLayout({ step, frameInContent, children }: ActivityLayoutProps) {
  const activity = activities.find(({ id }) => id === step);
  if (!activity) return null;
  const progress = activityProgress(step);

  return (
    <main className="activity" data-node-id={frameInContent ? undefined : activity.frame}>
      <div className="activity__shell">
        <img className="activity__decoration" src={decoration} alt="" />
        <header className="activity__header">
          <p>Expedição de estereoquímica</p>
          <h1>{activity.title}</h1>
          <progress value={progress.completed} max={progress.total} aria-label="Progresso da expedição" />
        </header>
        {children}
      </div>
    </main>
  );
}
