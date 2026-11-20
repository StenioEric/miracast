import type { ActivityId } from "./steps";

export type Question = {
  prompt: string;
  options: readonly [string, string, ...string[]];
  correct: number;
  explanation: string;
};

export const questions = {
  qv1: {
    prompt: "Quando um objeto rígido gira, o que muda?",
    options: ["Sua orientação no espaço", "A forma do objeto", "A identidade do objeto"],
    correct: 0,
    explanation: "Uma rotação rígida muda a orientação. As distâncias e os ângulos internos permanecem iguais.",
  },
  qv1b: {
    prompt: "Uma imagem no espelho pode sempre ser obtida girando o objeto original?",
    options: ["Sim, basta encontrar o ângulo", "Não, objetos quirais são um contraexemplo"],
    correct: 1,
    explanation: "Um objeto quiral e sua imagem especular não coincidem por rotação e translação.",
  },
  "identify-chiral": {
    prompt: "Qual modelo tem um carbono tetraédrico com quatro ligantes diferentes?",
    options: ["CHClBrF", "CH₂ClBr", "CH₄"],
    correct: 0,
    explanation: "Em CHClBrF, os ligantes H, Cl, Br e F são todos distintos. Os outros exemplos repetem H.",
  },
  qv2: {
    prompt: "Por que substituir F por H nesse modelo elimina o centro quiral?",
    options: ["Porque o carbono deixa de ter quatro ligações", "Porque o carbono passa a ter dois ligantes idênticos", "Porque o carbono perde a geometria tetraédrica"],
    correct: 1,
    explanation: "A substituição mantém as quatro ligações e deixa dois hidrogênios equivalentes nesse carbono.",
  },
  "active-form": {
    prompt: "Uma amostra gira o plano da luz polarizada. Como descrevemos essa propriedade?",
    options: ["Atividade óptica", "Mudança de conectividade", "Isomeria constitucional"],
    correct: 0,
    explanation: "Atividade óptica é a capacidade da amostra de girar o plano da luz polarizada. O sinal da rotação é medido sob condições definidas.",
  },
  qv3: {
    prompt: "O rótulo R, por si só, indica que uma substância desvia a luz para qual lado?",
    options: ["Sempre para a direita", "Sempre para a esquerda", "O sentido precisa ser determinado experimentalmente"],
    correct: 2,
    explanation: "R e S descrevem a configuração espacial. Os sinais (+) e (−) descrevem o sentido observado da rotação óptica.",
  },
  "compare-forms": {
    prompt: "As duas formas espelhadas do ácido lático têm a mesma conectividade e não se sobrepõem. Qual é a relação entre elas?",
    options: ["São a mesma forma em ângulos diferentes", "São enantiômeros", "São isômeros com conectividades diferentes"],
    correct: 1,
    explanation: "Enantiômeros são imagens especulares não sobreponíveis e têm a mesma conectividade.",
  },
  qv4: {
    prompt: "Quais são os quatro ligantes do carbono quiral do ácido lático?",
    options: ["H, OH, CH₃ e COOH", "H, H, OH e COOH", "H, OH, OH e CH₃"],
    correct: 0,
    explanation: "A fórmula condensada CH₃–CH(OH)–COOH mostra que o carbono central está ligado a H, OH, CH₃ e COOH.",
  },
  qv5: {
    prompt: "Qual procedimento distingue um modelo quiral de um aquiral?",
    options: ["Contar todos os átomos da fórmula", "Comparar a imagem no espelho usando apenas rotações e translações", "Alterar uma ligação até os modelos coincidirem"],
    correct: 1,
    explanation: "A comparação conserva as ligações e a geometria. Se a imagem especular não puder ser sobreposta, o modelo é quiral.",
  },
} satisfies Partial<Record<ActivityId, Question>>;
