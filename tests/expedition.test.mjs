import assert from "node:assert/strict";
import test from "node:test";
import { activities, activityProgress, expeditionPhases, expeditionSteps, nextStep, phaseIndex, scoreSummary } from "../src/domain/expedition.ts";
import { createRoomStore } from "../src/services/rooms.ts";

const requiredFrames = [
  "2003:131", "2003:91", "2003:54", "2003:2", "2003:914", "2003:798",
  "2003:709", "2003:670", "2003:623", "2003:1046", "2003:1008", "2003:968",
  "2003:410", "2003:348", "2003:308", "2003:264", "2003:236", "2003:186",
];

function memoryStorage() {
  const entries = new Map();
  return {
    get length() { return entries.size; },
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
}

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

test("cria salas distintas, rejeita códigos desconhecidos e admite homônimos", () => {
  const store = createRoomStore(memoryStorage());
  const firstRoom = store.createRoom("  Turma A ", () => "ABC234");
  const codes = ["ABC234", "DEF345"];
  const secondRoom = store.createRoom("Turma B", () => codes.shift());
  assert.deepEqual(store.rooms(), [firstRoom, secondRoom]);
  assert.equal(firstRoom.name, "Turma A");
  assert.throws(() => store.joinRoom("ZZZ999", "Ana"), /Sala não encontrada/);
  assert.throws(() => store.joinRoom(firstRoom.code, "  "), /Informe seu nome/);

  const firstStudent = store.joinRoom(" abc234 ", "Ana");
  const secondStudent = store.joinRoom(firstRoom.code, "Ana");
  assert.notEqual(firstStudent.id, secondStudent.id);
  assert.equal(store.participants(firstRoom.code).length, 2);
  assert.deepEqual(store.participants(secondRoom.code), []);
});

test("protege a sequência e persiste respostas e progresso para outra leitura", () => {
  const storage = memoryStorage();
  const professor = createRoomStore(storage);
  const student = createRoomStore(storage);
  const room = professor.createRoom("Turma A", () => "ABC234");
  const participant = student.joinRoom(room.code, "Ana");
  assert.throws(() => student.advance(participant.id, "motivation"), /Aguarde/);
  professor.startRoom(room.code);
  assert.equal(student.getRoom(room.code).started, true);
  student.advance(participant.id, "classification", { value: "Inválida" });
  assert.equal(student.getParticipant(participant.id).step, "motivation");

  for (const step of expeditionSteps.slice(0, -1)) {
    student.advance(participant.id, step, { value: step });
  }

  student.advance(participant.id, "qv5", { value: "Resposta repetida", correct: false });
  const restored = createRoomStore(storage).getParticipant(participant.id);
  assert.equal(restored.step, "master");
  assert.equal(restored.answers.qv5.value, "qv5");
  assert.equal(Object.keys(restored.answers).length, expeditionSteps.length - 1);
});

test("calcula pontuação apenas com respostas objetivamente avaliadas", () => {
  assert.deepEqual(scoreSummary({
    qv1: { value: "A", correct: true },
    qv2: { value: "C", correct: false },
    "explain-chirality": { value: "Resposta aberta" },
  }), { correct: 1, total: 2 });
});

test("preserva registros válidos ao encontrar salas e participantes malformados", () => {
  const storage = memoryStorage();
  const store = createRoomStore(storage);
  const room = store.createRoom("Turma A", () => "ABC234");
  const participant = store.joinRoom(room.code, "Ana");
  store.startRoom(room.code);
  store.advance(participant.id, "motivation");

  storage.setItem("miracast:v1:room:XYZ234", JSON.stringify({ code: "XYZ234", name: "Sala incompleta" }));
  storage.setItem("miracast:v1:participant:unknown-step", JSON.stringify({
    ...participant, id: "unknown-step", step: "etapa-inexistente",
  }));
  storage.setItem("miracast:v1:participant:invalid-answer", JSON.stringify({
    ...participant, id: "invalid-answer", answers: { qv1: null },
  }));
  storage.setItem("miracast:v1:participant:invalid-json", "{");

  const restored = createRoomStore(storage);
  assert.equal(restored.getRoom("XYZ234"), null);
  assert.deepEqual(restored.rooms(), [{ ...room, started: true }]);
  assert.equal(restored.getParticipant("unknown-step"), null);
  assert.equal(restored.getParticipant("invalid-answer"), null);
  assert.equal(restored.getParticipant("invalid-json"), null);
  assert.deepEqual(restored.participants(room.code), [{ ...participant, step: "protocol" }]);
});
