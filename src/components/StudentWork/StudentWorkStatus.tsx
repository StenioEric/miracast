import { useContext } from "react";

import { Button } from "../Button/Button";
import { StudentWorkContext } from "./studentWork";

export function StudentWorkStatus() {
  const work = useContext(StudentWorkContext);
  if (!work) return null;

  return <div className="student-work">
    <p className={work.error ? "app-error" : undefined} role={work.error ? "alert" : "status"}>{work.message}</p>
    {work.retry && <Button variant="secondary" onClick={work.retry}>Tentar novamente</Button>}
  </div>;
}
