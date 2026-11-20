import { useState } from "react";
import type { Answer } from "../../domain/expedition";
import "./ActivityResponse.css";

export type Question = {
  prompt: string;
  options: readonly [string, string, ...string[]];
  correct: number;
  explanation: string;
};

type ChoiceQuestionProps = {
  question: Question;
  onContinue: (answer: Answer) => void;
  onEvaluate?: (correct: boolean) => void;
  requireCorrect?: boolean;
};

export function ChoiceQuestion({ question, onContinue, onEvaluate, requireCorrect }: ChoiceQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === question.correct;
  const retry = submitted && requireCorrect && !correct;

  function verify() {
    if (selected === null) return;
    setSubmitted(true);
    onEvaluate?.(correct);
  }

  return (
    <div className="activity-card">
      <fieldset className="activity-options" disabled={submitted}>
        <legend>{question.prompt}</legend>
        {question.options.map((option, index) => (
          <label key={option} data-selected={selected === index}>
            <input type="radio" name="activity-answer" checked={selected === index} onChange={() => setSelected(index)} />
            {option}
          </label>
        ))}
      </fieldset>
      <div role="status">
        {submitted && <p className="activity-feedback"><strong>{correct ? "Resposta correta. " : "Vamos revisar. "}</strong>{question.explanation}</p>}
      </div>
      {retry && <button className="flow-button" type="button" onClick={() => {
        setSelected(null);
        setSubmitted(false);
      }}>Tentar novamente</button>}
      {submitted && !retry && selected !== null && <button className="flow-button" type="button" onClick={() => onContinue({ value: question.options[selected], correct })}>Continuar</button>}
      {!submitted && <button className="flow-button" type="button" disabled={selected === null} onClick={verify}>Verificar resposta</button>}
    </div>
  );
}

export function WrittenResponse({ prompt, guidance, onContinue }: {
  prompt: string; guidance: string; onContinue: (answer: Answer) => void;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form className="activity-card" onSubmit={(event) => {
      event.preventDefault();
      if (value.trim()) setSubmitted(true);
    }}>
      <label className="activity-field">
        {prompt}
        <textarea required maxLength={2000} value={value} onChange={(event) => {
          setValue(event.target.value);
          setSubmitted(false);
        }} rows={4} />
      </label>
      <div role="status">{submitted && <p className="activity-feedback">{guidance}</p>}</div>
      {submitted
        ? <button className="flow-button" type="button" onClick={() => onContinue({ value: value.trim() })}>Continuar</button>
        : <button className="flow-button" type="submit" disabled={!value.trim()}>Enviar resposta</button>}
    </form>
  );
}
