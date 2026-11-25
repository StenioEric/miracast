import { useStudentDraft } from "../../components/StudentWork/studentWork";

import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import type { Ligands } from "../../utils/moleculeGeometry";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { Molecule } from "../../components/Molecule/Molecule";
import { chclbrf } from "../../utils/moleculeGeometry";
import "./SeRepetir.css";

const replacedLigands: Ligands = ["H", "Cl", "Br", "H"];

export function SeRepetir({
  onContinue,
}: {
  onContinue: (answer: Answer) => void;
}) {
  const [replaced, setReplaced] = useStudentDraft("substitution", false);
  const [answered, setAnswered] = useStudentDraft("substitution-answered", false);
  const ligands = replaced ? replacedLigands : chclbrf;

  return (
    <ActivityLayout
      step="repeat-ligand"
      frame="2003:798"
      title={replaced ? "A repetição muda tudo" : "E se repetir?"}
      guidance={replaced
        ? "Agora substituímos F por H. O que aconteceu com os ligantes do carbono?"
        : "Substitua um dos ligantes e observe se o carbono continua quiral."}
    >
      <ContentCard aria-label="Modelo da molécula">
        <div className="se-repetir__formula">
          <span>{replaced ? "CH₂ClBr" : "CHClBrF"}</span>
          <small>{replaced ? "Ligantes repetidos" : "Quatro ligantes diferentes"}</small>
        </div>

        <div className="activity-model">
          <Molecule
            ligands={ligands}
            label={replaced ? "Modelo de CH₂ClBr com dois hidrogênios iguais" : "Modelo de CHClBrF com quatro ligantes diferentes"}
          />
        </div>

        <div className="se-repetir__comparacao">
          <div>
            <span className="se-repetir__ligante se-repetir__ligante--h">H</span>
            <span className="se-repetir__ligante se-repetir__ligante--cl">Cl</span>
          </div>
          <div>
            <span className="se-repetir__ligante se-repetir__ligante--br">Br</span>
            <span className={replaced ? "se-repetir__ligante se-repetir__ligante--h" : "se-repetir__ligante se-repetir__ligante--f"}>
              {replaced ? "H" : "F"}
            </span>
          </div>
        </div>

        {!replaced ? (
          <Button onClick={() => setReplaced(true)}>
            Substituir F por H
          </Button>
        ) : (
          <Button variant="secondary" disabled={answered} onClick={() => setReplaced(false)}>
            Voltar para CHClBrF
          </Button>
        )}
      </ContentCard>

      {replaced && <ChoiceQuestion question={questions["repeat-ligand"]}
        onEvaluate={() => setAnswered(true)} onContinue={onContinue} />}
    </ActivityLayout>
  );
}
