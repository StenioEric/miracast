import cristal from "../../assets/cristal.svg";
import "./style.css";

export function Brand({ as: Title = "h1" }: { as?: "h1" | "p" }) {
  return (
    <div className="marca-miracast">
      <Title className="marca-miracast__titulo">MiraCast</Title>
      <div className="marca-miracast__subtitulo">
        <img src={cristal} alt="" />
        <span>O Segredo do Cristal Quiral</span>
      </div>
    </div>
  );
}
