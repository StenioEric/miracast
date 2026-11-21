import { createElement } from "react";
import type { ComponentPropsWithoutRef } from "react";

import "./ContentCard.css";

type CardTag = "section" | "form";
type ContentCardProps<T extends CardTag> = ComponentPropsWithoutRef<T> & { as?: T };

export function ContentCard<T extends CardTag = "section">({ as, className, ...props }: ContentCardProps<T>) {
  return createElement(as ?? "section", {
    ...props,
    className: ["content-card", className].filter(Boolean).join(" "),
  });
}
