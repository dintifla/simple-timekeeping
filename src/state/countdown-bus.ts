import { useEffect, useRef } from 'react';

type Listener = () => void;

/**
 * External event emitter for countdown starts. Mirrors the Angular
 * CountdownService: producers (Timekeeping) call the imperative
 * `countdownBus.start()`, while React consumers subscribe declaratively with
 * the `useCountdownStart` hook.
 */
class CountdownBus {
  private listeners = new Set<Listener>();

  start = (): void => {
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

export const countdownBus = new CountdownBus();

/**
 * Run `handler` whenever a countdown start is triggered. The handler is kept in
 * a ref so the subscription stays stable across renders while always calling
 * the latest closure.
 */
export function useCountdownStart(handler: () => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => countdownBus.subscribe(() => handlerRef.current()), []);
}
