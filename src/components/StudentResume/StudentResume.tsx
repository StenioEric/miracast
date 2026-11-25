import { Button } from "../Button/Button";
import { CopyTextButton } from "../CopyTextButton/CopyTextButton";

export function StudentResume({ code, pending, onIssue }: { code: string; pending: boolean; onIssue: () => void }) {
  return <details>
    <summary>Código pessoal de retomada</summary>
    <p>Guarde este código para recuperar seu progresso se fechar a aba ou trocar de aparelho. Ele recupera as respostas salvas. Mantenha-o privado.</p>
    {code && <>
      <p><code className="student-resume__code">{code}</code></p>
      <CopyTextButton value={code} label="Copiar código pessoal" />
    </>}
    <p>Ao gerar um novo código, qualquer código anterior deixa de funcionar.</p>
    <Button variant="secondary" disabled={pending} onClick={onIssue}>
      {pending ? "Gerando…" : "Gerar código de retomada"}
    </Button>
  </details>;
}
