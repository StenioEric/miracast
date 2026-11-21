import type { ReactNode, Ref } from "react";

import "./ActivityResponse.css";

export function AnswerFeedback({ correct, children, ref }: {
  correct?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div className="answer-feedback" role="status" data-correct={correct} ref={ref}
      tabIndex={ref && correct !== undefined ? -1 : undefined}>
      {correct !== undefined && <>
        <p>
          <span aria-hidden="true">{correct ? "✓" : "✕"}</span>{" "}
          <strong>{correct ? "Resposta correta" : "Resposta incorreta"}</strong>
        </p>
        {children}
      </>}
    </div>
  );
}
