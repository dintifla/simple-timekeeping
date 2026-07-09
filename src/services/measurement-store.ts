import { Participant } from '../lib/participant';
import { messageBus } from '../state/message-bus';

/**
 * Timekeeping measurement store. Mirrors the Angular timekeeping
 * ParticipantService: keeps entries in memory and syncs them with localStorage
 * under the `measurement-<location>` key.
 */
class MeasurementStore {
  participants: Participant[] = [];

  private localStorageKey = (location: string) => `measurement-${location}`;

  getEntries(location: string): Participant[] {
    const value = localStorage.getItem(this.localStorageKey(location));
    if (!value) {
      console.error('Could not load participants from storage');
      return [];
    }
    const participants: Participant[] = JSON.parse(value);
    if (!this.validate(participants)) {
      console.error('Could not parse participants');
      return [];
    }
    this.participants = participants;
    return this.participants;
  }

  async getEntriesFromFile(
    file: File,
    location: string,
  ): Promise<Participant[]> {
    const text = await file.text();
    const entries: Participant[] = JSON.parse(text);
    if (!this.validate(entries)) {
      console.error('Could not parse participants');
      return [];
    }
    this.save(location);
    this.participants = entries;
    return this.participants;
  }

  private validate(entries: Participant[]): boolean {
    if (!(entries instanceof Array)) {
      this.log('participants is not an array');
      return false;
    }
    if (!entries.every((p) => 'numberPlate' in p && 'name' in p)) {
      this.log('Falsches Datenformat');
      return false;
    }
    return true;
  }

  add(participant: Participant, location: string): Participant {
    this.participants.push(participant);
    this.save(location);
    return participant;
  }

  update(participant: Participant, location: string): void {
    const participantToUpdate = this.participants.find(
      (p) => p.numberPlate === participant.numberPlate,
    );
    if (participantToUpdate) {
      participantToUpdate.category = participant.category;
      participantToUpdate.isSpare = participant.isSpare;
      participantToUpdate.name = participant.name;
      participantToUpdate.time = participant.time;
    }
    this.save(location);
  }

  clear(location: string): void {
    this.participants = [];
    localStorage.removeItem(this.localStorageKey(location));
  }

  private save(location: string): void {
    localStorage.setItem(
      this.localStorageKey(location),
      JSON.stringify(this.participants),
    );
  }

  private log(message: string): void {
    messageBus.add(`ParticipantService: ${message}`);
  }
}

export const measurementStore = new MeasurementStore();
