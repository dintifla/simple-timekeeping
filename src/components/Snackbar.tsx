import { useEffect, useRef, useState } from "react";
import { useLatestMessage } from "../state/message-bus";

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

  return <div className={`snackbar${visible ? " show" : ""}`}>{latest.value}</div>;
}
