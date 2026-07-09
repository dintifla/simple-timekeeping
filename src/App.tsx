import { useState } from "react";
import { StartList } from "./components/StartList";
import { Timekeeping } from "./components/Timekeeping";
import { Evaluation } from "./components/Evaluation";
import { Snackbar } from "./components/Snackbar";

type DisplayTarget = "startlist" | "timekeeping" | "evaluation";

export function App() {
  const [displayTarget, setDisplayTarget] =
    useState<DisplayTarget>("startlist");

  return (
    <>
      <nav>
        <button
          className="big-button"
          onClick={() => setDisplayTarget("startlist")}
        >
          Startliste
        </button>
        <button
          className="big-button"
          onClick={() => setDisplayTarget("timekeeping")}
        >
          Zeitmessung
        </button>
        <button
          className="big-button"
          onClick={() => setDisplayTarget("evaluation")}
        >
          Auswertung
        </button>
      </nav>

      {displayTarget === "startlist" && <StartList />}
      {displayTarget === "timekeeping" && <Timekeeping />}
      {displayTarget === "evaluation" && <Evaluation />}

      <Snackbar />
    </>
  );
}
