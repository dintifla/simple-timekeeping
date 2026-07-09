import { useCallback, useEffect, useState } from 'react';
import { Participant } from '../lib/participant';
import { FileDownloader } from '../lib/file-downloader';
import { isParticipantList } from '../lib/participants';
import { messageBus } from '../state/message-bus';

const storageKey = (location: string) => `measurement-${location}`;

function readFromStorage(location: string): Participant[] {
  const value = localStorage.getItem(storageKey(location));
  if (!value) return [];
  const parsed = JSON.parse(value);
  if (!isParticipantList(parsed)) {
    messageBus.add('Falsches Datenformat');
    return [];
  }
  return parsed;
}

function writeToStorage(location: string, entries: Participant[]): void {
  localStorage.setItem(storageKey(location), JSON.stringify(entries));
}

/**
 * Owns the timekeeping entries for the given measurement location and keeps
 * them in sync with localStorage. Switching location clears the display.
 */
export function useMeasurements(location: string) {
  const [entries, setEntries] = useState<Participant[]>([]);

  // Changing the measurement location starts from a clean slate.
  useEffect(() => setEntries([]), [location]);

  const commit = useCallback(
    (next: Participant[]) => {
      writeToStorage(location, next);
      setEntries(next);
    },
    [location],
  );

  const load = useCallback(
    () => setEntries(readFromStorage(location)),
    [location],
  );

  const loadFromFile = useCallback(
    async (file: File) => {
      const parsed = JSON.parse(await file.text());
      if (!isParticipantList(parsed)) {
        messageBus.add('Falsches Datenformat');
        setEntries([]);
        return;
      }
      writeToStorage(location, parsed);
      setEntries(parsed);
    },
    [location],
  );

  const updateEntry = useCallback(
    (numberPlate: number, changes: Partial<Participant>) => {
      commit(
        entries.map((p) =>
          p.numberPlate === numberPlate ? { ...p, ...changes } : p,
        ),
      );
    },
    [entries, commit],
  );

  const exportEntries = useCallback(() => {
    FileDownloader.exportAsJson(entries, `${location}_${Date.now()}.json`);
  }, [entries, location]);

  return { entries, load, loadFromFile, updateEntry, exportEntries };
}
