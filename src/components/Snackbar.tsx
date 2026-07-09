import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { MessageType, useLatestMessage } from "../state/message-bus";

const styles: Record<
  MessageType,
  { className: string; Icon: typeof Info; label: string }
> = {
  error: {
    className: "border-danger/40 bg-danger text-danger-fg",
    Icon: AlertCircle,
    label: "Fehler",
  },
  success: {
    className: "border-success/40 bg-success text-success-fg",
    Icon: CheckCircle2,
    label: "Erfolg",
  },
  info: {
    className: "border-border bg-surface text-text",
    Icon: Info,
    label: "Hinweis",
  },
};

export function Snackbar() {
  const latest = useLatestMessage();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!latest) return;
    setVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), 3000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [latest]);

  if (!latest || !visible) return null;

  const { className, Icon, label } = styles[latest.type];

  return (
    <div
      role={latest.type === "error" ? "alert" : "status"}
      aria-live={latest.type === "error" ? "assertive" : "polite"}
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        className={`pointer-events-auto flex max-w-md animate-slide-up items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-pop ${className}`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="sr-only">{label}: </span>
        <span>{latest.value}</span>
      </div>
    </div>
  );
}
