import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";

import type { MoleculeModel } from "../../utils/moleculeGeometry";
import { Button } from "../Button/Button";
import "./MoleculeViewer.css";

const MoleculeViewer = lazy(() => import("./MoleculeViewer").catch(() => ({
  default: () => <p role="status">Não foi possível carregar a visualização 3D. Volte à atividade para continuar.</p>,
})));
const historyKey = "miracastMoleculeViewer";

export function MoleculeViewerButton({ title, label = "Abrir visualização molecular 3D", molecule, allowOverlay }: {
  title: string;
  label?: string;
  molecule: MoleculeModel;
  allowOverlay?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function returnToActivity() {
      closing.current = false;
      dialog.current?.close();
      setOpen(false);
    }

    window.addEventListener("popstate", returnToActivity);
    return () => window.removeEventListener("popstate", returnToActivity);
  }, []);

  function openViewer(event: MouseEvent<HTMLButtonElement>) {
    if (!dialog.current || dialog.current.open) return;
    event.currentTarget.focus({ preventScroll: true });
    // Keep the expedition URL and use Back to dismiss the dialog.
    if (window.history.state?.[historyKey] !== id) {
      window.history.pushState({ ...window.history.state, [historyKey]: id }, "");
    }
    dialog.current.showModal();
    dialog.current.scrollTop = 0;
    setOpen(true);
  }

  function closeViewer() {
    if (closing.current) return;
    if (window.history.state?.[historyKey] === id) {
      closing.current = true;
      window.history.back();
    } else {
      dialog.current?.close();
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="secondary" aria-haspopup="dialog" onClick={openViewer}>{label}</Button>
      <dialog className="molecule-dialog" ref={dialog} aria-labelledby={id} onCancel={(event) => {
        event.preventDefault();
        closeViewer();
      }}>
        <div className="molecule-dialog__content">
          <header className="molecule-dialog__header">
            <h2 id={id}>{title}</h2>
            <Button variant="secondary" onClick={closeViewer}>Voltar à atividade</Button>
          </header>
          {open && <Suspense fallback={<p role="status">Carregando visualização 3D…</p>}>
            <MoleculeViewer molecule={molecule} allowOverlay={allowOverlay} />
          </Suspense>}
        </div>
      </dialog>
    </>
  );
}
