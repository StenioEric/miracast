import type { ReactNode } from "react";
import { Button } from "../../components/Button/Button";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./SessaoIndisponivel.css";

export function SessaoIndisponivel({ onBack, onRetry, ended = false, children }: {
  onBack: () => void; onRetry?: () => void; ended?: boolean; children?: ReactNode;
}) {
  return (
    <PageLayout
      className="sessao-indisponivel"
      header={<PageHeader title={ended ? "Expedição encerrada" : "Sala ou sessão indisponível"} />}
      footer={<PageFooter>
        {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
        <Button variant="secondary" onClick={onBack}>{ended ? "Voltar à entrada" : "Voltar"}</Button>
      </PageFooter>}
    >
      <p>{ended
        ? "O professor encerrou esta expedição. As respostas enviadas estão registradas."
        : onRetry ? "Confira sua conexão e tente carregar de novo." : "Volte para selecionar uma sala ou iniciar uma nova sessão."}</p>
      {children}
    </PageLayout>
  );
}
