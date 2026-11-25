import { isAuthWeakPasswordError } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

import { client } from "./expeditionAccess";

export type AuthPurpose = "confirmacao" | "recuperacao";

const confirmationMessage = "Se o cadastro puder ser concluído, confirme seu e-mail pelo link enviado. Se já possui conta, entre ou recupere a senha.";

function redirectUrl(purpose: AuthPurpose) {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin);
  url.searchParams.set("auth", purpose);
  return url.toString();
}

export async function hasTeacherAccess(user: User) {
  if (user.is_anonymous) return false;
  const { data, error } = await client().from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error) throw new Error("Não foi possível verificar o acesso à área do professor.");
  return data?.role === "professor";
}

export async function verifyTeacherSession() {
  const { data, error } = await client().auth.getUser();
  if (error || !data.user) throw new Error("Não foi possível validar a sessão do professor.");
  return await hasTeacherAccess(data.user) ? data.user : null;
}

async function requireTeacher(user: User) {
  try {
    if (await hasTeacherAccess(user)) return;
    throw new Error("Esta conta não tem acesso à área do professor.");
  } catch (problem) {
    await client().auth.signOut({ scope: "local" });
    throw problem;
  }
}

export async function loginTeacher(email: string, password: string) {
  const { data, error } = await client().auth.signInWithPassword({ email: email.trim(), password });
  if (error?.code === "invalid_credentials") throw new Error("E-mail ou senha inválidos.");
  if (error?.code === "email_not_confirmed") throw new Error("Confirme seu endereço pelo link enviado ao seu e-mail antes de entrar.");
  if (error) throw new Error("Não foi possível entrar. Tente novamente.");
  await requireTeacher(data.user);
}

function passwordError(problem: unknown) {
  if (!isAuthWeakPasswordError(problem)) return null;
  if (problem.reasons.includes("pwned")) return "Essa senha já apareceu em vazamentos. Escolha outra senha.";
  if (problem.reasons.includes("length")) return "A senha está curta para a regra do servidor. Use mais caracteres.";
  if (problem.reasons.includes("characters")) return "A senha precisa incluir os tipos de caracteres exigidos. Confira as regras do campo.";
  return "Escolha outra senha e confira os requisitos abaixo do campo.";
}

export async function resendTeacherConfirmation(email: string) {
  const { error } = await client().auth.resend({
    type: "signup", email: email.trim(), options: { emailRedirectTo: redirectUrl("confirmacao") },
  });
  if (error?.code === "over_email_send_rate_limit") throw new Error("Aguarde um pouco antes de solicitar outro e-mail.");
  if (error && error.code !== "user_not_found" && error.code !== "email_already_confirmed") {
    throw new Error("Não foi possível reenviar a confirmação. Tente novamente mais tarde.");
  }
  return confirmationMessage;
}

export async function registerTeacher(email: string, password: string) {
  const { data, error } = await client().auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: redirectUrl("confirmacao") },
  });
  if (error?.code === "user_already_exists" || error?.code === "email_exists") return confirmationMessage;
  const reason = passwordError(error);
  if (reason) throw new Error(reason);
  if (error) throw new Error("Não foi possível solicitar o cadastro. Confira os dados e tente novamente mais tarde.");
  if (!data.session) return confirmationMessage;

  await requireTeacher(data.session.user);
  return null;
}

export async function requestPasswordReset(email: string) {
  const { error } = await client().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: redirectUrl("recuperacao"),
  });
  if (error?.code === "over_email_send_rate_limit") throw new Error("Aguarde um pouco antes de solicitar outro e-mail.");
  if (error) throw new Error("Não foi possível solicitar a recuperação. Tente novamente mais tarde.");
  return "Se houver uma conta para esse e-mail, você receberá um link para redefinir a senha.";
}

export async function completeAuthLink(purpose: AuthPurpose) {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  let recovery = false;
  const subscription = code ? client().auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") recovery = true;
  }).data.subscription : null;

  try {
    const result = code ? await client().auth.exchangeCodeForSession(code) : null;
    if (!result || result.error || !result.data.session) {
      throw new Error("O link expirou ou foi aberto em outro navegador. Solicite um novo link no MiraCast.");
    }
    if (recovery !== (purpose === "recuperacao")) {
      await client().auth.signOut({ scope: "local" });
      throw new Error("Este link não é válido para esta operação. Solicite um novo link no MiraCast.");
    }
    await requireTeacher(result.data.session.user);
    return result.data.session.user.id;
  } finally {
    subscription?.unsubscribe();
    window.history.replaceState(window.history.state, "", url.pathname);
  }
}

export async function resetTeacherPassword(password: string) {
  if (!await verifyTeacherSession()) throw new Error("Esta conta não tem acesso à área do professor.");
  const { error } = await client().auth.updateUser({ password });
  const reason = passwordError(error);
  if (reason) throw new Error(reason);
  if (error?.code === "same_password") throw new Error("Escolha uma senha diferente da atual.");
  if (error) throw new Error("Não foi possível redefinir a senha. Solicite um novo link se a sessão tiver expirado.");
}
