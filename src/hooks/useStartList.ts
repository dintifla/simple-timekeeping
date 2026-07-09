import { useCallback, useState } from 'react';
import { Participant } from '../lib/participant';
import { FileDownloader } from '../lib/file-downloader';
import {
  generateNumberPlate,
  isParticipantList,
  withSpareParticipants,
} from '../lib/participants';
import { messageBus } from '../state/message-bus';

const STORAGE_KEY = 'participants';

function readFromStorage(): Participant[] {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return [];
  const parsed = JSON.parse(value);
  if (!isParticipantList(parsed)) {
    messageBus.add('Falsches Datenformat');
    return [];
  }
  return parsed.filter((p) => !p.isSpare);
}

function writeToStorage(participants: Participant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
}

/**
 * Owns the start-list participants and keeps them in sync with localStorage.
 * The returned state is the single source of truth for the component.
 */
export function useStartList() {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const commit = useCallback((next: Participant[]) => {
    writeToStorage(next);
    setParticipants(next);
  }, []);

  const load = useCallback(() => setParticipants(readFromStorage()), []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setParticipants([]);
  }, []);

  const loadFromFile = useCallback(async (file: File) => {
    const parsed = JSON.parse(await file.text());
    if (!isParticipantList(parsed)) {
      messageBus.add('Falsches Datenformat');
      setParticipants([]);
      return;
    }
    const loaded = parsed.filter((p) => !p.isSpare);
    writeToStorage(loaded);
    setParticipants(loaded);
  }, []);

  const addParticipant = useCallback(
    (category: string) => {
      commit([
        ...participants,
        { numberPlate: generateNumberPlate(participants), name: '', category },
      ]);
    },
    [participants, commit],
  );

  const updateParticipant = useCallback(
    (numberPlate: number, changes: Partial<Participant>) => {
      commit(
        participants.map((p) =>
          p.numberPlate === numberPlate ? { ...p, ...changes } : p,
        ),
      );
    },
    [participants, commit],
  );

  const exportList = useCallback(
    (category: string) => {
      FileDownloader.exportAsJson(
        withSpareParticipants(participants, category),
        `Startliste_${Date.now()}.json`,
      );
    },
    [participants],
  );

  return {
    participants,
    load,
    clear,
    loadFromFile,
    addParticipant,
    updateParticipant,
    exportList,
  };
}
