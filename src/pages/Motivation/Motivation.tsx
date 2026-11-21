import limoneno from "../../assets/limoneno.svg";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import "./Motivation.css";

export function Motivation({ onStartProtocol }: { onStartProtocol: () => void }) {
  return (
    <ActivityLayout
      introductory
      step="motivation"
      frame="13:1225"
      stage="Motivação · Tela 1"
      title="MiraCast"
      guidance="Encontramos algo único nesta caverna. Este cristal tem duas formas moleculares que desviam a luz em direções opostas. Você toparia desvendar esse segredo?"
      footer={<PageFooter><Button onClick={onStartProtocol}>Aceitar a expedição</Button></PageFooter>}
    >
      <ContentCard aria-labelledby="motivacao-titulo">
        <h2 id="motivacao-titulo">O Segredo do Cristal Quiral</h2>
        <p>
          💎 Uma expedição pela estereoquímica. A rotação da luz polarizada por
          moléculas quirais é um fenômeno real. O limoneno-R gira para a direita
          (+) e o limoneno-S para a esquerda (−).
        </p>
        <img className="activity-illustration motivacao__diagrama" src={limoneno}
          alt="Duas formas espelhadas de limoneno, R e S, separadas por um plano do espelho."
          width="325" height="229" />
      </ContentCard>
    </ActivityLayout>
  );
}
