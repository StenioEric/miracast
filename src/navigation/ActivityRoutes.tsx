import type { ComponentType } from "react";

import type { ActivityId, Answer, ExpeditionStep } from "../domain/expedition";
import { AcidoLatico } from "../pages/AcidoLatico/AcidoLatico";
import { CristalRealidadeAumentada } from "../pages/CristalRealidadeAumentada/CristalRealidadeAumentada";
import { EixoRotacao } from "../pages/EixoRotacao/EixoRotacao";
import { FormaAtiva } from "../pages/FormaAtiva/FormaAtiva";
import { GirarMudaIdentidade } from "../pages/GirarMudaIdentidade/GirarMudaIdentidade";
import { IdentifiqueQuiral } from "../pages/IdentifiqueQuiral/IdentifiqueQuiral";
import { MesmaOuDiferentes } from "../pages/MesmaOuDiferentes/MesmaOuDiferentes";
import { MestreDoQuiral } from "../pages/MestreDoQuiral/MestreDoQuiral";
import { MonteCHClBrF } from "../pages/MonteCHClBrF/MonteCHClBrF";
import { SeRepetir } from "../pages/SeRepetir/SeRepetir";
import { TenteSobrepor } from "../pages/TenteSobrepor/TenteSobrepor";
import { VerbalizePrincipio } from "../pages/VerbalizePrincipio/VerbalizePrincipio";
import { VerificacaoFinalQV5 } from "../pages/VerificacaoFinalQV5/VerificacaoFinalQV5";
import { VerificacaoQV1 } from "../pages/VerificacaoQV1/VerificacaoQV1";
import { VerificacaoQV1b } from "../pages/VerificacaoQV1b/VerificacaoQV1b";
import { VerificacaoQV2 } from "../pages/VerificacaoQV2/VerificacaoQV2";
import { VerificacaoQV3 } from "../pages/VerificacaoQV3/VerificacaoQV3";
import { VerificacaoQV4 } from "../pages/VerificacaoQV4/VerificacaoQV4";

type ActivityPageProps = {
  answers: Partial<Record<ExpeditionStep, Answer>>;
  studentName: string;
  onContinue: (answer: Answer) => void;
  onFinish: () => void;
};

const activityPages: Record<ActivityId, ComponentType<ActivityPageProps>> = {
  "rotation-identity": GirarMudaIdentidade,
  "axis-rotation": EixoRotacao,
  qv1: VerificacaoQV1,
  qv1b: VerificacaoQV1b,
  "build-molecule": MonteCHClBrF,
  "repeat-ligand": SeRepetir,
  "identify-chiral": IdentifiqueQuiral,
  qv2: VerificacaoQV2,
  superposition: TenteSobrepor,
  "explain-chirality": VerbalizePrincipio,
  "active-form": FormaAtiva,
  qv3: VerificacaoQV3,
  "lactic-acid": AcidoLatico,
  "compare-forms": MesmaOuDiferentes,
  qv4: VerificacaoQV4,
  "augmented-reality": CristalRealidadeAumentada,
  qv5: VerificacaoFinalQV5,
  master: MestreDoQuiral,
};

export function ActivityRoutes({ step, ...props }: ActivityPageProps & { step: ActivityId }) {
  const Page = activityPages[step];
  return Page ? <Page key={step} {...props} /> : null;
}
