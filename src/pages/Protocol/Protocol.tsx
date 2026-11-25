import { fieldNotebookQuestions } from "../../domain/fieldNotebook";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import "./Protocol.css";

export function Protocol({ onStartPhase1 }: { onStartPhase1: () => void }) {
  return (
    <ActivityLayout
      introductory
      step="protocol"
      frame="13:1261"
      stage="Base Orientadora da Ação · Tela 2"
      title="Protocolo MiraCast"
      guidance="Tome meu caderno de campo. Estas 5 perguntas vão guiar toda a sua análise. Consulte sempre que precisar — nas fases finais, você seguirá sozinho."
      footer={<PageFooter><Button onClick={onStartPhase1}>Iniciar fase 1</Button></PageFooter>}
    >
      <ContentCard aria-label="Caderno de campo">
        <ol className="protocolo__perguntas">
          {fieldNotebookQuestions.map((question) => <li key={question}>{question}</li>)}
        </ol>
      </ContentCard>
    </ActivityLayout>
  );
}
