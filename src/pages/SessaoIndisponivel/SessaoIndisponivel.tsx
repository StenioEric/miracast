import "./SessaoIndisponivel.css";

export function SessaoIndisponivel({ onBack }: { onBack: () => void }) {
  return <main className="sessao-indisponivel">
    <h1>Sala ou sessão indisponível</h1>
    <button type="button" onClick={onBack}>Voltar</button>
  </main>;
}
