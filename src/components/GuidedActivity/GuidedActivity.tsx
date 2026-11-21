import type { ReactNode } from "react";

import { DraMiraAvatar } from "../DraMiraAvatar/DraMiraAvatar";
import "./GuidedActivity.css";

type GuidedActivityProps = {
  className: string;
  frame: string;
  stage: string;
  title: string;
  guidance: ReactNode;
  children: ReactNode;
};

export function GuidedActivity({ className, frame, stage, title, guidance, children }: GuidedActivityProps) {
  return (
    <main className={`guided-activity ${className}`} data-node-id={frame}>
      <div className="guided-activity__shell">
        <div className="guided-activity__stage">{stage}</div>
        <h1 className="guided-activity__title">{title}</h1>
        <section className="guided-activity__guide" aria-label="Orientação da Dra. Mira">
          <DraMiraAvatar className="guided-activity__avatar" />
          <div className="guided-activity__bubble">
            <p>DRA. MIRA</p>
            <span>{guidance}</span>
          </div>
        </section>
        {children}
      </div>
    </main>
  );
}
