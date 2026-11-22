import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

import { questions } from "../src/domain/questions.ts";

const server = await createServer({
  appType: "custom",
  server: { middlewareMode: true, watch: null, ws: false },
  optimizeDeps: { noDiscovery: true },
});
after(() => server.close());

test("a questão usa o enunciado como legenda e mantém a ação inicial desabilitada", async () => {
  const { ChoiceQuestion } = await server.ssrLoadModule("/src/components/ActivityResponse/ActivityResponse.tsx");
  const markup = renderToStaticMarkup(createElement(ChoiceQuestion, { question: questions.qv1, onContinue() {} }));

  assert.match(markup, /<legend>Quando um objeto rígido gira, o que muda\?<\/legend>/);
  const groups = [...markup.matchAll(/type="radio" name="([^"]+)"/g)].map(([, name]) => name);
  assert.equal(groups.length, 3);
  assert.equal(new Set(groups).size, 1);
  assert.match(markup, /<footer class="page-footer"><button disabled=""[^>]*>Verificar resposta<\/button>/);
});

test("a questão com revisão imediata mantém o botão de continuar desabilitado até a seleção", async () => {
  const { ChoiceQuestion } = await server.ssrLoadModule("/src/components/ActivityResponse/ActivityResponse.tsx");
  const markup = renderToStaticMarkup(createElement(ChoiceQuestion, {
    question: questions.qv2,
    reviewOnSelect: true,
    onContinue() {},
  }));

  assert.match(markup, /<button disabled=""[^>]*>Continuar<\/button>/);
  assert.doesNotMatch(markup, /Verificar resposta/);
});

for (const [step, frame] of [["lactic-acid", "2003:410"], ["compare-forms", "2003:348"]]) {
  test(`${step} usa o layout compartilhado e exibe Continuar desabilitado antes da seleção`, async () => {
    const { ActivityRoutes } = await server.ssrLoadModule("/src/navigation/ActivityRoutes.tsx");
    const markup = renderToStaticMarkup(createElement(ActivityRoutes, { step, onContinue() {} }));
    const { prompt, options } = questions[step];
    const card = markup.match(/<section class="content-card">.*?<\/section>/)?.[0];

    assert.ok(markup.includes(`class="page page--expedition" data-node-id="${frame}"`));
    assert.match(markup, /<progress class="expedition-progress"/);
    assert.ok(card?.includes(`<legend>${prompt}</legend>`));
    assert.equal([...card.matchAll(/type="radio"/g)].length, options.length);
    for (const { value } of options) assert.ok(card.includes(value));
    assert.match(markup, /<footer class="page-footer"><button disabled=""[^>]*>Continuar<\/button>/);
  });
}

test("o diagrama do ácido lático oferece um botão para cada carbono", async () => {
  const { AcidoLatico } = await server.ssrLoadModule("/src/pages/AcidoLatico/AcidoLatico.tsx");
  const markup = renderToStaticMarkup(createElement(AcidoLatico, { onContinue() {} }));
  const diagram = markup.match(/<div class="lactic-acid__diagram"[^>]*>.*?<\/div>/)?.[0];

  assert.ok(diagram);
  assert.deepEqual(
    [...diagram.matchAll(/<button aria-label="([^"]+)" aria-pressed="false"/g)].map(([, label]) => label),
    ["Carbono do CH₃", "Carbono central", "Carbono do COOH"],
  );
});

test("o feedback apresenta a explicação em uma região de status e a alternativa indica o erro", async () => {
  const { AnswerFeedback } = await server.ssrLoadModule("/src/components/ActivityResponse/AnswerFeedback.tsx");
  const { AnswerOption } = await server.ssrLoadModule("/src/components/ActivityResponse/AnswerOption.tsx");
  const feedback = renderToStaticMarkup(createElement(AnswerFeedback, { correct: false }, "Explicação educativa"));
  const option = renderToStaticMarkup(createElement(AnswerOption, {
    name: "resposta",
    label: "Alternativa escolhida",
    selected: true,
    correct: false,
    onSelect() {},
  }));

  assert.match(feedback, /role="status" data-correct="false"/);
  assert.match(feedback, /Resposta incorreta/);
  assert.match(feedback, /Explicação educativa/);
  assert.match(option, /data-selected="true" data-result="incorrect"/);
  assert.match(option, /type="radio"[^>]*checked=""/);
});

test("o layout de atividade exibe cabeçalho, progresso e rodapé compartilhados", async () => {
  const { ActivityLayout } = await server.ssrLoadModule("/src/components/ActivityLayout/ActivityLayout.tsx");
  const { PageFooter } = await server.ssrLoadModule("/src/components/PageLayout/PageLayout.tsx");
  const footer = createElement(PageFooter, null, "Ação da atividade");
  const markup = renderToStaticMarkup(createElement(ActivityLayout, { step: "qv3", footer }, "Conteúdo"));

  assert.match(markup, /<main [^>]*data-node-id="2003:968"/);
  assert.match(markup, /<header class="page-header">/);
  assert.match(markup, /<h1>Verificação Q.V3<\/h1>/);
  assert.match(markup, /<progress [^>]*max="17" aria-label="Progresso da expedição"/);
  assert.match(markup, /<footer class="page-footer">Ação da atividade<\/footer>/);
});
