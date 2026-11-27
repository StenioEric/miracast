import {
  AmbientLight, CanvasTexture, CylinderGeometry, DirectionalLight, Euler, Group, Mesh, MeshStandardMaterial,
  OrthographicCamera, Quaternion, Scene, SphereGeometry, Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from "three";

import { chemicalElements, reflectPoint } from "../../utils/moleculeGeometry";
import type { MoleculeModel } from "../../utils/moleculeGeometry";

export type MoleculeView = "single" | "comparison" | "overlay";

const initialRotation = new Quaternion().setFromEuler(new Euler(.26, .44, .1));
const comparePadding = 3;

function symbolTexture(symbol: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const text = canvas.getContext("2d");
  if (text) {
    text.font = "bold 46px sans-serif";
    text.textAlign = "center";
    text.textBaseline = "middle";
    text.lineJoin = "round";
    text.lineWidth = 5;
    text.strokeStyle = "#16231f";
    text.strokeText(symbol, 32, 34);
    text.fillStyle = "#fff";
    text.fillText(symbol, 32, 34);
  }
  return new CanvasTexture(canvas);
}

export function createMoleculeScene(host: HTMLElement, model: MoleculeModel, onContextLost: () => void) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (!context) return null;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  } catch {
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  canvas.addEventListener("webglcontextlost", onContextLost);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, .1, 50);
  const center = new Vector3(...model.center);
  const radius = Math.max(...model.atoms.map(({ element, position }) =>
    new Vector3(...position).distanceTo(center) + chemicalElements[element].radius));
  camera.position.z = radius * 4;
  camera.far = radius * 8 + 1;

  const light = new DirectionalLight(0xffffff, 2.2);
  light.position.set(-3, 5, 6);
  scene.add(light, new AmbientLight(0xffffff, 1.4));

  const sphere = new SphereGeometry(1, 24, 16);
  const cylinder = new CylinderGeometry(.075, .075, 1, 12);
  const up = new Vector3(0, 1, 0);
  const symbols = new Set(model.atoms.map(({ element }) => element));
  const textures = new Map([...symbols].map((symbol) => [symbol, symbolTexture(symbol)]));

  function buildMolecule(mirror: boolean) {
    const group = new Group();
    group.quaternion.copy(initialRotation);
    const materials = new Map([...textures.keys()].map((element) =>
      [element, new MeshStandardMaterial({ color: chemicalElements[element].color })] as const));
    const symbolMaterials = new Map([...textures].map(([element, map]) =>
      [element, new SpriteMaterial({ map, transparent: true, depthWrite: false })] as const));
    const bondMaterial = new MeshStandardMaterial({ color: "#61766e" });
    const atoms = model.atoms.map(({ element, position }) => {
      const atom = new Mesh(sphere, materials.get(element));
      const coordinates = mirror ? reflectPoint(position, model.center[0]) : position;
      atom.position.set(...coordinates).sub(center);
      const atomRadius = chemicalElements[element].radius;
      atom.scale.setScalar(atomRadius);
      const symbol = new Sprite(symbolMaterials.get(element));
      group.add(atom, symbol);
      return { atom, atomRadius, symbol };
    });
    for (const [start, end] of model.bonds) {
      const first = atoms[start].atom.position;
      const second = atoms[end].atom.position;
      const direction = new Vector3().subVectors(second, first);
      const bond = new Mesh(cylinder, bondMaterial);
      bond.position.copy(first).lerp(second, .5);
      bond.scale.y = direction.length();
      bond.quaternion.setFromUnitVectors(up, direction.normalize());
      group.add(bond);
    }
    scene.add(group);
    return { group, atoms, materials: [bondMaterial, ...materials.values()], symbolMaterials: [...symbolMaterials.values()] };
  }

  const original = buildMolecule(false);
  const reference = buildMolecule(true);
  const inverseRotation = new Quaternion();
  const symbolOffset = new Vector3();
  const rotation = new Quaternion();
  const dragAxis = new Vector3();
  let frame: number | undefined;
  let width = 0;
  let height = 0;
  let view: MoleculeView = "single";
  let zoom = 1;

  function draw() {
    frame = undefined;
    if (!width || !height || context?.isContextLost()) return;
    const aspect = width / height;
    const comparison = view === "comparison";
    // Use a common orthographic scale and reserve space for zoom on each side.
    const padding = comparison ? comparePadding : 1.15;
    const halfHeight = radius * Math.max(1.15, padding / aspect) / zoom;
    const halfWidth = halfHeight * aspect;
    const minSymbolSize = 18 * (2 * halfHeight / height);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.bottom = -halfHeight;
    camera.top = halfHeight;
    camera.updateProjectionMatrix();

    original.group.position.x = comparison ? -halfWidth / 2 : 0;
    reference.group.position.x = -original.group.position.x;
    reference.group.visible = view !== "single";

    for (const { group, atoms } of [original, reference]) {
      if (!group.visible) continue;
      inverseRotation.copy(group.quaternion).invert();
      for (const { atom, atomRadius, symbol } of atoms) {
        symbolOffset.set(0, 0, atomRadius + .015).applyQuaternion(inverseRotation);
        symbol.position.copy(atom.position).add(symbolOffset);
        symbol.scale.setScalar(Math.max(atomRadius * 1.9, minSymbolSize));
      }
    }
    renderer.render(scene, camera);
  }

  function requestDraw() {
    frame ??= requestAnimationFrame(draw);
  }

  const resize = new ResizeObserver(([{ contentRect }]) => {
    width = Math.floor(contentRect.width);
    height = Math.floor(contentRect.height);
    renderer.setSize(width, height, false);
    requestDraw();
  });
  resize.observe(host);

  return {
    setView(nextView: MoleculeView, nextZoom: number) {
      view = nextView;
      zoom = nextZoom;
      const overlay = view === "overlay";
      for (const material of reference.materials) {
        if (material.transparent !== overlay) {
          material.transparent = overlay;
          material.needsUpdate = true;
        }
        material.opacity = overlay ? .35 : 1;
        material.depthWrite = !overlay;
      }
      for (const material of reference.symbolMaterials) material.opacity = overlay ? .65 : 1;
      requestDraw();
    },
    rotate(horizontal: number, vertical: number) {
      const distance = Math.hypot(horizontal, vertical);
      if (!distance) return;
      dragAxis.set(vertical, horizontal, 0).normalize();
      rotation.setFromAxisAngle(dragAxis, distance);
      original.group.quaternion.premultiply(rotation).normalize();
      requestDraw();
    },
    resetRotation() {
      original.group.quaternion.copy(initialRotation);
      requestDraw();
    },
    dispose() {
      resize.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      sphere.dispose();
      cylinder.dispose();
      for (const { materials, symbolMaterials } of [original, reference]) {
        for (const material of [...materials, ...symbolMaterials]) material.dispose();
      }
      for (const texture of textures.values()) texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
