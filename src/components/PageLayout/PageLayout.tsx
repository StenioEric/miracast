import type { ReactNode } from "react";

import decoration from "../../assets/forma-decorativa.svg";
import { Brand } from "../Brand/Brand";
import "./PageLayout.css";

type PageLayoutProps = {
  frame?: string;
  theme?: "blue" | "intro" | "expedition";
  className?: string;
  illustration?: string;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function PageLayout({
  frame, theme = "blue", className, illustration = decoration, header, footer, children,
}: PageLayoutProps) {
  return (
    <main className={["page", `page--${theme}`, className].filter(Boolean).join(" ")} data-node-id={frame}>
      <div className="page__shell">
        <img className="page__decoration" src={illustration} alt="" />
        {header}
        <div className="page__content">{children}</div>
        {footer}
      </div>
    </main>
  );
}

export function PageHeader({ title, label, brand, children }: {
  title?: string;
  label?: string;
  brand?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      {brand && <Brand as={title ? "p" : "h1"} />}
      {label && <p className="page-header__label">{label}</p>}
      {title && <h1>{title}</h1>}
      {children}
    </header>
  );
}

export function PageFooter({ children, credits }: { children?: ReactNode; credits?: "short" | "full" }) {
  return (
    <footer className="page-footer">
      {children}
      {credits === "short" && <p className="page-footer__credits">MiraCast · PROFQUI/UFRN</p>}
      {credits === "full" && <div className="page-footer__credits">
        <p>PROFQUI/UFRN · Dissertação de Mestrado</p>
        <p>Fundamentada na Teoria de Galperin</p>
      </div>}
    </footer>
  );
}
