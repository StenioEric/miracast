import type { ReactNode } from "react";

import decoration from "../../assets/forma-decorativa.svg";
import { Brand } from "../Brand/Brand";
import "./style.css";

export function ProfessorLayout({ frame, children }: { frame: string; children: ReactNode }) {
  return (
    <main className="professor" data-node-id={frame}>
      <div className="professor__shell">
        <img className="professor__decoration" src={decoration} alt="" />
        <div className="professor__brand"><Brand /></div>
        <p className="professor__badge">ÁREA DO PROFESSOR</p>
        {children}
        <footer className="professor__footer">MiraCast · PROFQUI/UFRN</footer>
      </div>
    </main>
  );
}
