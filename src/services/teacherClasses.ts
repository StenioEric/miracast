import { client } from "./expeditionAccess";

export type TeacherClass = { code: string; name: string };

const classFields = "code:codigo, name:nome";

export async function listTeacherClasses(): Promise<TeacherClass[]> {
  const { data, error } = await client().from("turmas").select(classFields).order("nome").order("codigo");
  if (error) throw new Error("Não foi possível carregar suas turmas.");
  return data;
}

export async function getTeacherClass(code: string): Promise<TeacherClass | null> {
  const { data, error } = await client().from("turmas").select(classFields).eq("codigo", code).maybeSingle();
  if (error) throw new Error("Não foi possível carregar a turma.");
  return data;
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
