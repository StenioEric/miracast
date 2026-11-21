import "./ActivityResponse.css";

type AnswerOptionProps = {
  name: string;
  label: string;
  selected: boolean;
  correct?: boolean;
  onSelect: () => void;
};

export function AnswerOption({ name, label, selected, correct, onSelect }: AnswerOptionProps) {
  const result = correct === undefined ? undefined : correct ? "correct" : "incorrect";

  return (
    <label className="answer-option" data-selected={selected} data-result={selected ? result : undefined}>
      <input type="radio" name={name} checked={selected} onChange={onSelect} />
      <span>{label}</span>
      {selected && result && <span className="answer-option__result" aria-hidden="true">
        {correct ? "✓" : "✕"}
      </span>}
    </label>
  );
}
