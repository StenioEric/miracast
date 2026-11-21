import { useState } from "react";

import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { Button } from "../../components/Button/Button";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { PageFooter } from "../../components/PageLayout/PageLayout";
import { RotatableMolecule } from "../../components/Molecule/Molecule";
import { lactateLigands } from "../../utils/moleculeGeometry";
import "./AcidoLatico.css";

export function AcidoLatico({ onContinue }: { onContinue: (answer: Answer) => void }) {
  const [mirror, setMirror] = useState(false);
  return (
    <ActivityLayout step="lactic-acid"
      footer={<PageFooter><Button onClick={() => onContinue({ value: "Modelo do ácido lático consultado." })}>Continuar</Button></PageFooter>}
    >
      <ContentCard>
        <h2>CH₃–CH(OH)–COOH</h2>
        <p>Observe os quatro grupos ligados ao carbono central e compare as duas formas.</p>
        <RotatableMolecule ligands={lactateLigands} mirror={mirror}
          label={mirror ? "Imagem espelhada do modelo do ácido lático" : "Modelo do carbono central do ácido lático"} />
        <Button variant="secondary" aria-pressed={mirror}
          onClick={() => setMirror((current) => !current)}>Imagem espelhada</Button>
      </ContentCard>
    </ActivityLayout>
  );
}
