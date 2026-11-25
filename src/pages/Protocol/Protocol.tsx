import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import "./Protocol.css";

const questions = [
  "O objeto/molécula ocupa três dimensões simultaneamente (largura, altura, profundidade)?",
  "Girar o objeto muda sua identidade ou apenas o ângulo de observação?",
  "O carbono central está ligado a quatro átomos ou grupos diferentes?",
  "A imagem especular pode ser sobreposta à original em alguma orientação?",
  "As duas formas (enantiômeros) interagem de forma diferente com o mundo (luz, receptores)?",
];

export function Protocol({ onStartPhase1 }: { onStartPhase1: () => void }) {
  return (
    <ActivityLayout
      introductory
      step="protocol"
      frame="13:1261"
      stage="Base Orientadora da Ação · Tela 2"
      title="Protocolo MiraCast"
      guidance="Tome meu caderno de campo. Leia estas cinco perguntas antes de iniciar a expedição. Elas vão orientar sua análise dos objetos e das moléculas."
      footer={<PageFooter><Button onClick={onStartPhase1}>Iniciar fase 1</Button></PageFooter>}
    >
      <ContentCard aria-label="Caderno de campo">
        <ol className="protocolo__perguntas">
          {questions.map((question) => <li key={question}>{question}</li>)}
        </ol>
      </ContentCard>
    </ActivityLayout>
  );
}
