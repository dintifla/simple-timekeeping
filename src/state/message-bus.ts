type Listener = (message: string) => void;

/**
 * Singleton message bus. Mirrors the Angular MessageService: keeps a log of
 * messages and notifies subscribers (e.g. the Snackbar) of new entries.
 */
class MessageBus {
  logs: string[] = [];
  private listeners = new Set<Listener>();

  add(message: string): void {
    this.logs.push(message);
    this.listeners.forEach((listener) => listener(message));
    console.error(message);
  }

  clear(): void {
    this.logs = [];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const messageBus = new MessageBus();
