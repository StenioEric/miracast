import { useState } from "react";

import { ExpeditionEntry } from "./pages/ExpeditionEntry/ExpeditionEntry";
import { Start } from "./pages/Start/Start";

function App() {
  const [showExpeditionEntry, setShowExpeditionEntry] = useState(false);

  return showExpeditionEntry ? (
    <ExpeditionEntry />
  ) : (
    <Start onEnterAsStudent={() => setShowExpeditionEntry(true)} />
  );
}

export default App;
