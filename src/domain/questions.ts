import type { Answer, ExpeditionStep } from "./expedition";

type QuestionOption = {
  value: string;
  label?: string;
  explanation: string;
};

export type Question = {
  prompt: string;
  options: readonly [QuestionOption, QuestionOption, ...QuestionOption[]];
  correct: number;
};

export const questions = {
  "axis-rotation": {
    prompt: "Ao girar em torno do seu eixo, a pirâmide mudou de forma?",
    correct: 1,
    options: [
      {
        value: "Sim, a aparência diferente indica outra figura.",
        explanation: "A silhueta pode parecer diferente porque outras faces ficam visíveis. As medidas e os ângulos entre as faces permanecem iguais durante a rotação.",
      },
      {
        value: "Não, a pirâmide é a mesma em outra orientação.",
        explanation: "A rotação muda a orientação da pirâmide. Sua forma e sua identidade permanecem as mesmas.",
      },
      {
        value: "Sim, girar sempre cria um objeto novo.",
        explanation: "Girar a pirâmide mantém suas faces e arestas ligadas da mesma maneira. Você continua observando o mesmo objeto de outro ângulo.",
      },
      {
        value: "Depende do ângulo em que eu parar.",
        explanation: "Qualquer ângulo de rotação preserva o comprimento das arestas e os ângulos da pirâmide. O que depende do ângulo é a vista do objeto.",
      },
    ],
  },
  "qv1": {
    prompt: "Quando um objeto rígido gira, o que muda?",
    correct: 1,
    options: [
      {
        value: "A forma do objeto",
        explanation: "O contorno visto de um ângulo pode mudar, mas uma rotação rígida preserva as distâncias internas e, portanto, a forma do objeto.",
      },
      {
        value: "A orientação do objeto",
        explanation: "A rotação muda a orientação do objeto. Sua forma, seu tamanho e sua identidade permanecem os mesmos.",
      },
      {
        value: "A identidade do objeto",
        explanation: "O objeto continua sendo o mesmo porque suas dimensões e a disposição de suas partes são preservadas. Só sua orientação no espaço muda.",
      },
    ],
  },
  "qv1b": {
    prompt: "A imagem no espelho de um objeto quiral pode ser obtida girando o objeto original?",
    correct: 1,
    options: [
      {
        value: "Sim — basta girar o objeto até que ele coincida",
        explanation: "Uma rotação preserva a configuração do objeto. Um objeto quiral e sua imagem especular têm configurações que não coincidem, mesmo combinando rotações e translações.",
      },
      {
        value: "Não — objetos quirais não podem ser sobrepostos à imagem especular",
        explanation: "Por definição, um objeto quiral não se sobrepõe à sua imagem especular usando rotações e translações.",
      },
    ],
  },
  "build-molecule": {
    prompt: "Com os 4 átomos posicionados, esse carbono é quiral?",
    correct: 0,
    options: [
      {
        value: "A. Sim — possui 4 átomos todos diferentes",
        explanation: "Sim. O carbono tetraédrico está ligado a H, Cl, Br e F, quatro átomos diferentes. As duas configurações espelhadas não se sobrepõem.",
      },
      {
        value: "B. Não — ainda faltam ligações",
        explanation: "A montagem está completa. As quatro posições estão ocupadas por H, Cl, Br e F. Como os quatro ligantes são diferentes, esse carbono tetraédrico é um centro quiral.",
      },
    ],
  },
  "repeat-ligand": {
    prompt: "Depois da substituição, esse carbono permanece um centro quiral?",
    correct: 1,
    options: [
      {
        value: "Sim, ainda há quatro ligações",
        label: "A. Sim, ainda há quatro ligações",
        explanation: "O carbono continua com quatro ligações, mas agora duas delas vão para hidrogênios iguais. Para ser um centro quiral deste tipo, os quatro ligantes precisam ser diferentes.",
      },
      {
        value: "Não, há dois hidrogênios iguais",
        label: "B. Não, há dois hidrogênios iguais",
        explanation: "Ao substituir F por H, o carbono passa a ter dois ligantes iguais. Por isso, ele deixa de ser um centro quiral.",
      },
    ],
  },
  "identify-chiral": {
    prompt: "Qual modelo representa um carbono quiral?",
    correct: 1,
    options: [
      {
        value: "M1",
        explanation: "No M1, o carbono está ligado a dois hidrogênios. Esses ligantes são iguais. Para ser um centro quiral deste tipo, o carbono precisa ter quatro ligantes diferentes.",
      },
      {
        value: "M2",
        explanation: "No M2, os ligantes H, Cl, Br e F são todos diferentes. O carbono tetraédrico é um centro quiral.",
      },
      {
        value: "M3",
        explanation: "No M3, há dois átomos de cloro ligados ao carbono. Essa repetição impede que o carbono seja um centro quiral deste tipo.",
      },
    ],
  },
  "qv2": {
    prompt: "Qual molécula possui carbono quiral?",
    correct: 1,
    options: [
      {
        value: "A. M1 (H, H, Cl, F) — tem hidrogênio e flúor, átomos bem diferentes",
        explanation: "M1 tem dois hidrogênios iguais. A diferença entre H e F não basta. Neste modelo, os quatro ligantes do carbono precisam ser diferentes entre si.",
      },
      {
        value: "B. M2 (H, Cl, Br, F) — quatro átomos todos diferentes entre si",
        explanation: "M2 é a única opção com quatro ligantes diferentes no carbono tetraédrico: H, Cl, Br e F.",
      },
      {
        value: "C. M3 (Cl, Cl, Br, H) — tem três tipos de átomos diferentes",
        explanation: "Em M3, os três tipos de átomos ocupam quatro posições porque o cloro aparece duas vezes. O carbono precisa de quatro ligantes diferentes.",
      },
      {
        value: "D. M4 (F, F, F, Cl) — tem flúor, o átomo mais eletronegativo",
        explanation: "A eletronegatividade do flúor não é o critério. Os três átomos de flúor em M4 são ligantes iguais, por isso esse carbono não é um centro quiral.",
      },
    ],
  },
  "superposition": {
    prompt: "É possível alinhar simultaneamente os quatro ligantes correspondentes só girando o modelo espelhado?",
    correct: 1,
    options: [
      {
        value: "Sim, os quatro ligantes podem coincidir",
        explanation: "É possível alinhar alguns ligantes, mas o espelhamento inverte o arranjo espacial. A rotação preserva esse arranjo, então os quatro ligantes correspondentes não coincidem ao mesmo tempo.",
      },
      {
        value: "Não, os modelos são imagens especulares não sobreponíveis",
        explanation: "Ao espelhar o modelo, a configuração do carbono é invertida. Girar a imagem preserva a configuração espelhada, por isso não há sobreposição dos quatro ligantes.",
      },
    ],
  },
  "active-form": {
    prompt: "As duas formas de CHClBrF desviam a luz polarizada de modos:",
    correct: 1,
    options: [
      {
        value: "A. Idênticos — desviam a luz para o mesmo lado",
        explanation: "Em condições de medição iguais, os dois enantiômeros apresentam rotações ópticas de mesmo módulo e sentidos opostos. O sinal (+) indica rotação para a direita e o sinal (−), para a esquerda.",
      },
      {
        value: "B. Opostos — uma desvia para a direita (+), a outra para a esquerda (−)",
        explanation: "Em condições iguais, amostras equivalentes dos dois enantiômeros puros giram o plano da luz polarizada na mesma magnitude e em sentidos opostos.",
      },
      {
        value: "C. Nenhuma das formas desvia a luz",
        explanation: "Cada enantiômero puro pode girar o plano da luz polarizada. O efeito líquido pode ser zero quando quantidades iguais dos dois enantiômeros se cancelam em uma mistura racêmica.",
      },
      {
        value: "D. Aleatórios — depende da temperatura",
        explanation: "A temperatura é uma condição da medida e pode influenciar o valor observado. Quando medidos nas mesmas condições, os enantiômeros dão rotações de mesmo módulo e sinais opostos.",
      },
    ],
  },
  "qv3": {
    prompt: "Qual explicação para a não-equivalência dos enantiômeros está correta?",
    correct: 3,
    options: [
      {
        value: "A. Porque uma tem átomos de cor diferente da outra",
        explanation: "As cores do desenho ajudam a identificar os elementos. Os dois modelos têm os mesmos ligantes e as mesmas ligações. A diferença está no arranjo espacial, que impede a sobreposição das imagens especulares.",
      },
      {
        value: "B. Porque são opostas — uma é esquerda e a outra é direita",
        explanation: "A comparação com esquerda e direita é uma analogia. O critério científico exige verificar se são imagens especulares e se há alguma rotação que faça os quatro ligantes coincidir. Para este par, não há.",
      },
      {
        value: "C. Porque possuem átomos em quantidades diferentes",
        explanation: "Os enantiômeros têm a mesma quantidade de cada tipo de átomo e a mesma conectividade. O espelhamento altera o arranjo espacial dos ligantes, que não podem ser sobrepostos por rotação.",
      },
      {
        value: "D. Porque são imagens especulares com organização espacial oposta — em nenhuma rotação os 4 átomos coincidem",
        explanation: "As duas estruturas são imagens especulares com a mesma conectividade. Nenhuma rotação alinha simultaneamente os quatro ligantes correspondentes.",
      },
    ],
  },
  "lactic-acid": {
    prompt: "Qual carbono do ácido lático é o quiral?",
    correct: 1,
    options: [
      {
        value: "A. Carbono do CH₃",
        explanation: "O carbono do CH₃ está ligado a três hidrogênios iguais. O carbono central é o quiral porque está ligado a quatro grupos diferentes: OH, H, CH₃ e COOH.",
      },
      {
        value: "B. O carbono central - ligado a OH, H, CH₃ e COOH",
        explanation: "O carbono central é tetraédrico e está ligado a quatro grupos diferentes: OH, H, CH₃ e COOH. Isso faz dele um centro quiral.",
      },
      {
        value: "C. O carbono do COOH",
        explanation: "O carbono do COOH faz uma ligação dupla com um oxigênio e tem geometria trigonal plana. O centro quiral é o carbono vizinho, que é tetraédrico e tem quatro ligantes diferentes.",
      },
    ],
  },
  "compare-forms": {
    prompt: "Os dois enantiômeros do ácido lático são a mesma substância ou diferentes?",
    correct: 1,
    options: [
      {
        value: "A. A mesma — têm os mesmos átomos, só estão desenhados invertidos",
        explanation: "As duas formas têm os mesmos átomos e as mesmas ligações. A disposição dos quatro ligantes em torno do carbono quiral forma imagens espelhadas que não se sobrepõem.",
      },
      {
        value: "B. Diferentes — têm organização espacial oposta e interagem de modo distinto com o organismo",
        explanation: "Os enantiômeros têm configurações espaciais opostas e não se sobrepõem. Moléculas quirais do organismo, como enzimas, podem interagir de maneira diferente com cada forma.",
      },
      {
        value: "C. A mesma — qualquer giro transforma uma na outra",
        explanation: "Uma rotação conserva a configuração do carbono quiral. Nenhum giro faz H, OH, CH₃ e COOH coincidirem simultaneamente com os ligantes correspondentes na imagem espelhada.",
      },
      {
        value: "D. Diferentes — porque têm fórmulas moleculares distintas",
        explanation: "As duas formas têm a mesma fórmula molecular, C₃H₆O₃, e a mesma conectividade. Elas se distinguem pela disposição espacial dos ligantes em torno do carbono quiral.",
      },
    ],
  },
  "qv4": {
    prompt: 'Qual o erro de dizer que os enantiômeros "são iguais, só estão invertidos"?',
    correct: 2,
    options: [
      {
        value: "A. Ele errou ao contar — os enantiômeros têm números diferentes de hidrogênios",
        explanation: "Cada enantiômero do ácido lático tem seis átomos de hidrogênio e a mesma fórmula molecular, C₃H₆O₃. A diferença está na disposição espacial dos ligantes em torno do carbono quiral.",
      },
      {
        value: "B. Ele acertou — mesmos átomos significa mesma substância",
        explanation: "Os mesmos átomos indicam a mesma composição. Os enantiômeros também têm as mesmas ligações, mas a disposição espacial dos ligantes dá origem a duas imagens espelhadas que não se sobrepõem.",
      },
      {
        value: "C. Ele ignorou a organização espacial. Mesmos átomos não garantem disposição 3D idêntica — é ela que os torna diferentes",
        explanation: "Os ligantes OH, H, CH₃ e COOH são os mesmos nas duas formas. Em torno do carbono quiral, eles estão dispostos de modo que as configurações sejam imagens espelhadas não sobreponíveis.",
      },
      {
        value: "D. Ele deveria ter contado as ligações, não os átomos",
        explanation: "O número de ligações e a conectividade são iguais nos dois enantiômeros. Para distingui-los, compare a posição dos ligantes no espaço e verifique se as imagens espelhadas se sobrepõem.",
      },
    ],
  },
  "augmented-reality": {
    prompt: "Ao comparar as duas formas em RA, o que você observou?",
    correct: 1,
    options: [
      {
        value: "A. As duas formas coincidiram perfeitamente ao girar",
        explanation: "Uma rotação pode alinhar alguns átomos correspondentes. A disposição dos ligantes do CHClBrF impede que todos os quatro coincidam ao mesmo tempo com os da imagem espelhada.",
      },
      {
        value: "B. Por mais que girassem juntas, os átomos nunca coincidiam — são não-superponíveis",
        explanation: "As duas formas do CHClBrF são imagens espelhadas com configurações espaciais opostas. Nenhuma rotação permite sobrepor simultaneamente os quatro ligantes correspondentes.",
      },
      {
        value: "C. As duas formas se fundiram em uma só",
        explanation: "Girar os modelos muda a orientação e conserva a configuração de cada molécula. Mesmo quando parte dos modelos ocupa a mesma posição, as duas formas continuam distintas.",
      },
      {
        value: "D. Uma forma desapareceu ao girar",
        explanation: "Uma rotação conserva os átomos e as ligações de cada modelo. As duas formas continuam presentes e mantêm suas configurações espaciais opostas.",
      },
    ],
  },
  "qv5": {
    prompt: "Qual explicação reúne corretamente as três ideias (geometria tetraédrica, não-superponibilidade e organização espacial)?",
    correct: 1,
    options: [
      {
        value: "A. O cristal tem dois carbonos, e cada um desvia a luz para um lado diferente",
        explanation: "Cada molécula de CHClBrF tem um único carbono. Seus quatro ligantes diferentes formam duas configurações espelhadas, responsáveis por rotações ópticas em sentidos opostos.",
      },
      {
        value: "B. O carbono tetraédrico tem 4 átomos diferentes → gera dois enantiômeros especulares não superponíveis → a organização espacial oposta de cada forma desvia a luz para um lado",
        explanation: "O carbono tetraédrico está ligado a H, Cl, Br e F. Esses quatro ligantes formam duas configurações espelhadas que não se sobrepõem. Nas mesmas condições, amostras equivalentes de cada enantiômero puro giram o plano da luz polarizada pelo mesmo ângulo, em sentidos opostos.",
      },
      {
        value: "C. As duas formas têm fórmulas moleculares diferentes, por isso desviam a luz de modos diferentes",
        explanation: "Os dois enantiômeros têm a mesma fórmula molecular, CHClBrF, e a mesma conectividade. A disposição espacial dos ligantes distingue as duas formas e explica os sentidos opostos de rotação da luz polarizada.",
      },
      {
        value: "D. A diferença está no tamanho das moléculas, que altera a passagem da luz",
        explanation: "As duas formas têm as mesmas dimensões moleculares. A diferença está na configuração dos ligantes em torno do carbono quiral, que produz sentidos opostos de rotação da luz polarizada.",
      },
    ],
  },
} as const satisfies Partial<Record<ExpeditionStep, Question>>;

export function evaluateQuestion(question: Question, selected: number) {
  const option = question.options[selected];
  if (!option) return undefined;
  const answer: Answer & { correct: boolean } = {
    value: option.value,
    correct: selected === question.correct,
  };
  return { answer, explanation: option.explanation };
}

export const classificationItems = [
  {
    id: "folha",
    name: "Folha de papel",
    category: "plano",
    explanation: "A folha foi idealizada sem espessura. Nesse modelo, só o comprimento e a largura contam, portanto a representação é plana.",
  },
  {
    id: "circulo",
    name: "Círculo",
    category: "plano",
    explanation: "O círculo está contido em um plano e não tem profundidade. Uma esfera, por outro lado, se estende em três dimensões.",
  },
  {
    id: "cubo",
    name: "Cubo",
    category: "espacial",
    explanation: "Cada face do cubo é plana, mas o cubo inteiro tem largura, altura e profundidade. Por isso, ele é espacial.",
  },
  {
    id: "piramide",
    name: "Pirâmide",
    category: "espacial",
    explanation: "A pirâmide tem uma base com largura e profundidade e um vértice acima dela, que define a altura. As três dimensões fazem dela um objeto espacial.",
  },
  {
    id: "esfera",
    name: "Esfera",
    category: "espacial",
    explanation: "A esfera pode parecer um círculo quando desenhada no papel, mas se estende em largura, altura e profundidade. A esfera é espacial.",
  },
] as const;

type ObjectId = (typeof classificationItems)[number]["id"];
export type Category = (typeof classificationItems)[number]["category"];

export function evaluateClassification(selection: Partial<Record<ObjectId, Category>>) {
  if (classificationItems.some(({ id }) => selection[id] === undefined)) return undefined;
  const mistakes = classificationItems.filter(({ id, category }) => selection[id] !== category);
  return {
    answer: {
      value: classificationItems.map(({ id, name }) => `${name}: ${selection[id]}`).join(", "),
      correct: mistakes.length === 0,
    },
    mistakes,
  };
}
