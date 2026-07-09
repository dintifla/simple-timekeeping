type Listener = () => void;

/**
 * Singleton countdown bus. Mirrors the Angular CountdownService: components
 * (Timekeeping) trigger `start()` and subscribers (StartCountdown) react.
 */
class CountdownBus {
  private listeners = new Set<Listener>();

  start(): void {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const countdownBus = new CountdownBus();
