import { useState } from "react";

import { ExpeditionEntry } from "./pages/ExpeditionEntry/ExpeditionEntry";
import { WaitingRoom } from "./pages/WaitingRoom/WaitingRoom";
import { Start } from "./pages/Start/Start";

const ROOM_CODE = "ECY95R";

function App() {
  const [screen, setScreen] = useState<"start" | "entry" | "waiting">(
    "start",
  );
  const [participantName, setParticipantName] = useState("");

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
