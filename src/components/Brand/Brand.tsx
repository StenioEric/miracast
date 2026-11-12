import type { ReactElement } from "react";

import cristal from "../../assets/cristal.svg";
import "./style.css";

export const Brand = (): ReactElement => (
  <header className="marca-miracast">
    <h1>MiraCast</h1>
    <div className="marca-miracast__subtitulo">
      <img src={cristal} alt="" aria-hidden="true" />
      <span>O Segredo do Cristal Quiral</span>
    </div>
  </header>
);