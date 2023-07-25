import { Injectable } from '@angular/core';
import { Participant } from './../participant';
import { Observable, from, of } from 'rxjs';
import { MessageService } from './../message.service';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  constructor(private messageService: MessageService) {}

  participants: Participant[] = [];

  private localStorageKey = 'participants';

  getParticipants(): Observable<Participant[]> {
    this.participants = [];
    const value = localStorage.getItem(this.localStorageKey);
    if (!value) {
      console.error('Could not load participants from storage');
      return of(this.participants);
    }
    const participants: Participant[] = JSON.parse(value);
    if (!this.validate(participants)) {
      console.error('Could not parse participants');
      return of([]);
    }
    this.participants = participants.filter((p) => !p.isSpare);
    return of(this.participants);
  }

  getParticipantsFromFile(file: File): Observable<Participant[]> {
    return from(
      file.text().then((text) => {
        const participants: Participant[] = JSON.parse(text);
        if (!this.validate(participants)) {
          console.error('Could not parse participants');
          return [];
        }
        this.participants = participants.filter((p) => !p.isSpare);
        this.save();
        return this.participants;
      })
    );
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

  getWithSpare(category: string): Observable<Participant[]> {
    const SPARE_COUNT = 20;
    const withSpares = this.participants.map((p) => p);
    for (let i = 0; i < SPARE_COUNT; ++i) {
      withSpares.push({
        numberPlate: ParticipantService.generateNumberPlate(withSpares),
        category: category,
        name: '',
        isSpare: true,
      });
    }
    return of(withSpares);
  }

  add(participant: Participant): Observable<Participant> {
    participant.numberPlate = ParticipantService.generateNumberPlate(
      this.participants
    );
    this.participants.push(participant);
    this.save();
    return of(participant);
  }

  update(participant: Participant): Observable<any> {
    let participantToUpdate = this.participants.find(
      (p) => p.numberPlate === participant.numberPlate
    );
    if (participantToUpdate) {
      participantToUpdate.category = participant.category;
      participantToUpdate.isSpare = participant.isSpare;
      participantToUpdate.name = participant.name;
    }
    this.save();
    return of(undefined);
  }

  delete(numberPlate: number): Observable<Participant | undefined> {
    const participant = this.participants.find(
      (p) => p.numberPlate === numberPlate
    );
    if (!participant) return of(undefined);

    this.participants.splice(this.participants.indexOf(participant), 1);
    this.save();
    return of(participant);
  }

  clear(): Observable<any> {
    this.participants = [];
    localStorage.removeItem(this.localStorageKey);
    return of(undefined);
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
      JSON.stringify(this.participants)
    );
  }

  private log(message: string): void {
    this.messageService.add(`ParticipantService: ${message}`);
  }
}
