import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter, PageHeader, PageLayout } from "../../components/PageLayout/PageLayout";
import "./Start.css";

type StartProps = {
  onEnterAsStudent: () => void;
  onEnterAsProfessor: () => void;
};

export function Start({ onEnterAsStudent, onEnterAsProfessor }: StartProps) {
  return (
    <PageLayout
      frame="2022:2"
      header={<PageHeader brand />}
      footer={<PageFooter credits="full" />}
    >
      <p className="inicio-perfil__descricao">Uma expedição para descobrir o mundo da estereoquímica.</p>
      <ContentCard aria-labelledby="inicio-perfil-titulo">
        <h2 id="inicio-perfil-titulo">Como você deseja acessar o MiraCast?</h2>
        <Button onClick={onEnterAsStudent}><span aria-hidden="true">👤</span>Entrar como Aluno</Button>
        <Button variant="secondary" onClick={onEnterAsProfessor}><span aria-hidden="true">👩‍🔬</span>Entrar como Professor</Button>
      </ContentCard>
    </PageLayout>
  );
}
