type Point = readonly [number, number, number];
export type Ligands = readonly [string, string, string, string];

export const chclbrf: Ligands = ["H", "Cl", "Br", "F"];
export const lactateLigands: Ligands = ["H", "OH", "CH₃", "COOH"];

export function projectPoint([x, y, z]: Point, yaw: number, pitch: number): Point {
  const a = yaw * Math.PI / 180;
  const b = pitch * Math.PI / 180;
  const horizontal = x * Math.cos(a) + z * Math.sin(a);
  const depth = -x * Math.sin(a) + z * Math.cos(a);
  return [horizontal, y * Math.cos(b) - depth * Math.sin(b), y * Math.sin(b) + depth * Math.cos(b)];
}
