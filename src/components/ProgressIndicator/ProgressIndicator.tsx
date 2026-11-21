import "./ProgressIndicator.css";

export function ProgressIndicator({ completed, total, label = "Progresso da expedição" }: {
  completed: number;
  total: number;
  label?: string;
}) {
  return <progress className="expedition-progress" value={completed} max={total} aria-label={label} />;
}
