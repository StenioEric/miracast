import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import type { Question } from "../../components/ActivityResponse/ActivityResponse";
import { GuidedActivity } from "../../components/GuidedActivity/GuidedActivity";
import type { Answer } from "../../domain/expedition";
import "./VerificacaoQV3.css";

const question: Question = {
  prompt: "Qual explicação para a não-equivalência dos enantiômeros está correta?",
  options: [
    "A. Porque uma tem átomos de cor diferente da outra",
    "B. Porque são opostas — uma é esquerda e a outra é direita",
    "C. Porque possuem átomos em quantidades diferentes",
    "D. Porque são imagens especulares com organização espacial oposta — em nenhuma rotação os 4 átomos coincidem",
  ],
  correct: 3,
  explanation: "A alternativa D está certa porque ela define exatamente o conceito de quiralidade: o carbono ligado a quatro átomos diferentes cria duas estruturas que são imagens no espelho não sobreponíveis.",
};

export function VerificacaoQV3({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <GuidedActivity
      className="verificacao-qv3 guided-activity--purple guided-activity--orange"
      frame="2003:968"
      stage="Verificação · Tela 13"
      title="VERIFICAÇÃO Q.V3"
      guidance="Quatro estudantes explicaram por que o CHClBrF e seu enantiômero não são a mesma molécula. Qual explicação está conceitualmente correta?"
    >
      <ChoiceQuestion
        className="guided-activity__card"
        question={question}
        onContinue={onContinue}
      />
    </GuidedActivity>
  );
}
