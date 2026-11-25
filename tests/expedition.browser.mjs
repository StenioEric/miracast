import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";

import { expeditionSteps, nextStep } from "../src/domain/expedition.ts";

const databaseHost = "https://miracast-test.invalid";

function classroomApi() {
  const users = new Map();
  const history = [];
  const room = { id: randomUUID(), code: "A1B2C3D4E5", name: "Estereoquímica A" };
  let roomCreated = false;
  let startedAt = null;
  let participant = null;
  let personalCode = "";
  let readsFail = false;
  let writesFail = false;
  let registrations = 0;

  async function respond(route) {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS, PATCH",
      "access-control-allow-headers": request.headers()["access-control-request-headers"] ?? "*",
      "x-supabase-api-version": "2024-01-01",
    };
    const send = (json, status = 200) => route.fulfill({ status, json, headers });
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });

    const token = request.headers().authorization?.replace("Bearer ", "");
    const user = users.get(token);
    const body = method === "POST" ? request.postDataJSON() : undefined;

    switch (path) {
      case "/auth/v1/signup": {
        const id = randomUUID();
        if (body.email) registrations++;
        const account = { id, email: body.email, role: "authenticated", is_anonymous: !body.email };
        if (body.email?.endsWith("@confirm.example.test")) return send({ user: account });
        users.set(id, account);
        return send({ user: account, access_token: id, refresh_token: id, token_type: "bearer", expires_in: 3600 });
      }
      case "/auth/v1/recover":
      case "/auth/v1/resend":
        return send({});
      case "/auth/v1/user":
        return send(user ?? { message: "Sessão inválida" }, user ? 200 : 401);
      case "/rest/v1/profiles":
        return send(user && !user.is_anonymous ? [{ role: "professor" }] : []);
      case "/rest/v1/turmas":
        if (method === "POST") {
          assert.equal(body.nome, room.name);
          roomCreated = true;
          return send(room, 201);
        }
        return send(roomCreated ? [room] : []);
      case "/rest/v1/miracast_expeditions":
        return send(startedAt ? [{ started_at: startedAt }] : []);
      case "/rest/v1/miracast_enrollments":
        return send(participant ? [participant] : []);
      case "/rest/v1/miracast_expedition_history":
        return send(history.map(({ expedition }) => expedition));
      case "/rest/v1/miracast_archived_enrollments":
        return send(history[0]?.participants ?? []);
      case "/rest/v1/rpc/miracast_join_class":
        assert.equal(body.room_code, room.code);
        participant = { id: user.id, roomCode: room.code, name: body.student_name, step: "motivation", answers: {} };
        return send(null);
      case "/rest/v1/rpc/miracast_class_student_state": {
        if (readsFail) return send({ code: "XX000", message: "Falha de leitura simulada" }, 500);
        const archived = history[0]?.participants[0];
        const enrollment = participant?.id === user?.id ? participant : archived?.id === user?.id ? archived : null;
        return send(enrollment ? {
          room: { ...room, started: Boolean(startedAt) || enrollment === archived },
          participant: enrollment, participantCount: Number(Boolean(participant)), ended: enrollment === archived,
        } : null);
      }
      case "/rest/v1/rpc/miracast_student_state":
        return send(null);
      case "/rest/v1/rpc/miracast_issue_class_resume_code":
        personalCode = randomUUID().replaceAll("-", "");
        return send(personalCode);
      case "/rest/v1/rpc/miracast_resume_class":
        assert.equal(body.personal_code, personalCode);
        participant.id = user.id;
        return send(null);
      case "/rest/v1/rpc/miracast_advance_class":
        if (writesFail) return send({ code: "XX000", message: "Falha de envio simulada" }, 500);
        if (body.expected_step === participant.step) {
          if (body.answer) participant.answers[participant.step] = body.answer;
          participant.step = nextStep(participant.step);
        }
        return send(null);
      case "/rest/v1/rpc/miracast_manage_class":
        if (body.action === "start") startedAt = new Date().toISOString();
        if (body.action === "end") {
          assert.equal(body.expected_start, startedAt);
          history.unshift({
            expedition: { id: randomUUID(), started_at: startedAt, ended_at: new Date().toISOString() },
            participants: participant ? [participant] : [],
          });
          startedAt = null;
          participant = null;
        }
        return send(null);
      default:
        return send({ message: `Rota de teste desconhecida: ${path}` }, 404);
    }
  }

  return {
    respond,
    get registrations() { return registrations; },
    failReads(value) { readsFail = value; },
    failWrites(value) { writesFail = value; },
  };
}

const button = (page, name) => page.getByRole("button", { name, exact: true });
const text = (page, value) => page.getByText(value, { exact: true });
const heading = (page, name) => page.getByRole("heading", { name, exact: true });
const wait = (locator) => locator.waitFor({ state: "visible" });

test("professor e aluno completam a expedição com reconexão, retomada e histórico", { timeout: 90_000 }, async (t) => {
  process.env.VITE_SUPABASE_URL = databaseHost;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_browser_test";
  process.env.VITE_PASSWORD_MIN_LENGTH = "8";
  process.env.VITE_PASSWORD_REQUIRED_GROUPS = "";
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
  t.after(() => server.close());
  await server.listen();
  const { port } = server.httpServer.address();
  const site = `http://127.0.0.1:${port}/`;

  const browser = await chromium.launch({ executablePath: process.env.MIRACAST_CHROMIUM });
  t.after(() => browser.close());
  const api = classroomApi();
  async function pageInNewContext() {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    context.setDefaultTimeout(12_000);
    await context.route(databaseHost + "/**", api.respond);
    await context.addInitScript(() => {
      navigator.clipboard.writeText = async (value) => { window.lastClipboardCopy = value; };
    });
    return context.newPage();
  }

  const teacher = await pageInNewContext();
  await teacher.goto(site);
  await button(teacher, "Entrar como Professor").click();
  await button(teacher, "Criar conta").click();
  await wait(heading(teacher, "Criar conta de professor"));
  await wait(text(teacher, "Use pelo menos 8 caracteres."));
  await teacher.getByLabel("E-mail").fill("professor@confirm.example.test");
  const password = teacher.locator("input[name=password]");
  await password.fill("curta");
  await button(teacher, "Criar conta").click();
  await wait(text(teacher, "A senha precisa de pelo menos 8 caracteres."));
  assert.equal(api.registrations, 0);
  await button(teacher, "Mostrar senha").click();
  assert.equal(await password.getAttribute("type"), "text");
  await password.fill("Uma senha de teste");
  await button(teacher, "Criar conta").click();
  await wait(text(teacher, "professor@confirm.example.test"));
  await button(teacher, "Reenviar confirmação").click();
  await button(teacher, "Corrigir e-mail").click();
  assert.equal(await teacher.getByLabel("E-mail").evaluate((field) => document.activeElement === field), true);
  await teacher.getByLabel("E-mail").fill("professor@example.test");
  await button(teacher, "Criar conta").click();
  await wait(heading(teacher, "Minhas turmas"));

  const recovery = await pageInNewContext();
  await recovery.goto(site);
  await button(recovery, "Entrar como Professor").click();
  await button(recovery, "Esqueci minha senha").click();
  assert.equal(await recovery.locator("input[name=password]").count(), 0);
  await recovery.getByLabel("E-mail").fill("professor@example.test");
  await button(recovery, "Enviar link").click();
  await wait(text(recovery, "professor@example.test"));
  await button(recovery, "Reenviar link").click();
  await wait(text(recovery, "professor@example.test"));
  await recovery.context().close();
  await button(teacher, "Criar nova turma").click();
  await teacher.getByLabel("Nome da turma").fill("Estereoquímica A");
  await button(teacher, "Criar turma").click();
  await button(teacher, "Copiar link de convite").click();
  await wait(text(teacher, "Copiado."));
  const invite = await teacher.evaluate(() => window.lastClipboardCopy);
  assert.ok(invite.startsWith(site));
  assert.equal(new URL(invite).searchParams.get("turma"), "A1B2C3D4E5");
  await button(teacher, "Acessar turma").click();

  let student = await pageInNewContext();
  await student.goto(invite);
  assert.equal(await student.getByLabel("Código da turma").inputValue(), "A1B2C3D4E5");
  await student.getByLabel("Seu nome").fill("Maria da Silva");
  await button(student, "Entrar na expedição").click();
  await wait(heading(student, "Você está na turma Estereoquímica A!"));
  await text(student, "Código pessoal de retomada").click();
  await button(student, "Gerar código de retomada").click();
  const code = await student.locator(".student-resume__code").innerText();

  await button(teacher, "Iniciar expedição").click();
  await button(student, "Aceitar a expedição").click();
  await wait(text(student, "Girar o objeto muda sua identidade ou apenas o ângulo de observação?"));
  await button(student, "Iniciar fase 1").click();
  await wait(text(student, "Atividade 1 de 18"));
  assert.equal(await text(student, "Ver percurso").count(), 0);
  assert.equal(await text(student, "Consultar caderno de campo").count(), 0);
  for (const fieldset of await student.locator("fieldset").all()) await fieldset.getByRole("radio").first().check();
  await button(student, "Classificar todos").click();
  await button(student, "Continuar").click();

  await wait(text(student, "Atividade 2 de 18"));
  const explanation = "O cubo continua sendo o mesmo objeto depois de girar.";
  await student.locator("textarea").fill(explanation);
  api.failReads(true);
  await wait(text(student, "Conexão temporariamente indisponível. O que você digitou continua nesta tela."));
  assert.equal(await student.locator("textarea").inputValue(), explanation);
  api.failReads(false);
  await student.reload();
  assert.equal(await student.locator("textarea").inputValue(), explanation);

  await student.locator("textarea").fill("a".repeat(2000));
  await button(student, "identidade").click();
  await wait(text(student, "Reduza a resposta em 28 caracteres."));
  assert.equal(await button(student, "Salvar resposta e continuar").isDisabled(), true);
  await student.locator("textarea").fill(explanation);
  api.failWrites(true);
  await button(student, "Salvar resposta e continuar").click();
  await wait(button(student, "Tentar novamente"));
  assert.equal(await student.locator("textarea").inputValue(), explanation);
  api.failWrites(false);
  await button(student, "Tentar novamente").click();
  await wait(text(student, "Atividade 3 de 18"));

  await student.context().close();
  student = await pageInNewContext();
  await student.goto(site);
  await button(student, "Entrar como Aluno").click();
  await button(student, "Já participei e quero retomar").click();
  await student.getByLabel("Código pessoal").fill(code);
  await button(student, "Retomar expedição").click();
  await wait(text(student, "Atividade 3 de 18"));

  const numbered = expeditionSteps.slice(expeditionSteps.indexOf("classification"), -1);
  for (const [index, step] of numbered.entries()) {
    if (index < 2) continue;
    await wait(text(student, `Atividade ${index + 1} de 18`));
    if (step === "build-molecule") {
      for (const atom of ["H", "Cl", "Br", "F"]) await button(student, atom).click();
    }
    if (step === "repeat-ligand") await button(student, "Substituir F por H").click();
    if (step === "explain-chirality") {
      await student.locator("textarea").fill("Os ligantes ocupam posições espelhadas.");
      await button(student, "Salvar resposta e continuar").click();
      continue;
    }
    if (step === "augmented-reality") {
      assert.equal(await student.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const rotation = student.getByRole("slider").first();
      await rotation.press("ArrowRight");
      assert.equal(await rotation.inputValue(), "26");
      await button(student, "Restaurar posição").click();
      assert.equal(await rotation.inputValue(), "25");
    }
    const choices = student.locator(".choice-question");
    await choices.getByRole("radio").first().check();
    assert.equal(await choices.getByRole("radio").last().isEnabled(), true);
    assert.equal(await choices.locator("[data-correct]").count(), 0);
    await button(student, "Verificar resposta").click();
    assert.equal(await choices.getByRole("radio").last().isDisabled(), true);
    assert.equal(await choices.locator("[data-correct]").evaluate((element) => element === document.activeElement), true);
    await choices.getByRole("button", { name: /^Continuar/ }).click();
  }

  await wait(heading(student, "Mestre do Cristal!"));
  await wait(text(student, "Maria da Silva"));
  await text(student, "Rever respostas e explicações").click();
  await wait(text(student, "Os ligantes ocupam posições espelhadas."));
  await student.emulateMedia({ media: "print" });
  assert.equal(await student.locator(".master-certificate").isVisible(), true);
  assert.equal(await heading(student, "Conquistas da Expedição").isVisible(), false);

  await wait(text(teacher.getByRole("listitem"), "Concluiu"));
  await teacher.getByLabel("Filtrar por situação").selectOption("complete");
  await wait(heading(teacher, "Maria da Silva"));
  await button(teacher, "Encerrar expedição").click();
  await button(teacher, "Confirmar encerramento").click();
  await wait(heading(teacher, "Expedições anteriores"));
  await teacher.getByLabel("Selecione uma expedição").selectOption({ index: 1 });
  await wait(heading(teacher, "Maria da Silva"));
  await text(teacher, "Respostas abertas").click();
  await wait(text(teacher, "Os ligantes ocupam posições espelhadas."));
  await button(teacher, "Iniciar nova expedição").click();
  await wait(button(teacher, "Encerrar expedição"));
});
