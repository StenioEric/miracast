import { client } from "./expeditionAccess";
import type { Participant } from "./rooms";

export type TeacherClass = { code: string; name: string };
export type ClassParticipant = Omit<Participant, "roomCode">;
export type ExpeditionHistory = { id: string; started_at: string; ended_at: string };
export type TeacherClassState = {
  room: TeacherClass;
  startedAt: string | null;
  history: ExpeditionHistory[];
  historyError?: string;
  participants: ClassParticipant[];
};

const classFields = "code:codigo, name:nome";

export async function listTeacherClasses(): Promise<TeacherClass[]> {
  const { data, error } = await client().from("turmas").select(classFields).order("nome").order("codigo");
  if (error) throw new Error("Não foi possível carregar suas turmas.");
  return data;
}

export async function getTeacherClass(code: string): Promise<TeacherClassState | null> {
  const api = client();
  const { data, error } = await api.from("turmas").select("id, code:codigo, name:nome").eq("codigo", code).maybeSingle();
  if (error) throw new Error("Não foi possível carregar a turma.");
  if (!data) return null;

  const [expedition, participants, history] = await Promise.all([
    api.from("miracast_expeditions").select("started_at").eq("turma_id", data.id).maybeSingle(),
    api.from("miracast_enrollments").select("id:student_id, name, step, answers")
      .eq("turma_id", data.id).order("name").order("student_id"),
    api.from("miracast_expedition_history").select("id, started_at, ended_at")
      .eq("turma_id", data.id).order("ended_at", { ascending: false }),
  ]);
  if (expedition.error || participants.error) throw new Error("Não foi possível acompanhar a expedição.");

  let historyError: string | undefined;
  if (history.error) {
    historyError = history.error.code === "PGRST205" || history.error.code === "42P01"
      ? "O histórico das expedições estará disponível após a atualização do banco."
      : "Não foi possível carregar o histórico das expedições.";
  }

  return {
    room: { code: data.code, name: data.name },
    startedAt: expedition.data?.started_at ?? null,
    history: history.data ?? [],
    historyError,
    participants: participants.data as ClassParticipant[],
  };
}

export async function createTeacherClass(name: string): Promise<TeacherClass> {
  const { data, error } = await client().from("turmas").insert({ nome: name.trim() }).select(classFields).single();
  if (error) throw new Error("Não foi possível criar a turma.");
  return data;
}

export async function renameTeacherClass(code: string, name: string) {
  const { data, error } = await client().from("turmas")
    .update({ nome: name.trim() }).eq("codigo", code).select(classFields).maybeSingle();
  if (error || !data) throw new Error("Não foi possível renomear a turma.");
}

export async function manageTeacherExpedition(code: string, action: "start" | "end", startedAt?: string) {
  const api = client();
  const { error } = await api.rpc("miracast_manage_class", {
    room_code: code, action, expected_start: startedAt ?? null,
  });
  if (!error) return;

  if (action === "start" && error.code === "PGRST202") {
    const room = await api.from("turmas").select("id").eq("codigo", code).maybeSingle();
    if (room.error || !room.data) throw new Error("Não foi possível localizar a turma.");

    const started = await api.from("miracast_expeditions").upsert(
      { turma_id: room.data.id },
      { onConflict: "turma_id", ignoreDuplicates: true },
    );
    if (!started.error) return;
  }

  throw new Error(action === "start" ? "Não foi possível iniciar a expedição." : "Não foi possível encerrar a expedição.");
}

export async function getArchivedParticipants(expeditionId: string): Promise<ClassParticipant[]> {
  const { data, error } = await client().from("miracast_archived_enrollments")
    .select("id:student_id, name, step, answers").eq("expedition_id", expeditionId).order("name").order("student_id");
  if (error) throw new Error("Não foi possível carregar os resultados.");
  return data as ClassParticipant[];
}
