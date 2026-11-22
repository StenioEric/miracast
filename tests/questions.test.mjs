import assert from "node:assert/strict";
import test from "node:test";

import { classificationItems, evaluateClassification, evaluateQuestion, questions } from "../src/domain/questions.ts";

const expectedCorrectOptions = {
  "axis-rotation": 1,
  qv1: 1,
  qv1b: 1,
  "build-molecule": 0,
  "repeat-ligand": 1,
  "identify-chiral": 1,
  qv2: 1,
  superposition: 1,
  "active-form": 1,
  qv3: 3,
  "lactic-acid": 1,
  "compare-forms": 1,
  qv4: 2,
  qv5: 1,
};

for (const [id, correctIndex] of Object.entries(expectedCorrectOptions)) {
  test(`${id} avalia todas as alternativas e devolve o feedback correspondente`, () => {
    const question = questions[id];
    const explanations = new Set();

    question.options.forEach((option, index) => {
      const result = evaluateQuestion(question, index);
      assert.deepEqual(result.answer, { value: option.value, correct: index === correctIndex });
      assert.equal(result.explanation, option.explanation);
      assert.ok(result.explanation.trim().length > 0);
      explanations.add(result.explanation);
    });

    assert.equal(explanations.size, question.options.length);
    assert.equal(evaluateQuestion(question, -1), undefined);
    assert.equal(evaluateQuestion(question, question.options.length), undefined);
  });
}

test("a substituição mantém o formato da resposta armazenada", () => {
  const { answer } = evaluateQuestion(questions["repeat-ligand"], 1);
  assert.deepEqual(answer, { value: "Não, há dois hidrogênios iguais", correct: true });
});

test("a classificação só avalia após cinco escolhas e explica cada erro", () => {
  assert.equal(evaluateClassification({ folha: "plano" }), undefined);

  const correctlyClassified = {
    folha: "plano", circulo: "plano", cubo: "espacial", piramide: "espacial", esfera: "espacial",
  };
  const expectedAnswer = "Folha de papel: plano, Círculo: plano, Cubo: espacial, Pirâmide: espacial, Esfera: espacial";
  assert.deepEqual(evaluateClassification(correctlyClassified), {
    answer: { value: expectedAnswer, correct: true },
    mistakes: [],
  });

  for (const { id, name, category, explanation } of classificationItems) {
    const result = evaluateClassification({ ...correctlyClassified, [id]: category === "plano" ? "espacial" : "plano" });
    assert.equal(result.answer.correct, false);
    assert.deepEqual(result.mistakes, [{ id, name, category, explanation }]);
    assert.ok(explanation.trim().length > 0);
  }
});
