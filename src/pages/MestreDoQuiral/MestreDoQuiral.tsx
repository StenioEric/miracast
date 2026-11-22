import type { Answer, ExpeditionStep } from "../../domain/expedition";
import { activityProgress, scoreSummary } from "../../domain/expedition";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { DraMiraAvatar } from "../../components/DraMiraAvatar/DraMiraAvatar";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./MestreDoQuiral.css";

type MestreDoQuiralProps = {
  answers: Partial<Record<ExpeditionStep, Answer>>;
  studentName: string;
  onFinish: () => void;
};

const achievements = [
  { name: "Olho Espacial", icon: "👁️" },
  { name: "Construtor de Tetraedro", icon: "🔷" },
  { name: "Decodificador do Espelho", icon: "🪞" },
  { name: "Explorador Autônomo", icon: "🧭" },
  { name: "Mestre do Cristal Quiral", icon: "💎" },
];

export function MestreDoQuiral({ answers, studentName, onFinish }: MestreDoQuiralProps) {
  const progress = activityProgress("master");
  const score = scoreSummary(answers);

  return (
    <PageLayout
      theme="expedition"
      frame="2003:186"
      className="master-page"
      header={<PageHeader title="Mestre do Cristal!" />}
      footer={
        <PageFooter>
          <Button className="master-exit" onClick={onFinish}>
            <span aria-hidden="true">🚪</span> SAIR
          </Button>
        </PageFooter>
      }
    >
      <ContentCard className="master-certificate">
        <DraMiraAvatar />
        <h2>Certificado de Explorador Quiral</h2>
        <p className="master-certificate__name">{studentName}</p>
        <figure>
          <blockquote>
            “Parabéns! Você construiu, comparou e compreendeu a geometria molecular do cristal quiral.
            Você é um Explorador MiraCast!”
          </blockquote>
          <figcaption>— Dra. Mira</figcaption>
        </figure>
      </ContentCard>

      <section className="master-achievements" aria-labelledby="master-achievements-title">
        <h2 id="master-achievements-title">
          <span aria-hidden="true">🏅</span> Conquistas da Expedição
        </h2>
        <ul className="master-achievements__list">
          {achievements.map(({ name, icon }, index) => (
            <li key={name}>
              <ContentCard className="master-achievement">
                <span className="master-achievement__icon" aria-hidden="true">{icon}</span>
                <h3>{name}</h3>
                <p>Fase {index + 1}</p>
              </ContentCard>
            </li>
          ))}
        </ul>
      </section>

      <ContentCard className="master-summary">
        <p>
          O <span className="master-summary__formula">CHClBrF</span> tem um carbono tetraédrico com 4 átomos
          diferentes → gera dois <span className="master-summary__enantiomers">enantiômeros</span> especulares não
          superponíveis. A <span className="master-summary__configuration">organização espacial oposta</span> faz
          cada forma desviar a luz para um lado!
        </p>
      </ContentCard>

      <div className="master-score">
        <p>{progress.completed} de {progress.total} atividades concluídas.</p>
        <p>{score.correct} de {score.total} respostas avaliadas corretas.</p>
      </div>
    </PageLayout>
  );
}
