import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";

import { expeditionSteps, nextStep } from "../src/domain/expedition.ts";

const databaseHost = "https://miracast-test.invalid";

function classroomApi() {
  const users = new Map();
  const history = [];
  const room = { id: randomUUID(), code: "A1B2C3D4E5", name: "Estereoquímica A" };
  const nextRoom = { id: randomUUID(), code: "B1C2D3E4F5", name: "Estereoquímica B" };
  const savedRooms = new Map();
  const activeRooms = new Map();
  const closedRooms = new Map();
  let participant = null;
  let readsFail = false;
  let writesFail = false;
  let advanceRequests = 0;
  let registrations = 0;
  let historyEnabled = false;

  async function respond(route) {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const filter = (column) => url.searchParams.get(column)?.slice(3);
    const classId = filter("turma_id");
    const method = request.method();
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS, PATCH, DELETE",
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
          const saved = savedRooms.size ? nextRoom : room;
          assert.equal(body.nome, saved.name);
          savedRooms.set(saved.code, saved);
          return send(saved, 201);
        }
        return send([...savedRooms.values()].filter((item) => !filter("codigo") || item.code === filter("codigo")));
      case "/rest/v1/miracast_expeditions":
        if (method === "POST") {
          assert.equal(body.turma_id, room.id);
          if (!activeRooms.has(room.id)) activeRooms.set(room.id, new Date().toISOString());
          return send(null, 201);
        }
        return send(activeRooms.has(classId) ? [{ started_at: activeRooms.get(classId) }] : []);
      case "/rest/v1/miracast_enrollments":
        return send(participant && savedRooms.get(participant.roomCode)?.id === classId ? [participant] : []);
      case "/rest/v1/miracast_closed_classes":
        if (!historyEnabled) return send({ code: "PGRST205", message: "Tabela ausente" }, 404);
        return send(closedRooms.has(classId) ? [{ closed_at: closedRooms.get(classId) }] : []);
      case "/rest/v1/miracast_expedition_history":
        if (!historyEnabled) return send({ code: "PGRST205", message: "Tabela ausente" }, 404);
        if (method === "DELETE") {
          const index = history.findIndex(({ expedition }) => expedition.id === filter("id"));
          if (index === -1) return send([]);
          const [deleted] = history.splice(index, 1);
          return send([{ id: deleted.expedition.id }]);
        }
        return send(history.filter(({ expedition }) => expedition.turma_id === classId).map(({ expedition }) => expedition));
      case "/rest/v1/miracast_archived_enrollments":
        return send(history.find(({ expedition }) => expedition.id === filter("expedition_id"))?.participants ?? []);
      case "/rest/v1/rpc/miracast_join_class": {
        const target = savedRooms.get(body.room_code);
        assert.ok(target);
        if (closedRooms.has(target.id)) {
          return send({ code: "P0001", message: "A expedição desta turma foi encerrada. Peça ao professor um novo código." }, 400);
        }
        participant = { id: user.id, roomCode: target.code, name: body.student_name, step: "motivation", answers: {} };
        return send(null);
      }
      case "/rest/v1/rpc/miracast_class_student_state": {
        if (readsFail) return send({ code: "XX000", message: "Falha de leitura simulada" }, 500);
        const current = participant?.id === user?.id ? participant : null;
        const archived = history.flatMap((record) => record.participants).find((item) => item.id === user?.id);
        const enrollment = current ?? archived;
        const enrolledRoom = savedRooms.get(enrollment?.roomCode);
        return send(enrollment ? {
          room: { ...enrolledRoom, started: activeRooms.has(enrolledRoom.id) || enrollment === archived },
          participant: enrollment, participantCount: Number(Boolean(participant)), ended: enrollment === archived,
        } : null);
      }
      case "/rest/v1/rpc/miracast_advance_class":
        advanceRequests++;
        if (writesFail) return send({ code: "XX000", message: "Falha de envio simulada" }, 500);
        if (body.expected_step === participant.step) {
          if (body.answer) participant.answers[participant.step] = body.answer;
          participant.step = nextStep(participant.step);
        }
        return send(null);
      case "/rest/v1/rpc/miracast_manage_class": {
        if (!historyEnabled) return send({ code: "PGRST202", message: "Função ausente" }, 404);
        const target = savedRooms.get(body.room_code);
        assert.ok(target);
        if (body.action === "start") {
          assert.equal(closedRooms.has(target.id), false);
          activeRooms.set(target.id, new Date().toISOString());
        }
        if (body.action === "end") {
          const startedAt = activeRooms.get(target.id);
          assert.equal(body.expected_start, startedAt);
          const endedAt = new Date().toISOString();
          history.unshift({
            expedition: { id: randomUUID(), turma_id: target.id, started_at: startedAt, ended_at: endedAt },
            participants: participant ? [participant] : [],
          });
          closedRooms.set(target.id, endedAt);
          activeRooms.delete(target.id);
          participant = null;
        }
        return send(null);
      }
      default:
        return send({ message: `Rota de teste desconhecida: ${path}` }, 404);
    }
  }

  return {
    respond,
    get registrations() { return registrations; },
    get advanceRequests() { return advanceRequests; },
    enableHistory() { historyEnabled = true; },
    failReads(value) { readsFail = value; },
    failWrites(value) { writesFail = value; },
  };
}

const button = (page, name) => page.getByRole("button", { name, exact: true });
const text = (page, value) => page.getByText(value, { exact: true });
const heading = (page, name) => page.getByRole("heading", { name, exact: true });
const wait = (locator) => locator.waitFor({ state: "visible" });

async function checkSuperpositionViewer(page) {
  const trigger = button(page, "Abrir visualização molecular 3D");
  const dialog = page.getByRole("dialog", { name: "Tente sobrepor" });
  const radio = page.locator(".choice-question").getByRole("radio").first();
  const url = page.url();
  await radio.check();
  assert.equal(await dialog.count(), 0);
  assert.equal(await page.locator("canvas").count(), 0);
  await trigger.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await trigger.click();
  const canvas = dialog.locator("canvas");
  await wait(canvas);
  assert.equal(page.url(), url);
  assert.equal(await button(dialog, "Voltar à atividade").evaluate((element) => document.activeElement === element), true);
  assert.deepEqual(await dialog.getByRole("list", { name: "Elementos químicos" }).getByRole("listitem").allTextContents(),
    ["C · Carbono", "H · Hidrogênio", "Cl · Cloro", "Br · Bromo", "F · Flúor"]);

  await button(dialog, "Comparar enantiômeros").click();
  await wait(text(dialog, "Imagem espelhada fixa"));
  assert.equal(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  const crop = { ...bounds, width: Math.floor(bounds.width / 2) };
  const reference = { ...crop, x: bounds.x + bounds.width - crop.width };
  async function capture(clip) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.screenshot({ clip });
  }
  const left = await capture(crop);
  const right = await capture(reference);
  assert.notDeepEqual(left, right);
  await page.mouse.move(bounds.x + bounds.width / 4, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 3, bounds.y + bounds.height * .7, { steps: 4 });
  await page.mouse.up();
  assert.notDeepEqual(await capture(crop), left);
  assert.deepEqual(await capture(reference), right);

  const zoom = dialog.getByRole("slider", { name: "Zoom da molécula" });
  await zoom.press("ArrowRight");
  assert.equal(await zoom.inputValue(), "1.01");
  await button(dialog, "Tentar sobrepor").click();
  await wait(text(dialog, "Centros alinhados · imagem espelhada translúcida"));
  await canvas.scrollIntoViewIfNeeded();
  const overlay = await canvas.boundingBox();
  const touch = await page.context().newCDPSession(page);
  const x = overlay.x + overlay.width / 2;
  const y = overlay.y + overlay.height / 2;
  await touch.send("Input.dispatchTouchEvent", { type: "touchStart",
    touchPoints: [{ x: x - 30, y, id: 1 }, { x: x + 30, y, id: 2 }] });
  await touch.send("Input.dispatchTouchEvent", { type: "touchMove",
    touchPoints: [{ x: x - 50, y, id: 1 }, { x: x + 50, y, id: 2 }] });
  await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await touch.detach();
  assert.ok(Number(await zoom.inputValue()) > 1.01);
  await button(dialog, "Separar moléculas").click();
  await wait(text(dialog, "Imagem espelhada fixa"));
  await button(dialog, "Restaurar posição").click();
  assert.equal(await zoom.inputValue(), "1");
  await canvas.scrollIntoViewIfNeeded();
  const restored = await canvas.boundingBox();
  assert.deepEqual(await capture({ ...crop, x: restored.x, y: restored.y }), left);

  await button(dialog, "Voltar à atividade").click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await canvas.count(), 0);
  assert.equal(await radio.isChecked(), true);
  assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => scrollY), scroll);

  await trigger.click();
  await wait(canvas);
  await page.goBack();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await radio.isChecked(), true);
  await page.goForward();
  assert.equal(await dialog.count(), 0);
  await trigger.click();
  await wait(canvas);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await radio.isChecked(), true);
  assert.equal(page.url(), url);
}

test("a expedição encerra o código, permite excluir o histórico e exige uma nova turma", { timeout: 90_000 }, async (t) => {
  process.env.VITE_SUPABASE_URL = databaseHost;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_browser_test";
  process.env.VITE_PASSWORD_MIN_LENGTH = "8";
  process.env.VITE_PASSWORD_REQUIRED_GROUPS = "";
  const cacheDir = await mkdtemp(join(tmpdir(), "miracast-vite-"));
  const server = await createServer({ cacheDir, server: { host: "127.0.0.1", port: 0 } });
  t.after(async () => {
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  });
  await server.listen();
  const { port } = server.httpServer.address();
  const site = `http://127.0.0.1:${port}/`;

  const browser = await chromium.launch({
    executablePath: process.env.MIRACAST_CHROMIUM,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  t.after(() => browser.close());
  const api = classroomApi();
  async function pageInNewContext() {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true });
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
  await wait(heading(teacher, "Turma criada"));
  await button(teacher, "Copiar link de convite").click();
  await wait(text(teacher, "Copiado."));
  const invite = await teacher.evaluate(() => window.lastClipboardCopy);
  assert.ok(invite.startsWith(site));
  assert.equal(new URL(invite).searchParams.get("turma"), "A1B2C3D4E5");
  await button(teacher, "Acessar turma").click();
  await wait(text(teacher, "O histórico das expedições estará disponível após a atualização do banco."));

  const student = await pageInNewContext();
  await student.addInitScript(() => {
    sessionStorage.setItem("miracast:active-participant", "aluna-local");
  });
  const studentRequests = new Set();
  student.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === databaseHost) studentRequests.add(url.pathname);
  });
  const code = student.getByLabel("Código da turma");
  await student.goto(new URL("?turma=ABC234", site).href);
  await wait(text(student, "Use o código de 10 caracteres fornecido pelo professor."));
  assert.equal(await code.inputValue(), "ABC234");
  await student.getByLabel("Seu nome").fill("Maria da Silva");
  await button(student, "Entrar na expedição").click();
  assert.equal(await code.evaluate((field) => field.validity.patternMismatch && document.activeElement === field), true);
  assert.equal(studentRequests.size, 0);

  await student.goto(invite);
  assert.equal(await code.inputValue(), "A1B2C3D4E5");
  await code.fill("a1b2 c3d4e5");
  assert.equal(await code.inputValue(), "A1B2C3D4E5");
  assert.equal(await text(student, "Já participei e quero retomar").count(), 0);
  await student.getByLabel("Seu nome").fill("Maria da Silva");
  await button(student, "Entrar na expedição").click();
  await wait(heading(student, "Você está na turma Estereoquímica A!"));
  assert.equal(await text(student, "Código pessoal de retomada").count(), 0);

  await button(teacher, "Iniciar expedição").click();
  await button(student, "Aceitar a expedição").click();
  await wait(text(student, "Girar o objeto muda sua identidade ou apenas o ângulo de observação?"));
  await button(student, "Iniciar fase 1").click();
  await wait(text(student, "Atividade 1 de 18"));
  assert.equal(await text(student, "Ver percurso").count(), 0);
  assert.equal(await text(student, "Consultar caderno de campo").count(), 0);
  assert.equal(await text(student, "Código pessoal de retomada").count(), 0);
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
  await wait(text(student, "Atividade 2 de 18"));
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
    if (step === "superposition") {
      const requests = api.advanceRequests;
      await checkSuperpositionViewer(student);
      assert.equal(api.advanceRequests, requests);
      await wait(text(student, `Atividade ${index + 1} de 18`));
    }
    const choices = student.locator(".choice-question");
    await choices.getByRole("radio").first().check();
    assert.equal(await choices.getByRole("radio").last().isEnabled(), true);
    assert.equal(await choices.locator("[data-correct]").count(), 0);
    await button(student, "Verificar resposta").click();
    assert.equal(await choices.getByRole("radio").last().isDisabled(), true);
    assert.equal(await choices.locator("[data-correct]").evaluate((element) => element === document.activeElement), true);
    if (step === "superposition") {
      await button(student, "Abrir visualização molecular 3D").click();
      await wait(student.getByRole("dialog").locator("canvas"));
      await button(student, "Voltar à atividade").click();
      await wait(choices.locator("[data-correct]"));
      assert.equal(await choices.getByRole("radio").last().isDisabled(), true);
    }
    await choices.getByRole("button", { name: /^Continuar/ }).click();
  }

  await wait(heading(student, "Mestre do Cristal!"));
  await wait(text(student, "Maria da Silva"));
  assert.equal(await text(student, "Código pessoal de retomada").count(), 0);
  await text(student, "Rever respostas e explicações").click();
  await wait(text(student, "Os ligantes ocupam posições espelhadas."));
  const requestsAtCompletion = api.advanceRequests;
  const score = await student.locator(".master-score").textContent();
  const crystal = student.getByRole("dialog", { name: "O Cristal em 3D" });
  assert.equal(await crystal.count(), 0);
  await student.setViewportSize({ width: 1280, height: 900 });
  await button(student, "Explorar o cristal em 3D").click();
  await wait(crystal.locator("canvas"));
  await button(crystal, "Comparar enantiômeros").click();
  await wait(text(crystal, "Imagem espelhada fixa"));
  await student.setViewportSize({ width: 320, height: 640 });
  assert.equal(await crystal.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  await student.setViewportSize({ width: 768, height: 1024 });
  assert.equal(await crystal.evaluate((element) => element.scrollWidth <= element.clientWidth), true);
  assert.equal(await button(crystal, "Tentar sobrepor").count(), 0);
  await button(crystal, "Ver apenas a molécula original").click();
  assert.equal(await text(crystal, "Imagem espelhada fixa").count(), 0);
  await student.goBack();
  await crystal.waitFor({ state: "hidden" });
  await wait(text(student, "Os ligantes ocupam posições espelhadas."));
  assert.equal(await student.locator(".master-score").textContent(), score);
  assert.equal(api.advanceRequests, requestsAtCompletion);

  await student.evaluate(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : getContext.call(this, type, ...args);
    };
  });
  await student.setViewportSize({ width: 393, height: 852 });
  await button(student, "Explorar o cristal em 3D").click();
  await wait(text(crystal, "A visualização 3D está indisponível neste navegador. Volte à atividade para continuar."));
  await button(crystal, "Voltar à atividade").click();
  await crystal.waitFor({ state: "hidden" });
  await wait(text(student, "Os ligantes ocupam posições espelhadas."));
  await student.emulateMedia({ media: "print" });
  assert.equal(await student.locator(".master-certificate").isVisible(), true);
  assert.equal(await heading(student, "Conquistas da Expedição").isVisible(), false);
  await student.emulateMedia({ media: null });

  await wait(text(teacher.getByRole("listitem"), "Concluiu"));
  await teacher.getByLabel("Filtrar por situação").selectOption("complete");
  await wait(heading(teacher, "Maria da Silva"));
  assert.equal(await button(teacher, "Encerrar expedição").count(), 0);
  api.enableHistory();
  await button(teacher, "Encerrar expedição").click();
  await button(teacher, "Confirmar encerramento").click();
  await wait(heading(teacher, "Expedições anteriores"));
  await wait(text(teacher, "Expedição encerrada"));
  assert.equal(await button(teacher, "Iniciar expedição").count(), 0);
  assert.equal(await button(teacher, "Copiar código").count(), 0);
  await teacher.getByLabel("Selecione uma expedição").selectOption({ index: 1 });
  await wait(heading(teacher, "Maria da Silva"));
  await text(teacher, "Respostas abertas").click();
  await wait(text(teacher, "Os ligantes ocupam posições espelhadas."));

  await button(teacher, "Excluir expedição").click();
  await wait(button(teacher, "Excluir definitivamente"));
  await button(teacher, "Cancelar").click();
  await wait(text(teacher, "Os ligantes ocupam posições espelhadas."));
  await button(teacher, "Excluir expedição").click();
  await button(teacher, "Excluir definitivamente").click();
  await wait(text(teacher, "Expedição excluída."));
  await heading(teacher, "Expedições anteriores").waitFor({ state: "hidden" });
  await wait(text(teacher, "Expedição encerrada"));
  assert.equal(await button(teacher, "Iniciar expedição").count(), 0);
  await wait(heading(student, "Sala ou sessão indisponível"));
  for (const name of ["miracast_join_room", "miracast_student_state", "miracast_advance"]) {
    assert.equal(studentRequests.has(`/rest/v1/rpc/${name}`), false);
  }

  const newStudent = await pageInNewContext();
  await newStudent.goto(invite);
  await newStudent.getByLabel("Seu nome").fill("Rita");
  await button(newStudent, "Entrar na expedição").click();
  await wait(text(newStudent, "A expedição desta turma foi encerrada. Peça ao professor um novo código."));

  await button(teacher, "Criar nova turma").click();
  await teacher.getByLabel("Nome da turma").fill("Estereoquímica B");
  await button(teacher, "Criar turma").click();
  await wait(heading(teacher, "Turma criada"));
  await button(teacher, "Copiar link de convite").click();
  await wait(text(teacher, "Copiado."));
  const nextInvite = await teacher.evaluate(() => window.lastClipboardCopy);
  assert.equal(new URL(nextInvite).searchParams.get("turma"), "B1C2D3E4F5");
  assert.notEqual(nextInvite, invite);
  await button(teacher, "Acessar turma").click();
  await newStudent.goto(nextInvite);
  await newStudent.getByLabel("Seu nome").fill("Rita");
  await button(newStudent, "Entrar na expedição").click();
  await wait(heading(newStudent, "Você está na turma Estereoquímica B!"));
  await button(teacher, "Iniciar expedição").click();
  await wait(button(teacher, "Encerrar expedição"));
});
