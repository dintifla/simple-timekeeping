import { useEffect, useRef, useState } from 'react';
import { messageBus } from '../state/message-bus';

export function Snackbar() {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    const unsubscribe = messageBus.subscribe((m) => {
      setMessage(m);
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setMessage(undefined);
      }, 3000);
    });
    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div className={`snackbar${visible ? ' show' : ''}`}>{message}</div>
  );
}
