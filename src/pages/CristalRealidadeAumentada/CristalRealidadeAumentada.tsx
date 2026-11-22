import { useId } from "react";

import crystal from "../../assets/cristal.svg";
import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import "./CristalRealidadeAumentada.css";

export function CristalRealidadeAumentada({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const availabilityId = useId();

  return (
    <ActivityLayout
      step="augmented-reality"
      stage="Ação Mental Interna · Tela 19"
      title="O CRISTAL EM REALIDADE AUMENTADA"
      guidance="É o momento que você esperava! Aponte a câmera e o cristal vai se abrir. Use o botão Comparar para ver as duas formas tentando se sobrepor no espaço real."
    >
      <ContentCard className="crystal-preview">
        <img src={crystal} alt="" width="60" height="60" />
        <p>
          Os dois enantiômeros do CHClBrF emergem no mundo real.
          Gire com o dedo e toque em “Comparar” para ver a não-superponibilidade ao vivo.
        </p>
        <Button disabled aria-describedby={availabilityId}>
          <span aria-hidden="true">📷</span>
          ABRIR O CRISTAL EM RA
        </Button>
        <p id={availabilityId} className="crystal-preview__availability">
          Experiência em RA ainda indisponível. Use o que você aprendeu na expedição para responder.
        </p>
      </ContentCard>
      <ChoiceQuestion
        question={questions["augmented-reality"]}
        reviewOnSelect
        onContinue={onContinue}
      />
    </ActivityLayout>
  );
}
