import { Button } from "../../components/Button/Button";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./SessaoIndisponivel.css";

export function SessaoIndisponivel({ onBack }: { onBack: () => void }) {
  return (
    <PageLayout
      className="sessao-indisponivel"
      header={<PageHeader title="Sala ou sessão indisponível" />}
      footer={<PageFooter><Button variant="secondary" onClick={onBack}>Voltar</Button></PageFooter>}
    >
      <p>Volte para selecionar uma sala ou iniciar uma nova sessão.</p>
    </PageLayout>
  );
}
