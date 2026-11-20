export const activities = [
  { id: "rotation-identity", frame: "2003:131", title: "Girar muda a identidade?" },
  { id: "axis-rotation", frame: "2003:91", title: "O eixo de rotação" },
  { id: "qv1", frame: "2003:54", title: "Verificação Q.V1" },
  { id: "qv1b", frame: "2003:2", title: "Verificação Q.V1b" },
  { id: "build-molecule", frame: "2003:914", title: "Monte o CHClBrF" },
  { id: "repeat-ligand", frame: "2003:798", title: "E se repetir?" },
  { id: "identify-chiral", frame: "2003:709", title: "Identifique o quiral" },
  { id: "qv2", frame: "2003:670", title: "Verificação Q.V2" },
  { id: "superposition", frame: "2003:623", title: "Tente sobrepor — Correto" },
  { id: "explain-chirality", frame: "2003:1046", title: "Verbalize o princípio" },
  { id: "active-form", frame: "2003:1008", title: "A forma ativa" },
  { id: "qv3", frame: "2003:968", title: "Verificação Q.V3" },
  { id: "lactic-acid", frame: "2003:410", title: "Ácido lático" },
  { id: "compare-forms", frame: "2003:348", title: "Mesma ou diferentes?" },
  { id: "qv4", frame: "2003:308", title: "Verificação Q.V4" },
  { id: "augmented-reality", frame: "2003:264", title: "O cristal em realidade aumentada" },
  { id: "qv5", frame: "2003:236", title: "Verificação final Q.V5" },
  { id: "master", frame: "2003:186", title: "Mestre do Quiral" },
] as const;

export type Activity = (typeof activities)[number];
export type ActivityId = Activity["id"];

export const expeditionSteps = ["motivation", "protocol", "classification", ...activities.map(({ id }) => id)] as const;
export type ExpeditionStep = (typeof expeditionSteps)[number];
export type Answer = { value: string; correct?: boolean };

export function nextStep(step: ExpeditionStep): ExpeditionStep | undefined {
  const index = expeditionSteps.indexOf(step);
  return index === -1 ? undefined : expeditionSteps[index + 1];
}

export function activityProgress(step: ExpeditionStep) {
  const index = activities.findIndex(({ id }) => id === step);
  const total = activities.length - 1;
  return { completed: Math.max(0, index), total };
}

export function scoreSummary(answers: Partial<Record<ExpeditionStep, Answer>>) {
  const graded = Object.values(answers).filter((answer) => typeof answer.correct === "boolean");
  return { correct: graded.filter((answer) => answer.correct).length, total: graded.length };
}
