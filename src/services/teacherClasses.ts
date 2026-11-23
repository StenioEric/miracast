import { client } from "./expeditionAccess";
import type { Participant } from "./rooms";

export type TeacherClass = { code: string; name: string };
export type ClassParticipant = Omit<Participant, "roomCode">;
export type TeacherClassState = {
  room: TeacherClass;
  started: boolean;
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

  const [expedition, participants] = await Promise.all([
    api.from("miracast_expeditions").select("started_at").eq("turma_id", data.id).maybeSingle(),
    api.from("miracast_enrollments").select("id:student_id, name, step, answers")
      .eq("turma_id", data.id).order("name").order("student_id"),
  ]);
  if (expedition.error || participants.error) throw new Error("Não foi possível acompanhar a expedição.");

  return {
    room: { code: data.code, name: data.name },
    started: Boolean(expedition.data),
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

export async function startTeacherExpedition(code: string) {
  const api = client();
  const { data, error } = await api.from("turmas").select("id").eq("codigo", code).maybeSingle();
  if (error || !data) throw new Error("Não foi possível localizar a turma.");

  const started = await api.from("miracast_expeditions").upsert(
    { turma_id: data.id },
    { onConflict: "turma_id", ignoreDuplicates: true },
  );
  if (started.error) throw new Error("Não foi possível iniciar a expedição.");
}
