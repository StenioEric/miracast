import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import { chemicalElements } from "../../utils/moleculeGeometry";
import type { MoleculeModel } from "../../utils/moleculeGeometry";
import { Button } from "../Button/Button";
import { ContentCard } from "../ContentCard/ContentCard";
import { createMoleculeScene } from "./moleculeScene";
import type { MoleculeView } from "./moleculeScene";

const minZoom = .7;
const maxZoom = 1.45;
const clampZoom = (value: number) => Math.min(maxZoom, Math.max(minZoom, value));

type Pointer = { x: number; y: number };
const distance = (first: Pointer, second: Pointer) => Math.hypot(first.x - second.x, first.y - second.y);

export default function MoleculeViewer({ molecule, allowOverlay = false }: {
  molecule: MoleculeModel;
  allowOverlay?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createMoleculeScene>>(null);
  const pointers = useRef(new Map<number, Pointer>());
  const [view, setView] = useState<MoleculeView>("single");
  const [zoom, setZoom] = useState(1);
  const [available, setAvailable] = useState(true);
  const instructionsId = useId();
  const elements = new Set(molecule.atoms.map(({ element }) => element));

  useEffect(() => {
    const host = stage.current;
    if (!host || !available) return;
    const unavailability = () => setAvailable(false);
    const rendering = createMoleculeScene(host, molecule, unavailability);
    if (!rendering) {
      const frame = requestAnimationFrame(unavailability);
      return () => cancelAnimationFrame(frame);
    }
    scene.current = rendering;

    function wheel(event: WheelEvent) {
      event.preventDefault();
      const factor = Math.sign(event.deltaY) * .08;
      setZoom((value) => clampZoom(value - factor));
    }

    host.addEventListener("wheel", wheel, { passive: false });
    return () => {
      host.removeEventListener("wheel", wheel);
      rendering.dispose();
      scene.current = null;
    };
  }, [available, molecule]);

  useEffect(() => {
    scene.current?.setView(view, zoom);
  }, [molecule, view, zoom]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    const active = pointers.current;
    const bounds = event.currentTarget.getBoundingClientRect();
    const onReference = view === "comparison" && event.clientX >= bounds.left + bounds.width / 2;
    if (event.button !== 0 || active.size >= 2 || (onReference && active.size === 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    active.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const active = pointers.current;
    const previous = active.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    const other = [...active].find(([id]) => id !== event.pointerId)?.[1];
    active.set(event.pointerId, current);
    if (other) {
      const ratio = distance(other, current) / Math.max(distance(other, previous), 1);
      setZoom((value) => clampZoom(value * ratio));
    } else {
      scene.current?.rotate((current.x - previous.x) * .012, (current.y - previous.y) * .012);
    }
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
  }

  function rotateWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const rotations: Record<string, [number, number]> = {
      ArrowLeft: [-.15, 0],
      ArrowRight: [.15, 0],
      ArrowUp: [0, -.15],
      ArrowDown: [0, .15],
    };
    const direction = rotations[event.key];
    if (!direction) return;
    event.preventDefault();
    scene.current?.rotate(...direction);
  }

  function restore() {
    scene.current?.resetRotation();
    setZoom(1);
  }

  if (!available) {
    return <ContentCard><p role="status">A visualização 3D está indisponível neste navegador. Volte à atividade para continuar.</p></ContentCard>;
  }

  return (
    <ContentCard className="molecule-viewer">
      <h3>{molecule.name} · {molecule.formula}</h3>
      <p id={instructionsId}>
        Arraste para girar ou use as setas com o modelo em foco.
        Ajuste o zoom com a roda do mouse, dois dedos ou o controle deslizante.
      </p>
      <figure className="molecule-viewer__figure" data-view={view}>
        {view === "comparison" && <figcaption className="molecule-viewer__captions">
          <span>Molécula original</span><span>Imagem espelhada fixa</span>
        </figcaption>}
        {view === "overlay" && <figcaption className="molecule-viewer__captions">
          <span>Centros alinhados · imagem espelhada translúcida</span>
        </figcaption>}
        <div className="molecule-viewer__stage" ref={stage}
          role="img" aria-label={`Modelo molecular interativo de ${molecule.name}`}
          aria-describedby={instructionsId} tabIndex={0} onKeyDown={rotateWithKeyboard}
          onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
          onPointerCancel={endDrag} onLostPointerCapture={endDrag} />
      </figure>
      <ul className="molecule-viewer__legend" aria-label="Elementos químicos">
        {[...elements].map((symbol) => (
          <li key={symbol}><span style={{ backgroundColor: chemicalElements[symbol].color }} />
            {symbol} · {chemicalElements[symbol].name}
          </li>
        ))}
      </ul>
      <label className="molecule-viewer__zoom">
        Zoom <output>{Math.round(zoom * 100)}%</output>
        <input type="range" min={minZoom} max={maxZoom} step={.01} value={zoom}
          aria-label="Zoom da molécula" aria-valuetext={`${Math.round(zoom * 100)}%`}
          onChange={(event) => setZoom(Number(event.target.value))} />
      </label>
      <div className="molecule-viewer__actions">
        <Button variant="secondary" onClick={() => setView(view === "single" ? "comparison" : "single")}>
          {view !== "single" ? "Ver apenas a molécula original" :
            molecule.chiral ? "Comparar enantiômeros" : "Comparar com a imagem no espelho"}
        </Button>
        {allowOverlay && view !== "single" && (
          <Button variant="secondary" onClick={() => setView(view === "overlay" ? "comparison" : "overlay")}>
            {view === "overlay" ? "Separar moléculas" : "Tentar sobrepor"}
          </Button>
        )}
        <Button variant="secondary" onClick={restore}>Restaurar posição</Button>
      </div>
    </ContentCard>
  );
}
