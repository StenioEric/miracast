import { createClient } from "@supabase/supabase-js";

import type { Answer, ExpeditionStep } from "../domain/expedition";
import { normalizeRoomCode } from "./rooms";
import type { Participant, Room } from "./rooms";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function connect(projectUrl: string, key: string) {
  // A chave aleatória separa o BroadcastChannel. O adaptador mantém a sessão
  // da mesma aba quando a página recarrega.
  const storageKey = `miracast:${crypto.randomUUID()}`;
  const localKey = (key: string) => key.replace(storageKey, `miracast:auth:${projectUrl}`);
  const storage = (key: string) => key.endsWith("-code-verifier") ? localStorage : sessionStorage;
  return createClient(projectUrl, key, {
    auth: {
      storageKey,
      flowType: "pkce",
      detectSessionInUrl: false,
      storage: {
        getItem: (key) => storage(key).getItem(localKey(key)),
        setItem: (key, value) => storage(key).setItem(localKey(key), value),
        removeItem: (key) => storage(key).removeItem(localKey(key)),
      },
    },
  });
}

export const supabase = typeof window !== "undefined" && url && publishableKey?.startsWith("sb_publishable_")
  ? connect(url, publishableKey)
  : null;

export function client() {
  if (!supabase) throw new Error("O acesso à expedição ainda não foi configurado.");
  return supabase;
}

export async function logoutExpedition() {
  const { error } = await client().auth.signOut({ scope: "local" });
  if (error) throw new Error("Não foi possível encerrar a sessão. Tente novamente.");
}

export type StudentState = { room: Room; participant: Participant; participantCount: number };

export async function joinExpedition(code: string, name: string) {
  const api = client();
  const { data, error } = await api.auth.getSession();
  if (error) throw new Error("Não foi possível iniciar a sessão do aluno.");
  if (data.session && !data.session.user.is_anonymous) {
    throw new Error("Saia da conta do professor antes de entrar como aluno.");
  }
  if (!data.session) {
    const { error } = await api.auth.signInAnonymously();
    if (error?.code === "anonymous_provider_disabled") {
      throw new Error("O ingresso por código ainda não está disponível neste projeto.");
    }
    if (error) throw new Error("Não foi possível iniciar a sessão do aluno.");
  }
  const result = await api.rpc("miracast_join_room", {
    room_code: normalizeRoomCode(code),
    student_name: name.trim(),
  });
  if (result.error) {
    if (result.error.code === "PGRST202") throw new Error("O ingresso por código ainda não está disponível neste projeto.");
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
