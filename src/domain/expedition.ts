export const activities = [
  { id: "rotation-identity", frame: "2003:131", title: "Girar muda a identidade?" },
  { id: "axis-rotation", frame: "2003:91", title: "O eixo de rotação" },
  { id: "qv1", frame: "2003:54", title: "O que muda quando um objeto gira? · Q.V1" },
  { id: "qv1b", frame: "2003:2", title: "O espelho muda a orientação? · Q.V1b" },
  { id: "build-molecule", frame: "2003:914", title: "Monte o CHClBrF" },
  { id: "repeat-ligand", frame: "2003:798", title: "E se repetir?" },
  { id: "identify-chiral", frame: "2003:709", title: "Identifique o quiral" },
  { id: "qv2", frame: "2003:670", title: "Qual molécula tem um carbono quiral? · Q.V2" },
  { id: "superposition", frame: "2003:623", title: "Tente sobrepor" },
  { id: "explain-chirality", frame: "2003:1046", title: "Verbalize o princípio" },
  { id: "active-form", frame: "2003:1008", title: "A forma ativa" },
  { id: "qv3", frame: "2003:968", title: "Por que os enantiômeros são diferentes? · Q.V3" },
  { id: "lactic-acid", frame: "2003:410", title: "Ácido lático" },
  { id: "compare-forms", frame: "2003:348", title: "Mesma ou diferentes?" },
  { id: "qv4", frame: "2003:308", title: "Compare os enantiômeros do ácido lático · Q.V4" },
  { id: "augmented-reality", frame: "2003:264", title: "Compare as duas formas do cristal" },
  { id: "qv5", frame: "2003:236", title: "Por que as formas desviam a luz em sentidos opostos? · Q.V5" },
  { id: "master", frame: "2003:186", title: "Mestre do Quiral" },
] as const;

export type Activity = (typeof activities)[number];
export type ActivityId = Activity["id"];

export const expeditionSteps = ["motivation", "protocol", "classification", ...activities.map(({ id }) => id)] as const;
export type ExpeditionStep = (typeof expeditionSteps)[number];
export type Answer = { value: string; correct?: boolean };

export const expeditionPhases = [
  { first: "classification", title: "Orientação espacial", objective: "Observe o que muda quando um objeto gira ou aparece no espelho.", guided: true },
  { first: "build-molecule", title: "Carbono tetraédrico", objective: "Monte uma molécula e descubra o que acontece quando dois ligantes são iguais.", guided: true },
  { first: "superposition", title: "Imagens no espelho", objective: "Compare duas formas no espelho e explique por que elas não se sobrepõem.", guided: true },
  { first: "lactic-acid", title: "Quiralidade em outra molécula", objective: "Use o que aprendeu para identificar a quiralidade no ácido lático.", guided: false },
  { first: "augmented-reality", title: "As duas formas do cristal", objective: "Reúna suas descobertas para explicar o efeito das duas formas na luz.", guided: false },
] as const satisfies readonly { first: ExpeditionStep; title: string; objective: string; guided: boolean }[];

export function stepTitle(step: ExpeditionStep) {
  if (step === "motivation") return "Motivação";
  if (step === "protocol") return "Protocolo";
  if (step === "classification") return "Plano ou espacial?";
  return activities.find(({ id }) => id === step)?.title ?? step;
}

export function phaseIndex(step: ExpeditionStep) {
  if (step === "master") return expeditionPhases.length;
  const position = expeditionSteps.indexOf(step);
  return expeditionPhases.findLastIndex(({ first }) => expeditionSteps.indexOf(first) <= position);
}

export function nextStep(step: ExpeditionStep): ExpeditionStep | undefined {
  const index = expeditionSteps.indexOf(step);
  return index === -1 ? undefined : expeditionSteps[index + 1];
}

export function activityProgress(step: ExpeditionStep) {
  const first = expeditionSteps.indexOf(expeditionPhases[0].first);
  const total = expeditionSteps.indexOf("master") - first;
  return { completed: Math.max(0, expeditionSteps.indexOf(step) - first), total };
}

export function scoreSummary(answers: Partial<Record<ExpeditionStep, Answer>>) {
  const graded = Object.values(answers).filter((answer) => typeof answer.correct === "boolean");
  return { correct: graded.filter((answer) => answer.correct).length, total: graded.length };
}
