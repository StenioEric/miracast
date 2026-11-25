import { useId, useState } from "react";

import { passwordMinimum, requiredPasswordGroups } from "../../domain/passwordPolicy";
import { Button } from "../Button/Button";
import "./PasswordField.css";

export function PasswordField({ label, isNew = false, error = "" }: { label: string; isNew?: boolean; error?: string }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <label className="form-field" htmlFor={id}>{label}</label>
    <div className="password-field__controls">
      <input id={id} className="form-control" name="password" type={visible ? "text" : "password"}
        autoComplete={isNew ? "new-password" : "current-password"} required
        aria-invalid={error ? true : undefined}
        aria-describedby={[isNew ? `${id}-rules` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined} />
      <Button variant="secondary" onClick={() => setVisible(!visible)}>{visible ? "Ocultar senha" : "Mostrar senha"}</Button>
    </div>
    {isNew && <p id={`${id}-rules`} className="password-field__hint">
      Use pelo menos {passwordMinimum} caracteres{requiredPasswordGroups.length
        ? ` e inclua ${new Intl.ListFormat("pt-BR").format(requiredPasswordGroups.map(({ label: rule }) => rule))}`
        : ""}.
    </p>}
    {error && <p id={`${id}-error`} className="app-error" role="alert">{error}</p>}
  </div>;
}
