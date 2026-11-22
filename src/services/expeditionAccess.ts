import { createClient } from "@supabase/supabase-js";

import type { Answer, ExpeditionStep } from "../domain/expedition";
import { generateRoomCode, normalizeRoomCode } from "./rooms";
import type { Participant, Room } from "./rooms";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function connect(projectUrl: string, key: string) {
  // A chave aleatória separa o BroadcastChannel. O adaptador mantém a sessão
  // da mesma aba quando a página recarrega.
  const storageKey = `miracast:${crypto.randomUUID()}`;
  const localKey = (key: string) => key.replace(storageKey, `miracast:auth:${projectUrl}`);
  return createClient(projectUrl, key, {
    auth: {
      storageKey,
      detectSessionInUrl: false,
      storage: {
        getItem: (key) => sessionStorage.getItem(localKey(key)),
        setItem: (key, value) => sessionStorage.setItem(localKey(key), value),
        removeItem: (key) => sessionStorage.removeItem(localKey(key)),
      },
    },
  });
}

export const supabase = typeof window !== "undefined" && url && publishableKey
  ? connect(url, publishableKey)
  : null;

function client() {
  if (!supabase) throw new Error("O acesso à expedição ainda não foi configurado.");
  return supabase;
}

async function requireTeacher() {
  const { data, error } = await client().from("miracast_teachers").select("id").maybeSingle();
  if (error) throw new Error("Não foi possível verificar o acesso à área do professor.");
  if (!data) throw new Error("Esta conta não tem acesso à área do professor.");
}

export async function loginTeacher(email: string, password: string) {
  const api = client();
  const { error } = await api.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    throw new Error(error.code === "invalid_credentials"
      ? "E-mail ou senha inválidos."
      : "Não foi possível entrar. Tente novamente.");
  }

  try {
    await requireTeacher();
  } catch (problem) {
    await api.auth.signOut({ scope: "local" });
    throw problem;
  }
}

export async function logoutExpedition() {
  const { error } = await client().auth.signOut({ scope: "local" });
  if (error) throw new Error("Não foi possível encerrar a sessão. Tente novamente.");
}

export type RoomSummary = Room & { participantCount: number };
export type TeacherRoomState = { room: Room; participants: Participant[] };
export type StudentState = { room: Room; participant: Participant; participantCount: number };

const roomFields = "code, name, started";

export async function listTeacherRooms(): Promise<RoomSummary[]> {
  await requireTeacher();
  const { data, error } = await client().from("miracast_rooms")
    .select("code, name, started, miracast_participants(count)")
    .order("name").order("code");

  if (error) throw new Error("Não foi possível carregar suas salas.");
  return data.map(({ miracast_participants, ...room }) => ({
    ...room,
    participantCount: miracast_participants[0]?.count ?? 0,
  }));
}

export async function getTeacherRoom(code: string): Promise<TeacherRoomState | null> {
  const api = client();
  const [room, participants] = await Promise.all([
    api.from("miracast_rooms").select(roomFields).eq("code", code).maybeSingle(),
    api.from("miracast_participants").select("id, roomCode, name, step, answers").eq("roomCode", code).order("name"),
  ]);

  if (room.error || participants.error) throw new Error("Não foi possível carregar a sala.");
  if (!room.data) return null;
  return { room: room.data, participants: participants.data as Participant[] };
}

export async function createTeacherRoom(name: string): Promise<Room> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Informe um nome para a sala.");
  for (let attempt = 0; attempt < 20; attempt++) {
    const { data, error } = await client().from("miracast_rooms")
      .insert({ code: generateRoomCode(), name: trimmed })
      .select(roomFields).single();

    if (!error) return data;
    if (error.code !== "23505") break;
  }
  throw new Error("Não foi possível criar a sala.");
}

export async function startTeacherRoom(code: string) {
  const { data, error } = await client().from("miracast_rooms")
    .update({ started: true }).eq("code", code).select("code").maybeSingle();
  if (error || !data) throw new Error("Não foi possível iniciar a sala.");
}

export async function joinExpedition(code: string, name: string) {
  const api = client();
  const { data, error } = await api.auth.getSession();
  if (error) throw new Error("Não foi possível iniciar a sessão do aluno.");
  if (data.session && !data.session.user.is_anonymous) {
    throw new Error("Saia da conta do professor antes de entrar como aluno.");
  }
  if (!data.session) {
    const { error } = await api.auth.signInAnonymously();
    if (error) throw new Error("Não foi possível iniciar a sessão do aluno.");
  }
  const result = await api.rpc("miracast_join_room", {
    room_code: normalizeRoomCode(code),
    student_name: name.trim(),
  });
  if (result.error) {
    throw new Error(result.error.code === "P0001" ? result.error.message : "Não foi possível entrar na sala.");
  }
}

export async function getStudentState(): Promise<StudentState | null> {
  const { data, error } = await client().rpc("miracast_student_state");
  if (error) throw new Error("Não foi possível carregar sua participação.");
  return data;
}

export async function advanceExpedition(step: ExpeditionStep, answer?: Answer) {
  const { error } = await client().rpc("miracast_advance", { expected_step: step, answer: answer ?? null });
  if (error) throw new Error(error.code === "P0001" ? error.message : "Não foi possível registrar a resposta.");
}
