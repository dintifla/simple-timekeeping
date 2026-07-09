import { useSyncExternalStore } from 'react';

type Listener = () => void;

export interface Message {
  /** The message text. */
  value: string;
  /**
   * A monotonically increasing id. It changes on every `add` even when the
   * text is identical, so consumers (e.g. the Snackbar) can re-trigger their
   * show/hide animation for repeated messages.
   */
  id: number;
}

/**
 * External store for user-facing messages. Mirrors the Angular MessageService,
 * but follows the React "external store + useSyncExternalStore" pattern:
 *
 * - React components subscribe through the `useMessages` / `useLatestMessage`
 *   hooks exported below.
 * - Plain (non-React) modules such as the stores and result validation call
 *   the imperative `messageBus.add()` API.
 */
class MessageStore {
  private logs: string[] = [];
  private latest: Message | null = null;
  private nextId = 0;
  private listeners = new Set<Listener>();

  add = (message: string): void => {
    this.logs = [...this.logs, message];
    this.latest = { value: message, id: this.nextId++ };
    console.error(message);
    this.emit();
  };

  clear = (): void => {
    this.logs = [];
    this.latest = null;
    this.emit();
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getMessages = (): string[] => this.logs;

  getLatest = (): Message | null => this.latest;

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const messageBus = new MessageStore();

/** Subscribe a component to the full message log. */
export function useMessages(): string[] {
  return useSyncExternalStore(messageBus.subscribe, messageBus.getMessages);
}

/** Subscribe a component to the most recently added message (or null). */
export function useLatestMessage(): Message | null {
  return useSyncExternalStore(messageBus.subscribe, messageBus.getLatest);
}
