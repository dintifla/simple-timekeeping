import { Participant } from '../lib/participant';
import { messageBus } from '../state/message-bus';

/**
 * Start-list participant store. Mirrors the Angular start-list
 * ParticipantService: keeps the participant list in memory and syncs it with
 * localStorage under the `participants` key.
 */
class ParticipantStore {
  participants: Participant[] = [];

  private localStorageKey = 'participants';

  getParticipants(): Participant[] {
    this.participants = [];
    const value = localStorage.getItem(this.localStorageKey);
    if (!value) {
      console.error('Could not load participants from storage');
      return this.participants;
    }
    const participants: Participant[] = JSON.parse(value);
    if (!this.validate(participants)) {
      console.error('Could not parse participants');
      return [];
    }
    this.participants = participants.filter((p) => !p.isSpare);
    return this.participants;
  }

  async getParticipantsFromFile(file: File): Promise<Participant[]> {
    const text = await file.text();
    const participants: Participant[] = JSON.parse(text);
    if (!this.validate(participants)) {
      console.error('Could not parse participants');
      return [];
    }
    this.participants = participants.filter((p) => !p.isSpare);
    this.save();
    return this.participants;
  }

  private validate(participants: Participant[]): boolean {
    if (!(participants instanceof Array)) {
      this.log('participants is not an array');
      return false;
    }
    if (!participants.every((p) => 'numberPlate' in p && 'name' in p)) {
      this.log('Falsches Datenformat');
      return false;
    }
    return true;
  }

  getWithSpare(category: string): Participant[] {
    const SPARE_COUNT = 20;
    const withSpares = this.participants.map((p) => p);
    for (let i = 0; i < SPARE_COUNT; ++i) {
      withSpares.push({
        numberPlate: ParticipantStore.generateNumberPlate(withSpares),
        category: category,
        name: '',
        isSpare: true,
      });
    }
    return withSpares;
  }

  add(participant: Participant): Participant {
    participant.numberPlate = ParticipantStore.generateNumberPlate(
      this.participants,
    );
    this.participants.push(participant);
    this.save();
    return participant;
  }

  update(participant: Participant): void {
    const participantToUpdate = this.participants.find(
      (p) => p.numberPlate === participant.numberPlate,
    );
    if (participantToUpdate) {
      participantToUpdate.category = participant.category;
      participantToUpdate.isSpare = participant.isSpare;
      participantToUpdate.name = participant.name;
    }
    this.save();
  }

  delete(numberPlate: number): Participant | undefined {
    const participant = this.participants.find(
      (p) => p.numberPlate === numberPlate,
    );
    if (!participant) return undefined;

    this.participants.splice(this.participants.indexOf(participant), 1);
    this.save();
    return participant;
  }

  clear(): void {
    this.participants = [];
    localStorage.removeItem(this.localStorageKey);
  }

  private static generateNumberPlate(participants: Participant[]): number {
    return (
      participants
        .map((p) => p.numberPlate)
        .reduce((a, b) => Math.max(a, b), 0) + 1
    );
  }

  private save(): void {
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.participants),
    );
  }

  private log(message: string): void {
    messageBus.add(`ParticipantService: ${message}`);
  }
}

export const participantStore = new ParticipantStore();
