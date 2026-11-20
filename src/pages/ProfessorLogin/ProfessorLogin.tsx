import { ProfessorLayout } from "../../components/ProfessorLayout/ProfessorLayout";

type ProfessorLoginProps = {
  onBackToStudent: () => void;
  onLogin: () => void;
};

export function ProfessorLogin({ onBackToStudent, onLogin }: ProfessorLoginProps) {
  return (
    <ProfessorLayout frame="2020:2">
      <section className="professor__panel">
        <h1>Entrar no MiraCast</h1>
        <p>Acesse suas salas e acompanhe a turma.</p>
        <p>As salas ficam neste navegador. Use outra aba do mesmo perfil para entrar como aluno.</p>
        <button className="flow-button" type="button" onClick={onLogin}>Entrar na área local</button>
      </section>
      <button className="flow-link" type="button" onClick={onBackToStudent}>Voltar à seleção de perfil</button>
    </ProfessorLayout>
  );
}
