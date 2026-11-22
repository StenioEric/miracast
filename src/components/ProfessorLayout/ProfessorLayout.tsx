import type { ReactNode } from "react";

import { PageFooter, PageHeader, PageLayout } from "../PageLayout/PageLayout";
import "./style.css";

export function ProfessorLayout({ frame, title, className, navigation, children }: {
  frame: string;
  title?: string;
  className?: string;
  navigation: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageLayout
      frame={frame}
      className={className}
      header={<PageHeader brand label="Área do professor" title={title} />}
      footer={<PageFooter credits="short">{navigation}</PageFooter>}
    >
      {children}
    </PageLayout>
  );
}
