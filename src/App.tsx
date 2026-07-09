import { useState } from "react";
import { Flag, ListOrdered, Timer } from "lucide-react";
import { StartList } from "./components/StartList";
import { Timekeeping } from "./components/Timekeeping";
import { Evaluation } from "./components/Evaluation";
import { Snackbar } from "./components/Snackbar";
import { ThemeToggle } from "./components/ThemeToggle";

type DisplayTarget = "startlist" | "timekeeping" | "evaluation";

const tabs: { id: DisplayTarget; label: string; icon: typeof Flag }[] = [
  { id: "startlist", label: "Startliste", icon: ListOrdered },
  { id: "timekeeping", label: "Zeitmessung", icon: Timer },
  { id: "evaluation", label: "Auswertung", icon: Flag },
];

export function App() {
  const [displayTarget, setDisplayTarget] =
    useState<DisplayTarget>("startlist");

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-base font-bold tracking-tight">
              Zeitmessung
            </span>
          </div>
          <ThemeToggle />
        </div>
        <nav
          aria-label="Hauptnavigation"
          className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = displayTarget === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setDisplayTarget(id)}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-fg shadow-card"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {displayTarget === "startlist" && <StartList />}
        {displayTarget === "timekeeping" && <Timekeeping />}
        {displayTarget === "evaluation" && <Evaluation />}
      </main>

      <Snackbar />
    </div>
  );
}
