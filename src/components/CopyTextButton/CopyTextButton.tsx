import { useState } from "react";
import { Button } from "../Button/Button";

export function CopyTextButton({ value, label }: { value: string; label: string }) {
  const [result, setResult] = useState<{ value: string; copied: boolean }>();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setResult({ value, copied: true });
    } catch {
      setResult({ value, copied: false });
    }
  }

  return <>
    <Button variant="secondary" onClick={() => void copy()}>{label}</Button>
    {result?.value === value && (result.copied
      ? <span role="status">Copiado.</span>
      : <label className="form-field">Selecione e copie
        <input className="form-control" readOnly value={value} onFocus={(event) => event.currentTarget.select()} />
      </label>)}
  </>;
}
