import { useSyncExternalStore } from 'react';

export type MessageType = 'error' | 'success' | 'info';

export interface Message {
  /** The message text. */
  value: string;
  /** Severity, used by the Snackbar for styling and aria-live politeness. */
  type: MessageType;
  /**
   * A monotonically increasing id. It changes on every `add` even when the
   * text is identical, so consumers (e.g. the Snackbar) can re-trigger their
   * show/hide animation for repeated messages.
   */
  id: number;
}

type Listener = () => void;

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

  add = (message: string, type: MessageType = 'error'): void => {
    this.logs = [...this.logs, message];
    this.latest = { value: message, type, id: this.nextId++ };
    if (type === 'error') console.error(message);
    else console.log(message);
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
