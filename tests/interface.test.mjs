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

for (const [step, frame] of [
  ["lactic-acid", "2003:410"],
  ["compare-forms", "2003:348"],
  ["qv4", "2003:308"],
  ["augmented-reality", "2003:264"],
  ["qv5", "2003:236"],
]) {
  test(`${step} usa o layout compartilhado e exibe Verificar resposta desabilitado antes da seleção`, async () => {
    const { ActivityRoutes } = await server.ssrLoadModule("/src/navigation/ActivityRoutes.tsx");
    const markup = renderToStaticMarkup(createElement(ActivityRoutes, { step, onContinue() {} }));
    const { prompt, options } = questions[step];
    const card = markup.match(/<div class="choice-question"><section class="content-card">.*?<\/section>/)?.[0];

    assert.ok(markup.includes(`class="page page--expedition" data-node-id="${frame}"`));
    assert.match(markup, /<progress class="expedition-progress"/);
    assert.ok(card?.includes(renderToStaticMarkup(createElement("legend", null, prompt))));
    assert.equal([...card.matchAll(/type="radio"/g)].length, options.length);
    for (const { value } of options) assert.ok(card.includes(value));
    assert.match(markup, /<footer class="page-footer"><button disabled=""[^>]*>Verificar resposta<\/button>/);
  });
}

test("a tela do cristal oferece o modelo interativo e um botão opcional para abrir o 3D", async () => {
  const { Cristal3D } = await server.ssrLoadModule(
    "/src/pages/Cristal3D/Cristal3D.tsx",
  );
  const markup = renderToStaticMarkup(createElement(Cristal3D, { onContinue() {} }));

  assert.match(markup, /Ao comparar as duas formas em 3D, o que você observou/);
  assert.match(markup, /Modelo original de CHClBrF/);
  assert.match(markup, /type="range"/);
  assert.match(markup, /Restaurar posição/);
  assert.match(markup, /aria-haspopup="dialog"[^>]*>Explorar o cristal em 3D<\/button>/);
  assert.doesNotMatch(markup, /<canvas|<dialog[^>]*\sopen/);
});

test("Tente sobrepor expõe um botão opcional e mantém a pergunta na página de origem", async () => {
  const { TenteSobrepor } = await server.ssrLoadModule("/src/pages/TenteSobrepor/TenteSobrepor.tsx");
  const markup = renderToStaticMarkup(createElement(TenteSobrepor, { onContinue() {} }));
  assert.match(markup, /aria-haspopup="dialog"[^>]*>Abrir visualização molecular 3D<\/button>/);
  assert.ok(markup.includes(questions.superposition.prompt));
  assert.equal([...markup.matchAll(/type="radio"/g)].length, questions.superposition.options.length);
  assert.doesNotMatch(markup, /<canvas|<dialog[^>]*\sopen/);
});

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

test("o certificado de conclusão usa o nome do aluno e apresenta as cinco conquistas", async () => {
  const { ActivityRoutes } = await server.ssrLoadModule("/src/navigation/ActivityRoutes.tsx");
  const markup = renderToStaticMarkup(createElement(ActivityRoutes, {
    step: "master",
    studentName: "Júlia & José",
    answers: { qv5: { value: "B", correct: true } },
    onFinish() {},
  }));

  assert.match(markup, /data-node-id="2003:186"/);
  assert.match(markup, /<h1>Mestre do Cristal!<\/h1>/);
  assert.match(markup, /<p class="master-certificate__name">Júlia &amp; José<\/p>/);
  const phases = [...markup.matchAll(/<p>Fase (\d)<\/p>/g)].map(([, phase]) => phase);
  assert.deepEqual(phases, ["1", "2", "3", "4", "5"]);
  assert.match(markup, /1 de 1 respostas avaliadas corretas/);
  assert.match(markup, /Imprimir ou salvar certificado em PDF/);
  assert.doesNotMatch(markup, /Explorar o cristal em 3D|<canvas|<dialog/);
  assert.match(markup, /Rever respostas e explicações/);
  assert.match(markup, /<footer class="page-footer"><button[^>]*>.*SAIR<\/button>/);
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
  assert.match(markup, /<h1>Por que os enantiômeros são diferentes\? · Q.V3<\/h1>/);
  assert.match(markup, /<progress [^>]*max="18" aria-label="Progresso da expedição"/);
  assert.match(markup, /Atividade 13 de 18/);
  assert.match(markup, /Fase 3 · Imagens no espelho/);
  assert.match(markup, /<footer class="page-footer">Ação da atividade<\/footer>/);
});

test("o login do professor pede e-mail e senha e exige configuração do serviço", async () => {
  const { ProfessorLogin } = await server.ssrLoadModule("/src/pages/ProfessorLogin/ProfessorLogin.tsx");
  const markup = renderToStaticMarkup(createElement(ProfessorLogin, {
    configured: false,
    pending: false,
    error: "",
    onBackToStudent() {},
    onLogin() {},
    onRegister() {},
    onRecover() {},
  }));

  assert.match(markup, /data-node-id="2020:2"/);
  assert.match(markup, /<form [^>]*method="post"/);
  assert.match(markup, /<input [^>]*type="email"[^>]*autoComplete="username"/i);
  assert.match(markup, /<input [^>]*type="password"[^>]*autoComplete="current-password"/i);
  assert.match(markup, /<button disabled="" type="submit"[^>]*>Entrar<\/button>/);
  assert.match(markup, /Voltar à entrada do aluno/);
  assert.match(markup, /type="button"[^>]*>Criar conta<\/button>/);
  assert.match(markup, /type="button"[^>]*>Esqueci minha senha<\/button>/i);
});

test("a tela de redefinição só oferece uma nova senha com link validado", async () => {
  const { RedefinirSenha } = await server.ssrLoadModule("/src/pages/RedefinirSenha/RedefinirSenha.tsx");
  const props = { pending: false, error: "", onBack() {}, onReset() {} };
  const unavailable = renderToStaticMarkup(createElement(RedefinirSenha, { ...props, available: false }));
  const available = renderToStaticMarkup(createElement(RedefinirSenha, { ...props, available: true }));

  assert.doesNotMatch(unavailable, /<form/);
  assert.match(unavailable, /link de recuperação/);
  assert.match(available, /autoComplete="new-password"/i);
  assert.match(available, /Salvar nova senha/);
  assert.match(available, /Use pelo menos/);
});
