import { useEffect, useRef, useState } from 'react';
import { getConfig } from '../lib/config';
import { countdownBus } from '../state/countdown-bus';

const BLINK_FOR_LAST_SECONDS = 5;

export function StartCountdown() {
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(0);
  const [blink, setBlink] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    const intervalTimeSeconds = getConfig().startIntervalSeconds;

    const start = () => {
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
    };

    const unsubscribe = countdownBus.subscribe(start);
    return () => {
      unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className={`start-countdown${blink ? ' blink' : ''}`}>
      <p>Nächster Start in:</p>
      <div className="start-countdown-time">
        {remainingTimeSeconds ? `${remainingTimeSeconds} s` : '---'}
      </div>
    </div>
  );
}
