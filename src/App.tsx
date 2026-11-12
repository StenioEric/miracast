import { useEffect, useState } from "react";

import { ExpeditionEntry } from "./pages/ExpeditionEntry/ExpeditionEntry";
import { Motivation } from "./pages/Motivation/Motivation";
import { Protocol } from "./pages/Protocol/Protocol";
import { Classification } from "./pages/Classification/Classification";
import { WaitingRoom } from "./pages/WaitingRoom/WaitingRoom";
import { Start } from "./pages/Start/Start";
import { ProfessorLogin } from "./pages/ProfessorLogin/ProfessorLogin";
import { ProfessorDashboard } from "./pages/ProfessorDashboard/ProfessorDashboard";

const ROOM_CODE = "ECY95R";

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
      return "start";
    })(),
  );
  const [participantName, setParticipantName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  if (screen === "professorDashboard") {
    return <ProfessorDashboard />;
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
