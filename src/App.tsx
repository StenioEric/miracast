import { useState } from "react";

import { ExpeditionEntry } from "./pages/ExpeditionEntry/ExpeditionEntry";
import { Motivation } from "./pages/Motivation/Motivation";
import { Protocol } from "./pages/Protocol/Protocol";
import { WaitingRoom } from "./pages/WaitingRoom/WaitingRoom";
import { Start } from "./pages/Start/Start";

const ROOM_CODE = "ECY95R";

function App() {
  const [screen, setScreen] = useState<
    "start" | "entry" | "waiting" | "motivation" | "protocol"
  >(() =>
    (() => {
      const initialScreen = new URLSearchParams(window.location.search).get(
        "screen",
      );

      if (initialScreen === "motivacao") return "motivation";
      if (initialScreen === "protocolo") return "protocol";
      return "start";
    })(),
  );
  const [participantName, setParticipantName] = useState("");

  if (screen === "protocol") {
    return <Protocol />;
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

  return <Start onEnterAsStudent={() => setScreen("entry")} />;
}

export default App;
