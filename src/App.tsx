import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import type { Answer, ExpeditionStep } from "./domain/expedition";
import { ActivityRoutes } from "./navigation/ActivityRoutes";
import {
  advanceExpedition, createTeacherRoom, getStudentState, getTeacherRoom, joinExpedition,
  listTeacherRooms, loginTeacher, logoutExpedition, startTeacherRoom, supabase,
} from "./services/expeditionAccess";
import type { RoomSummary, StudentState, TeacherRoomState } from "./services/expeditionAccess";
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
import { PageHeader, PageLayout } from "./components/PageLayout/PageLayout";

type Screen =
  | { id: "start" | "entry" | "professor-login" | "dashboard" | "create-room" | "student" }
  | { id: "room"; roomCode: string; created?: boolean }
  | { id: "local-student"; participantId: string };

type RemoteData =
  | { kind: "dashboard"; rooms: RoomSummary[] }
  | { kind: "room"; details: TeacherRoomState | null }
  | { kind: "student"; details: StudentState | null };

type Snapshot = { screen: Screen; userId: string } & (
  | { data: RemoteData }
  | { error: string }
);

const legacyParticipantKey = "miracast:active-participant";
const screenKey = "miracast:screen";
const legacyProfessorScreenKey = "miracast:professor-screen";

function isSavedScreen(value: unknown): value is Exclude<Screen, { id: "local-student" }> {
  if (!value || typeof value !== "object" || !("id" in value)) return false;
  switch (value.id) {
    case "professor-login":
    case "dashboard":
    case "create-room":
    case "student":
      return true;
    case "room":
      return "roomCode" in value && typeof value.roomCode === "string"
        && (!("created" in value) || typeof value.created === "boolean");
    default:
      return false;
  }
}

function initialScreen(): Screen {
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
  return { id: "start" };
}

function message(problem: unknown) {
  return problem instanceof Error ? problem.message : "Não foi possível concluir a operação. Tente novamente.";
}

function useRemoteData(screen: Screen, user: User | null | undefined, revision: number) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const userId = user?.id;
  const anonymous = user?.is_anonymous;
  const enabled = anonymous ? screen.id === "student" : screen.id === "dashboard" || screen.id === "room";

  useEffect(() => {
    if (!enabled || !userId) return;
    const scope = { screen, userId };
    let cancelled = false;
    let timer: number;

    async function refresh() {
      try {
        let data: RemoteData;
        if (screen.id === "dashboard") {
          data = { kind: "dashboard", rooms: await listTeacherRooms() };
        } else if (screen.id === "room") {
          data = { kind: "room", details: await getTeacherRoom(screen.roomCode) };
        } else {
          data = { kind: "student", details: await getStudentState() };
        }
        if (!cancelled) setSnapshot({ ...scope, data });
      } catch (problem) {
        if (!cancelled) setSnapshot({ ...scope, error: message(problem) });
      }
      if (!cancelled) timer = window.setTimeout(refresh, 3000);
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
  const [pending, setPending] = useState(false);
  const working = useRef(false);
  const [revision, setRevision] = useState(0);
  const remote = useRemoteData(screen, user, revision);

  useEffect(() => {
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription?.data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (screen.id === "local-student") return subscribeToRooms(() => setRevision((value) => value + 1));
  }, [screen.id]);

  const data = remote && "data" in remote ? remote.data : null;
  const student = screen.id === "local-student"
    ? readLocalStudent(screen.participantId)
    : data?.kind === "student" ? data.details : null;
  const visibleStep = student?.room.started ? student.participant.step : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, visibleStep]);

  function goTo(target: Screen) {
    setError("");
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
  }

  async function run(action: () => Promise<void>) {
    if (working.current) return;
    working.current = true;
    setPending(true);
    setError("");
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
      goTo(target);
    });
  }

  function advance(step: ExpeditionStep, answer?: Answer) {
    if (!student) return;
    void run(async () => {
      if (screen.id === "local-student") {
        browserRoomStore().advance(student.participant.id, step, answer);
      } else {
        await advanceExpedition(step, answer);
        setRevision((value) => value + 1);
      }
    });
  }

  function renderLogin() {
    return <ProfessorLogin
      configured={Boolean(supabase)}
      pending={pending}
      error={error}
      onBackToStudent={() => leave({ id: "entry" })}
      onLogin={(email, password) => void run(async () => {
        await loginTeacher(email, password);
        goTo({ id: "dashboard" });
      })}
    />;
  }

  function renderStudent() {
    if (!student) return <SessaoIndisponivel onBack={() => leave()} />;
    const { participant, room, participantCount } = student;
    if (!room.started) return <WaitingRoom
      participantName={participant.name}
      participantCount={participantCount}
      roomCode={room.code}
      onBack={() => leave()}
    />;
    switch (participant.step) {
      case "motivation":
        return <Motivation onStartProtocol={() => advance("motivation")} />;
      case "protocol":
        return <Protocol onStartPhase1={() => advance("protocol")} />;
      case "classification":
        return <Classification onContinue={(answer) => advance("classification", answer)} />;
      default:
        return <ActivityRoutes step={participant.step} answers={participant.answers}
          studentName={participant.name} onContinue={(answer) => advance(participant.step, answer)} onFinish={() => leave()} />;
    }
  }

  function renderScreen() {
    switch (screen.id) {
      case "start":
        return <Start onEnterAsStudent={() => goTo({ id: "entry" })} onEnterAsProfessor={() => goTo({ id: "professor-login" })} />;
      case "entry":
        return <ExpeditionEntry onBack={() => leave()} pending={pending} onJoin={(code, name) => void run(async () => {
          await joinExpedition(code, name);
          goTo({ id: "student" });
        })} />;
      case "professor-login":
        return renderLogin();
      case "local-student":
        return renderStudent();
    }

    if (user === undefined) return <LoadingScreen />;
    if (screen.id === "student") {
      if (!user?.is_anonymous) return <SessaoIndisponivel onBack={() => leave()} />;
      if (!remote) return <LoadingScreen />;
      if ("error" in remote) return <SessaoIndisponivel onBack={() => leave()} />;
      return renderStudent();
    }

    if (!user || user.is_anonymous) return renderLogin();
    switch (screen.id) {
      case "dashboard":
        if (!remote) return <LoadingScreen />;
        if (data?.kind !== "dashboard") return <SessaoIndisponivel onBack={() => leave()} />;
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
            const room = await createTeacherRoom(name);
            goTo({ id: "room", roomCode: room.code, created: true });
          })}
        />;
      case "room": {
        if (!remote) return <LoadingScreen />;
        const details = data?.kind === "room" ? data.details : null;
        return details ? <ProfessorRoom
          room={details.room}
          participants={details.participants}
          created={screen.created}
          onViewRoom={() => goTo({ id: "room", roomCode: screen.roomCode })}
          onStart={() => void run(async () => {
            await startTeacherRoom(screen.roomCode);
            setRevision((value) => value + 1);
          })}
          onBackToDashboard={() => goTo({ id: "dashboard" })}
        /> : <SessaoIndisponivel onBack={() => goTo({ id: "dashboard" })} />;
      }
    }
  }

  const loginVisible = screen.id === "professor-login"
    || (user !== undefined && (!user || user.is_anonymous)
      && (screen.id === "dashboard" || screen.id === "create-room" || screen.id === "room"));
  const problem = !loginVisible && (error || (remote && "error" in remote ? remote.error : ""));
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
