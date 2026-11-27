import { useStudentDraft } from "../../components/StudentWork/studentWork";

import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { MoleculeViewerButton } from "../../components/MoleculeViewer/MoleculeViewerButton";
import { bromochlorofluoromethane } from "../../utils/moleculeGeometry";
import "./TenteSobrepor.css";

export function TenteSobrepor({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [checked, setChecked] = useStudentDraft("superposition-correct", false);
  return (
    <ActivityLayout step="superposition" title="Tente sobrepor" frameInContent>
      <div className="activity-comparison" data-node-id={checked ? "2003:623" : "2003:1089"}>
        <ContentCard>
          <h2>{checked ? "Correto: as imagens não se sobrepõem" : "Compare com a imagem no espelho"}</h2>
          <p>Gire o modelo original e use a imagem espelhada como referência para comparar a posição dos quatro ligantes.</p>
          <MoleculeViewerButton title="Tente sobrepor" molecule={bromochlorofluoromethane} allowOverlay />
        </ContentCard>
        <ChoiceQuestion onEvaluate={setChecked} onContinue={onContinue} question={questions["superposition"]} />
      </div>
    </ActivityLayout>
  );
}
