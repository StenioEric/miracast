import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import type { Answer, ExpeditionStep } from "./domain/expedition";
import { ActivityRoutes } from "./navigation/ActivityRoutes";
import {
  advanceExpedition, getStudentState, joinExpedition, logoutExpedition, supabase,
} from "./services/expeditionAccess";
import type { StudentState } from "./services/expeditionAccess";
import {
  completeAuthLink, loginTeacher, registerTeacher, requestPasswordReset,
  resendTeacherConfirmation, resetTeacherPassword, verifyTeacherSession,
} from "./services/teacherAuth";
import type { AuthPurpose } from "./services/teacherAuth";
import { createTeacherClass, getTeacherClass, listTeacherClasses, renameTeacherClass, manageTeacherExpedition } from "./services/teacherClasses";
import type { TeacherClass, TeacherClassState } from "./services/teacherClasses";
import { browserRoomStore, subscribeToRooms } from "./services/rooms";
import { ExpeditionEntry } from "./pages/ExpeditionEntry/ExpeditionEntry";
import { Motivation } from "./pages/Motivation/Motivation";
import { Protocol } from "./pages/Protocol/Protocol";
import { Classification } from "./pages/Classification/Classification";
import { WaitingRoom } from "./pages/WaitingRoom/WaitingRoom";
import { SessaoIndisponivel } from "./pages/SessaoIndisponivel/SessaoIndisponivel";
import { Start } from "./pages/Start/Start";
import { ProfessorLogin } from "./pages/ProfessorLogin/ProfessorLogin";
import { ProfessorDashboard } from "./pages/ProfessorDashboard/ProfessorDashboard";
import { ProfessorCreateRoom } from "./pages/ProfessorCreateRoom/ProfessorCreateRoom";
import { ProfessorRoom } from "./pages/ProfessorRoom/ProfessorRoom";
import { RedefinirSenha } from "./pages/RedefinirSenha/RedefinirSenha";
import { PageHeader, PageLayout } from "./components/PageLayout/PageLayout";

import { AnswerReview } from "./components/AnswerReview/AnswerReview";
import { clearAllStudentDrafts, clearStudentDrafts, studentDraftKey, StudentWorkContext } from "./components/StudentWork/studentWork";

type Screen =
  | { id: "start" | "entry" | "professor-login" | "dashboard" | "create-room" | "student" }
  | { id: "room"; roomCode: string; created?: boolean }
  | { id: "auth-callback"; purpose: AuthPurpose }
  | { id: "reset-password"; userId: string }
  | { id: "local-student"; participantId: string };

type RemoteData =
  | { kind: "dashboard"; rooms: TeacherClass[] }
  | { kind: "room"; details: TeacherClassState | null }
  | { kind: "student"; details: StudentState | null };

type Snapshot = { screen: Screen; userId: string; data?: RemoteData; error?: string };

type AnswerSave = {
  step: ExpeditionStep;
  answer?: Answer;
} & (
  | { state: "saving" | "saved" }
  | { state: "failed"; message: string }
);

function getInviteCode() {
  return new URLSearchParams(window.location.search).get("turma")?.replace(/\s/g, "").toUpperCase();
}

function clearInviteCode() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("turma")) return;
  url.searchParams.delete("turma");
  window.history.replaceState(window.history.state, "", url);
}

const legacyParticipantKey = "miracast:active-participant";
const screenKey = "miracast:screen";
const legacyProfessorScreenKey = "miracast:professor-screen";

function isSavedScreen(value: unknown): value is Exclude<Screen, { id: "local-student" | "auth-callback" }> {
  if (!value || typeof value !== "object" || !("id" in value)) return false;
  switch (value.id) {
    case "professor-login":
    case "dashboard":
    case "create-room":
    case "student":
      return true;
    case "reset-password":
      return "userId" in value && typeof value.userId === "string";
    case "room":
      return "roomCode" in value && typeof value.roomCode === "string"
        && (!("created" in value) || typeof value.created === "boolean");
    default:
      return false;
  }
}

function initialScreen(): Screen {
  const purpose = new URLSearchParams(window.location.search).get("auth");
  if (purpose === "confirmacao" || purpose === "recuperacao") return { id: "auth-callback", purpose };
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(screenKey) ?? "null");
    if (isSavedScreen(saved)) return saved;
    const localParticipant = sessionStorage.getItem(legacyParticipantKey);
    if (localParticipant) return { id: "local-student", participantId: localParticipant };
    const legacy: unknown = JSON.parse(sessionStorage.getItem(legacyProfessorScreenKey) ?? "null");
    if (isSavedScreen(legacy)) return legacy;
  } catch {
    // A seleção de perfil também funciona com o armazenamento bloqueado.
  }
  return { id: getInviteCode() ? "entry" : "start" };
}

function message(problem: unknown) {
  return problem instanceof Error ? problem.message : "Não foi possível concluir a operação. Tente novamente.";
}

function useTeacherAccess(user: User | null | undefined) {
  const [access, setAccess] = useState<{ userId: string; allowed: boolean; error?: string } | null>(null);
  const userId = user?.is_anonymous ? undefined : user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void verifyTeacherSession().then(
      (teacher) => { if (active) setAccess({ userId, allowed: teacher?.id === userId }); },
      (problem: unknown) => { if (active) setAccess({ userId, allowed: false, error: message(problem) }); },
    );
    return () => { active = false; };
  }, [userId]);

  return userId && access?.userId === userId ? access : null;
}

function useRemoteData(screen: Screen, user: User | null | undefined, teacherAuthorized: boolean, revision: number) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const userId = user?.id;
  const anonymous = user?.is_anonymous;
  const enabled = anonymous ? screen.id === "student" : teacherAuthorized && (screen.id === "dashboard" || screen.id === "room");

  useEffect(() => {
    if (!enabled || !userId) return;
    const scope = { screen, userId };
    let cancelled = false;
    let timer: number;

    async function refresh() {
      try {
        let data: RemoteData;
        if (screen.id === "dashboard") {
          data = { kind: "dashboard", rooms: await listTeacherClasses() };
        } else if (screen.id === "room") {
          data = { kind: "room", details: await getTeacherClass(screen.roomCode) };
        } else {
          data = { kind: "student", details: await getStudentState() };
        }
        if (!cancelled) setSnapshot({ ...scope, data });
      } catch (problem) {
        if (!cancelled) {
          setSnapshot((current) => ({
            ...scope,
            data: current?.screen === screen && current.userId === userId ? current.data : undefined,
            error: message(problem),
          }));
        }
      }
      if (!cancelled && (screen.id === "student" || screen.id === "room")) {
        timer = window.setTimeout(refresh, 3000);
      }
    }

    void refresh();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [screen, userId, enabled, revision]);

  return enabled && snapshot?.screen === screen && snapshot.userId === userId ? snapshot : null;
}

function readLocalStudent(participantId: string): StudentState | null {
  try {
    const store = browserRoomStore();
    const participant = store.getParticipant(participantId);
    const room = participant && store.getRoom(participant.roomCode);
    return room && participant ? { room, participant, participantCount: store.participants(room.code).length } : null;
  } catch {
    return null;
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [user, setUser] = useState<User | null | undefined>(supabase ? undefined : null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [save, setSave] = useState<AnswerSave | null>(null);
  const working = useRef(false);
  const [revision, setRevision] = useState(0);
  const access = useTeacherAccess(user);
  const remote = useRemoteData(screen, user, access?.allowed === true, revision);
  const authCallback = useRef<Promise<string> | null>(null);

  useEffect(() => {
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription?.data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (screen.id === "local-student") return subscribeToRooms(() => setRevision((value) => value + 1));
  }, [screen.id]);

  const data = remote?.data;
  const student = screen.id === "local-student"
    ? readLocalStudent(screen.participantId)
    : data?.kind === "student" ? data.details : null;
  const visibleStep = student?.room.started ? student.participant.step : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, visibleStep]);

  const goTo = useCallback((target: Screen) => {
    setError("");
    setStatus("");
    setSave(null);
    setScreen(target);
    try {
      if (isSavedScreen(target)) {
        sessionStorage.setItem(screenKey, JSON.stringify(target));
      } else {
        sessionStorage.removeItem(screenKey);
      }
      sessionStorage.removeItem(legacyProfessorScreenKey);
      sessionStorage.removeItem(legacyParticipantKey);
    } catch {
      // A navegação atual também funciona sem retomar a tela ao recarregar.
    }
  }, []);

  useEffect(() => {
    if (screen.id !== "auth-callback") return;
    authCallback.current ??= completeAuthLink(screen.purpose);
    let active = true;
    void authCallback.current.then(
      (userId) => {
        if (active) goTo(screen.purpose === "recuperacao" ? { id: "reset-password", userId } : { id: "dashboard" });
      },
      (problem: unknown) => {
        if (!active) return;
        goTo({ id: "professor-login" });
        setError(message(problem));
      },
    );
    return () => { active = false; };
  }, [screen, goTo]);

  async function run(action: () => Promise<void>) {
    if (working.current) return;
    working.current = true;
    setPending(true);
    setError("");
    setStatus("");
    try {
      await action();
    } catch (problem) {
      setError(message(problem));
    } finally {
      working.current = false;
      setPending(false);
    }
  }

  function leave(target: Screen = { id: "start" }) {
    void run(async () => {
      if (user) await logoutExpedition();
      clearAllStudentDrafts();
      clearInviteCode();
      goTo(target);
    });
  }

  function advance(step: ExpeditionStep, answer?: Answer) {
    if (!student || student.participant.step !== step || student.ended) return;
    void run(async () => {
      const draftKey = studentDraftKey(student.participant.id, step);
      setSave({ step, answer, state: "saving" });
      try {
        if (screen.id === "local-student") {
          browserRoomStore().advance(student.participant.id, step, answer);
        } else {
          await advanceExpedition(step, answer, student.legacy);
          setRevision((value) => value + 1);
        }
        clearStudentDrafts(draftKey);
        setSave({ step, answer, state: "saved" });
      } catch (problem) {
        setSave({ step, answer, state: "failed", message: message(problem) });
      }
    });
  }

  function renderLogin() {
    return <ProfessorLogin
      configured={Boolean(supabase)}
      pending={pending}
      error={error || (access?.allowed === false ? access.error || "Esta conta não tem acesso à área do professor." : "")}
      status={status}
      onBackToStudent={() => leave({ id: "entry" })}
      onLogin={(email, password) => void run(async () => {
        await loginTeacher(email, password);
        goTo({ id: "dashboard" });
      })}
      onRegister={(email, password) => void run(async () => {
        const confirmation = await registerTeacher(email, password);
        if (confirmation) setStatus(confirmation);
        else goTo({ id: "dashboard" });
      })}
      onRecover={(email) => void run(async () => { setStatus(await requestPasswordReset(email)); })}
      onResend={(email) => void run(async () => { setStatus(await resendTeacherConfirmation(email)); })}
      onModeChange={() => { setError(""); setStatus(""); }}
    />;
  }

  function renderStudent() {
    if (!student) return <SessaoIndisponivel onBack={() => leave()} />;
    const { participant, room, participantCount, ended } = student;
    if (ended && participant.step !== "master") {
      return <SessaoIndisponivel ended onBack={() => leave({ id: "entry" })}>
        <AnswerReview answers={participant.answers} />
      </SessaoIndisponivel>;
    }
    if (!room.started) return <WaitingRoom
      participantName={participant.name}
      participantCount={participantCount}
      roomCode={room.code}
      roomName={room.name}
      onBack={() => leave()}
    />;

    const step = participant.step;
    const failed = save?.state === "failed" && save.step === step ? save : null;
    const reconnecting = Boolean(remote?.error) || navigator.onLine === false;
    let saveMessage: string | undefined;
    if (failed) {
      saveMessage = reconnecting ? "Aguardando conexão. Sua resposta continua nesta tela." : failed.message;
    } else if (reconnecting) {
      saveMessage = "Conexão temporariamente indisponível. O que você digitou continua nesta tela.";
    } else if (save?.state === "saving") {
      saveMessage = "Salvando resposta…";
    } else if (save?.state === "saved") {
      saveMessage = "Progresso salvo.";
    }

    let page;
    switch (step) {
      case "motivation":
        page = <Motivation onStartProtocol={() => advance(step)} />;
        break;
      case "protocol":
        page = <Protocol onStartPhase1={() => advance(step)} />;
        break;
      case "classification":
        page = <Classification onContinue={(answer) => advance(step, answer)} />;
        break;
      default:
        page = <ActivityRoutes step={step} answers={participant.answers} studentName={participant.name}
          onContinue={(answer) => advance(step, answer)} onFinish={() => leave()} />;
    }

    const draftKey = studentDraftKey(participant.id, step);

    return <StudentWorkContext.Provider key={draftKey}
      value={{ draftKey, message: saveMessage, error: Boolean(failed), busy: save?.state === "saving",
        retry: failed ? () => advance(step, failed.answer) : undefined,
        onEdit: () => setSave((current) => current?.state === "failed" ? null : current) }}>
      {page}
    </StudentWorkContext.Provider>;
  }

  function renderScreen() {
    switch (screen.id) {
      case "start":
        return <Start onEnterAsStudent={() => goTo({ id: "entry" })} onEnterAsProfessor={() => goTo({ id: "professor-login" })} />;
      case "entry":
        return <ExpeditionEntry onBack={() => leave()} pending={pending} error={error} inviteCode={getInviteCode()}
          onJoin={(code, name) => void run(async () => {
            await joinExpedition(code, name);
            clearInviteCode();
            goTo({ id: "student" });
          })} />;
      case "professor-login":
        return renderLogin();
      case "auth-callback":
        return <LoadingScreen />;
      case "reset-password":
        if (user === undefined || (user?.id === screen.userId && !access)) return <LoadingScreen />;
        return <RedefinirSenha
          available={user?.id === screen.userId && access?.allowed === true}
          pending={pending}
          error={error}
          onBack={() => leave({ id: "professor-login" })}
          onReset={(password) => void run(async () => {
            await resetTeacherPassword(password);
            await logoutExpedition();
            goTo({ id: "professor-login" });
            setStatus("Senha atualizada. Entre com a nova senha.");
          })}
        />;
      case "local-student":
        return renderStudent();
    }

    if (user === undefined) return <LoadingScreen />;
    if (screen.id === "student") {
      if (!user?.is_anonymous) return <SessaoIndisponivel onBack={() => leave()} />;
      if (!remote) return <LoadingScreen />;
      if (remote.error && !data) return <SessaoIndisponivel onBack={() => leave({ id: "entry" })}
        onRetry={() => setRevision((value) => value + 1)} />;
      return renderStudent();
    }

    if (!user || user.is_anonymous) return renderLogin();
    if (!access) return <LoadingScreen />;
    if (!access.allowed) return renderLogin();
    switch (screen.id) {
      case "dashboard":
        if (!remote) return <LoadingScreen />;
        if (data?.kind !== "dashboard") return <SessaoIndisponivel onBack={() => leave()}
          onRetry={() => setRevision((value) => value + 1)} />;
        return <ProfessorDashboard
          rooms={data.rooms}
          onCreateRoom={() => goTo({ id: "create-room" })}
          onOpenRoom={(roomCode) => goTo({ id: "room", roomCode })}
          onBack={() => leave()}
        />;
      case "create-room":
        return <ProfessorCreateRoom
          pending={pending}
          onBackToDashboard={() => goTo({ id: "dashboard" })}
          onRoomCreated={(name) => void run(async () => {
            const room = await createTeacherClass(name);
            goTo({ id: "room", roomCode: room.code, created: true });
          })}
        />;
      case "room": {
        if (!remote) return <LoadingScreen />;
        const details = data?.kind === "room" ? data.details : null;
        return details ? <ProfessorRoom
          {...details}
          created={screen.created}
          pending={pending}
          status={status}
          onViewRoom={() => goTo({ id: "room", roomCode: screen.roomCode })}
          onRename={(name) => void run(async () => {
            await renameTeacherClass(screen.roomCode, name);
            setRevision((value) => value + 1);
            setStatus("Nome da turma salvo.");
          })}
          onStart={() => void run(async () => {
            await manageTeacherExpedition(screen.roomCode, "start");
            setRevision((value) => value + 1);
          })}
          onEnd={(startedAt) => void run(async () => {
            await manageTeacherExpedition(screen.roomCode, "end", startedAt);
            setRevision((value) => value + 1);
            setStatus("Expedição encerrada. Os resultados estão no histórico.");
          })}
          onBackToDashboard={() => goTo({ id: "dashboard" })}
        /> : <SessaoIndisponivel onBack={() => goTo({ id: "dashboard" })}
          onRetry={remote.error ? () => setRevision((value) => value + 1) : undefined} />;
      }
    }
  }

  const loginVisible = screen.id === "professor-login"
    || (user !== undefined && (!user || user.is_anonymous || access?.allowed === false)
      && (screen.id === "dashboard" || screen.id === "create-room" || screen.id === "room"));
  const showRemoteError = screen.id !== "student" || !student?.room.started;
  const problem = !loginVisible && screen.id !== "reset-password" && screen.id !== "entry"
    && (error || (showRemoteError ? remote?.error : ""));
  return <>
    {problem && <p className="app-error" role="alert">{problem}</p>}
    {renderScreen()}
  </>;
}

function LoadingScreen() {
  return <PageLayout header={<PageHeader title="Carregando a expedição" />}>
    <p role="status">Aguarde um momento.</p>
  </PageLayout>;
}

export default App;
