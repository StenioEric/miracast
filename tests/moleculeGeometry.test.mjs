import assert from "node:assert/strict";
import { test } from "node:test";

import { bromochlorofluoromethane, reflectPoint } from "../src/utils/moleculeGeometry.ts";

const subtract = (a, b) => a.map((value, index) => value - b[index]);
const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
const distance = (a, b) => Math.hypot(...subtract(a, b));
const signedVolume = ([a, b, c, d]) => {
  const [x, y, z] = subtract(b, a);
  const [u, v, w] = subtract(c, a);
  return dot([y * w - z * v, z * u - x * w, x * v - y * u], subtract(d, a));
};

test("CHClBrF tem um carbono ligado aos quatro substituintes em geometria tetraédrica", () => {
  const { atoms, bonds, center } = bromochlorofluoromethane;
  assert.deepEqual(atoms.map(({ element }) => element), ["C", "H", "Cl", "Br", "F"]);
  assert.deepEqual(bonds, [[0, 1], [0, 2], [0, 3], [0, 4]]);
  assert.deepEqual(atoms[0].position, center);
  const ligands = atoms.slice(1).map(({ position }) => subtract(position, center));
  for (const [index, first] of ligands.entries()) {
    for (const second of ligands.slice(index + 1)) {
      const cosine = dot(first, second) / (Math.hypot(...first) * Math.hypot(...second));
      assert.ok(Math.abs(cosine + 1 / 3) < 1e-12);
    }
  }
});

test("a reflexão preserva todas as distâncias e inverte a orientação dos quatro ligantes", () => {
  const { atoms, center, chiral } = bromochlorofluoromethane;
  const original = atoms.map(({ position }) => position);
  const mirror = original.map((point) => reflectPoint(point, center[0]));
  assert.equal(chiral, true);
  assert.deepEqual(mirror[0], center);
  assert.deepEqual(mirror.map((point) => reflectPoint(point, center[0])), original);
  for (const [index, point] of original.entries()) {
    for (let other = index + 1; other < original.length; other++) {
      assert.equal(distance(point, original[other]), distance(mirror[index], mirror[other]));
    }
  }
  const volume = signedVolume(original.slice(1));
  assert.notEqual(volume, 0);
  assert.equal(signedVolume(mirror.slice(1)), -volume);
  assert.deepEqual(reflectPoint([5, 2, 3], 4), [3, 2, 3]);
});
