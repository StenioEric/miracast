import { createContext, useContext, useEffect, useState } from "react";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { ExpeditionStep } from "../../domain/expedition";

type StudentWork = {
  draftKey: string;
  message?: string;
  error?: boolean;
  retry?: () => void;
  resume?: ReactNode;
  onEdit?: () => void;
  busy?: boolean;
};

export const StudentWorkContext = createContext<StudentWork | null>(null);

const draftPrefix = "miracast:draft:";

export function studentDraftKey(studentId: string, step: ExpeditionStep) {
  return `${draftPrefix}${studentId}:${step}:`;
}

export function clearStudentDrafts(prefix: string) {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch {
    // O trabalho continua em memória quando o navegador bloqueia o armazenamento.
  }
}

export function clearAllStudentDrafts() {
  clearStudentDrafts(draftPrefix);
}

export function useStudentDraft<T>(name: string, initial: T) {
  const work = useContext(StudentWorkContext);
  const key = work && work.draftKey + name;
  const [value, setValue] = useState<T>(() => {
    if (!key) return initial;
    try {
      const stored = sessionStorage.getItem(key);
      return stored === null ? initial : JSON.parse(stored) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (!key) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // O estado em memória permanece disponível para o envio.
    }
  }, [key, value]);

  const update: Dispatch<SetStateAction<T>> = (next) => {
    if (work?.busy) return;
    work?.onEdit?.();
    setValue(next);
  };
  return [value, update] as const;
}
