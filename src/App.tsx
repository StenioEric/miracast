import { useEffect, useState } from "react";

import type { Answer, ExpeditionStep } from "./domain/expedition";
import { ActivityRoutes } from "./navigation/ActivityRoutes";
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

type ProfessorScreen =
  | { id: "professor-login" | "dashboard" | "create-room" }
  | { id: "room"; roomCode: string; created?: boolean };

type Screen =
  | ProfessorScreen
  | { id: "start" | "entry" }
  | { id: "student"; participantId: string };

const participantSessionKey = "miracast:active-participant";
const professorSessionKey = "miracast:professor-screen";

function isProfessorScreen(value: unknown): value is ProfessorScreen {
  if (!value || typeof value !== "object" || !("id" in value)) return false;
  switch (value.id) {
    case "professor-login":
    case "dashboard":
    case "create-room":
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
    const participantId = sessionStorage.getItem(participantSessionKey);
    if (participantId) return { id: "student", participantId };
    const savedScreen: unknown = JSON.parse(sessionStorage.getItem(professorSessionKey) ?? "null");
    if (isProfessorScreen(savedScreen)) return savedScreen;
  } catch {
    // A página inicial continua disponível com o armazenamento bloqueado.
  }
  return { id: "start" };
}

function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [error, setError] = useState("");
  const [, setStorageRevision] = useState(0);
  useEffect(() => subscribeToRooms(() => setStorageRevision((revision) => revision + 1)), []);

  const { storage, participant, room } = readRoomState(screen);
  const visibleStep = room?.started ? participant?.step : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, visibleStep]);

  function goTo(target: Screen) {
    setError("");
    setScreen(target);
    try {
      if (isProfessorScreen(target)) {
        sessionStorage.setItem(professorSessionKey, JSON.stringify(target));
      } else {
        sessionStorage.removeItem(professorSessionKey);
      }
    } catch {
      // A navegação da aba continua disponível sem retomar a tela ao recarregar.
    }
  }

  function run(action: () => void) {
    setError("");
    try {
      action();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Não foi possível salvar a alteração. Tente novamente.");
    }
  }

  function returnHome() {
    goTo({ id: "start" });
    try {
      sessionStorage.removeItem(participantSessionKey);
    } catch {
      // O botão de voltar continua disponível com o armazenamento bloqueado.
    }
  }

  function advance(step: ExpeditionStep, answer?: Answer) {
    if (participant) run(() => browserRoomStore().advance(participant.id, step, answer));
  }

  function renderScreen() {
    switch (screen.id) {
      case "start":
        return <Start onEnterAsStudent={() => goTo({ id: "entry" })} onEnterAsProfessor={() => goTo({ id: "professor-login" })} />;
      case "entry":
        return <ExpeditionEntry onBack={returnHome} onJoin={(code, name) => run(() => {
          // Testa a disponibilidade da sessão antes de criar o registro local.
          sessionStorage.setItem(participantSessionKey, "");
          const joined = browserRoomStore().joinRoom(code, name);
          sessionStorage.setItem(participantSessionKey, joined.id);
          goTo({ id: "student", participantId: joined.id });
        })} />;
      case "professor-login":
        return <ProfessorLogin onBackToStudent={returnHome} onLogin={() => goTo({ id: "dashboard" })} />;
      case "dashboard":
        return <ProfessorDashboard
          rooms={storage?.rooms().map((item) => ({ ...item, participantCount: storage.participants(item.code).length })) ?? []}
          onCreateRoom={() => goTo({ id: "create-room" })}
          onOpenRoom={(roomCode) => goTo({ id: "room", roomCode })}
          onBack={returnHome}
        />;
      case "create-room":
        return <ProfessorCreateRoom
          onBackToDashboard={() => goTo({ id: "dashboard" })}
          onRoomCreated={(name) => run(() => {
            const created = browserRoomStore().createRoom(name);
            goTo({ id: "room", roomCode: created.code, created: true });
          })}
        />;
      case "room":
        return room ? <ProfessorRoom
          room={room}
          participants={storage?.participants(room.code) ?? []}
          created={screen.created}
          onViewRoom={() => goTo({ id: "room", roomCode: room.code })}
          onStart={() => run(() => browserRoomStore().startRoom(room.code))}
          onBackToDashboard={() => goTo({ id: "dashboard" })}
        /> : <SessaoIndisponivel onBack={() => goTo({ id: "dashboard" })} />;
      case "student":
        if (!participant || !room) return <SessaoIndisponivel onBack={returnHome} />;
        if (!room.started) return <WaitingRoom
          participantName={participant.name}
          participantCount={storage?.participants(room.code).length ?? 0}
          roomCode={room.code}
          onBack={returnHome}
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
              studentName={participant.name} onContinue={(answer) => advance(participant.step, answer)} onFinish={returnHome} />;
        }
    }
  }

  let content;
  let readError = "";
  try {
    content = renderScreen();
  } catch {
    content = <SessaoIndisponivel onBack={returnHome} />;
    readError = "Os dados locais da expedição não puderam ser carregados.";
  }

  return <>
    {(error || readError || !storage) && <p className="app-error" role="alert">
      {error || readError || "Ative o armazenamento do navegador para participar de uma expedição."}
    </p>}
    {content}
  </>;
}

function readRoomState(screen: Screen) {
  try {
    const storage = browserRoomStore();
    const participant = screen.id === "student" ? storage.getParticipant(screen.participantId) : null;
    const room = screen.id === "room"
      ? storage.getRoom(screen.roomCode)
      : participant && storage.getRoom(participant.roomCode);
    return { storage, participant, room };
  } catch {
    return { storage: null, participant: null, room: null };
  }
}

export default App;
