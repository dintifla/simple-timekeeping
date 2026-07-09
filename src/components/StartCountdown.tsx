import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { configuration } from "../lib/config";
import { useCountdownStart } from "../state/countdown-bus";

const BLINK_FOR_LAST_SECONDS = 5;

export function StartCountdown() {
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(0);
  const [blink, setBlink] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useCountdownStart(() => {
    const intervalTimeSeconds = configuration.startIntervalSeconds;
    if (intervalRef.current) clearInterval(intervalRef.current);
    let current = intervalTimeSeconds;
    setRemainingTimeSeconds(current);
    setBlink(current <= BLINK_FOR_LAST_SECONDS);
    intervalRef.current = setInterval(() => {
      current -= 1;
      if (current < 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        return;
      }
      setRemainingTimeSeconds(current);
      if (current <= BLINK_FOR_LAST_SECONDS) setBlink(true);
    }, 1000);
  });

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  return (
    <div
      role="timer"
      aria-live="assertive"
      aria-atomic="true"
      aria-label={
        remainingTimeSeconds
          ? `Nächster Start in ${remainingTimeSeconds} Sekunden`
          : "Kein Start geplant"
      }
      className={[
        "z-30 mx-auto mt-4 w-full max-w-[200px] rounded-xl border p-4 text-center shadow-card transition-colors sm:fixed sm:right-4 sm:top-24 sm:mt-0",
        blink
          ? "animate-pulse-urgent border-danger bg-danger text-danger-fg"
          : "border-border bg-surface text-text",
      ].join(" ")}
    >
      <p className="flex items-center justify-center gap-1.5 text-sm font-medium">
        {blink && <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
        Nächster Start in:
      </p>
      <div className="mt-1 text-5xl font-bold tabular-nums">
        {remainingTimeSeconds ? `${remainingTimeSeconds} s` : "---"}
      </div>
    </div>
  );
}
