import type { ComponentPropsWithoutRef } from "react";

import "./Button.css";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "link";
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button {...props} type={type} className={["button", `button--${variant}`, className].filter(Boolean).join(" ")} />;
}
