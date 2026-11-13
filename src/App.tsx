import { useEffect, useState } from "react";

import { ExpeditionEntry } from "./pages/ExpeditionEntry/ExpeditionEntry";
import { Motivation } from "./pages/Motivation/Motivation";
import { Protocol } from "./pages/Protocol/Protocol";
import { Classification } from "./pages/Classification/Classification";
import { WaitingRoom } from "./pages/WaitingRoom/WaitingRoom";
import { Start } from "./pages/Start/Start";
import { ProfessorLogin } from "./pages/ProfessorLogin/ProfessorLogin";
import { ProfessorDashboard } from "./pages/ProfessorDashboard/ProfessorDashboard";
import { ProfessorCreateRoom } from "./pages/ProfessorCreateRoom/ProfessorCreateRoom";
import { ProfessorRoom } from "./pages/ProfessorRoom/ProfessorRoom";

const ROOM_CODE = "ECY95R";
const DEFAULT_TEACHER_ROOM = {
  name: "Estereoquímica - Turma A",
  code: "ABC123",
  students: [
    { name: "João Silva", score: 80 },
    { name: "Maria Santos", score: 95 },
    { name: "Pedro Oliveira", score: 60 },
  ],
};

function App() {
  const [screen, setScreen] = useState<
    | "start"
    | "entry"
    | "waiting"
    | "motivation"
    | "protocol"
    | "classification"
    | "professorLogin"
    | "professorDashboard"
    | "professorCreateRoom"
    | "professorRoom"
  >(() =>
    (() => {
      const initialScreen = new URLSearchParams(window.location.search).get(
        "screen",
      );

      if (initialScreen === "motivacao") return "motivation";
      if (initialScreen === "protocolo") return "protocol";
      if (initialScreen === "classificacao") return "classification";
      if (initialScreen === "professor-login") return "professorLogin";
      if (initialScreen === "professor-dashboard") return "professorDashboard";
      if (initialScreen === "professor-criar-sala") return "professorCreateRoom";
      if (initialScreen === "professor-sala") return "professorRoom";
      return "start";
    })(),
  );
  const [participantName, setParticipantName] = useState("");
  const [createdTeacherRoom, setCreatedTeacherRoom] = useState<{
    name: string;
    code: string;
    students: { name: string; score: number }[];
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  if (screen === "professorCreateRoom") {
    return (
      <ProfessorCreateRoom
        onBackToDashboard={() => setScreen("professorDashboard")}
        onRoomCreated={(name, code) =>
          setCreatedTeacherRoom({ name, code, students: [] })
        }
      />
    );
  }

  if (screen === "professorRoom") {
    return (
      <ProfessorRoom
        room={createdTeacherRoom ?? DEFAULT_TEACHER_ROOM}
        onBackToDashboard={() => setScreen("professorDashboard")}
      />
    );
  }

  if (screen === "professorDashboard") {
    return (
      <ProfessorDashboard
        room={createdTeacherRoom ?? DEFAULT_TEACHER_ROOM}
        onCreateRoom={() => setScreen("professorCreateRoom")}
        onOpenRoom={() => setScreen("professorRoom")}
      />
    );
  }

  if (screen === "professorLogin") {
    return (
      <ProfessorLogin
        onBackToStudent={() => setScreen("start")}
        onLogin={() => setScreen("professorDashboard")}
      />
    );
  }

  if (screen === "classification") {
    return <Classification />;
  }

  if (screen === "protocol") {
    return <Protocol onStartPhase1={() => setScreen("classification")} />;
  }

  if (screen === "motivation") {
    return <Motivation onStartProtocol={() => setScreen("protocol")} />;
  }

  if (screen === "waiting") {
    return (
      <WaitingRoom participantName={participantName} roomCode={ROOM_CODE} />
    );
  }

  if (screen === "entry") {
    return (
      <ExpeditionEntry
        roomCode={ROOM_CODE}
        onSubmitName={(name) => {
          setParticipantName(name);
          setScreen("waiting");
        }}
      />
    );
  }

  return (
    <Start
      onEnterAsStudent={() => setScreen("entry")}
      onEnterAsProfessor={() => setScreen("professorLogin")}
    />
  );
}

export default App;
