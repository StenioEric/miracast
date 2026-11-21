import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";
import "./ProfessorLogin.css";

type ProfessorLoginProps = {
  onBackToStudent: () => void;
  onLogin: () => void;
};

export function ProfessorLogin({ onBackToStudent, onLogin }: ProfessorLoginProps) {
  return (
    <ProfessorLayout frame="2020:2"
      title="Entrar no MiraCast"
      navigation={<Button variant="link" onClick={onBackToStudent}>Voltar à seleção de perfil</Button>}
    >
      <ContentCard>
        <p>Acesse suas salas e acompanhe a turma.</p>
        <p>As salas ficam neste navegador. Use outra aba do mesmo perfil para entrar como aluno.</p>
        <Button onClick={onLogin}>Entrar na área local</Button>
      </ContentCard>
    </ProfessorLayout>
  );
}
