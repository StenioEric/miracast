type Point = readonly [number, number, number];
export type Ligands = readonly [string, string, string, string];

export const chclbrf = ["H", "Cl", "Br", "F"] as const satisfies Ligands;
export const lactateLigands: Ligands = ["H", "OH", "CH₃", "COOH"];

export const tetrahedralVertices = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as const;

export const chemicalElements = {
  C: { name: "Carbono", color: "#26332f", radius: .36 },
  H: { name: "Hidrogênio", color: "#edf2f5", radius: .25 },
  Cl: { name: "Cloro", color: "#90e098", radius: .40 },
  Br: { name: "Bromo", color: "#f7a66d", radius: .44 },
  F: { name: "Flúor", color: "#b9e9ff", radius: .32 },
};

export type MoleculeModel = {
  name: string;
  formula: string;
  chiral: boolean;
  center: Point;
  atoms: readonly { element: keyof typeof chemicalElements; position: Point }[];
  bonds: readonly (readonly [number, number])[];
};

export const bromochlorofluoromethane: MoleculeModel = {
  name: "Bromoclorofluorometano",
  formula: "CHClBrF",
  chiral: true,
  center: [0, 0, 0],
  atoms: [
    { element: "C", position: [0, 0, 0] },
    ...chclbrf.map((element, index) => ({ element, position: tetrahedralVertices[index] })),
  ],
  bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
};

export function reflectPoint([x, y, z]: Point, centerX = 0): Point {
  return [2 * centerX - x, y, z];
}

export function projectPoint([x, y, z]: Point, yaw: number, pitch: number): Point {
  const a = yaw * Math.PI / 180;
  const b = pitch * Math.PI / 180;
  const horizontal = x * Math.cos(a) + z * Math.sin(a);
  const depth = -x * Math.sin(a) + z * Math.cos(a);
  return [horizontal, y * Math.cos(b) - depth * Math.sin(b), y * Math.sin(b) + depth * Math.cos(b)];
}
