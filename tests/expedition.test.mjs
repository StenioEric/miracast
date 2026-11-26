import assert from "node:assert/strict";
import test from "node:test";
import { activities, activityProgress, expeditionPhases, expeditionSteps, nextStep, phaseIndex, scoreSummary } from "../src/domain/expedition.ts";

const requiredFrames = [
  "2003:131", "2003:91", "2003:54", "2003:2", "2003:914", "2003:798",
  "2003:709", "2003:670", "2003:623", "2003:1046", "2003:1008", "2003:968",
  "2003:410", "2003:348", "2003:308", "2003:264", "2003:236", "2003:186",
];

test("percorre as 18 etapas em ordem e mantém estados auxiliares dentro da atividade", () => {
  assert.deepEqual(activities.map(({ frame }) => frame), requiredFrames);
  assert.equal(phaseIndex("protocol"), -1);
  assert.equal(phaseIndex("classification"), 0);
  assert.deepEqual(expeditionPhases.map(({ first }) => phaseIndex(first)), [0, 1, 2, 3, 4]);
  assert.equal(phaseIndex("master"), expeditionPhases.length);
  assert.deepEqual(activityProgress("qv1"), { completed: 3, total: 18 });
  const visited = [];
  for (let step = "motivation"; step; step = nextStep(step)) visited.push(step);
  assert.deepEqual(visited, expeditionSteps);
  assert.equal(nextStep("classification"), "rotation-identity");
  assert.equal(nextStep("master"), undefined);
  assert.equal(activities.at(-1).title, "Mestre do Quiral");
  assert.deepEqual(activityProgress("master"), { completed: 18, total: 18 });
});

test("calcula pontuação apenas com respostas objetivamente avaliadas", () => {
  assert.deepEqual(scoreSummary({
    qv1: { value: "A", correct: true },
    qv2: { value: "C", correct: false },
    "explain-chirality": { value: "Resposta aberta" },
  }), { correct: 1, total: 2 });
});
