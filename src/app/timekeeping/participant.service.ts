import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { Participant } from '../participant';
import { MessageService } from '../message.service';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  constructor(private messageService: MessageService) {}

  participants: Participant[] = [];

  private localStorageKey = (location: string) =>  `measurement-${location}`;

  getEntries(location: string): Observable<Participant[]> {
    const value = localStorage.getItem(
      this.localStorageKey(location)
    );
    if (!value) {
      console.error('Could not load participants from storage');
      return of([]);
    }
    const participants: Participant[] = JSON.parse(value);
    if (!this.validate(participants)) {
      console.error('Could not parse participants');
      return of([]);
    }
    this.participants = participants;
    return of(this.participants);
  }

  getEntriesFromFile(file: File, location: string): Observable<Participant[]> {
    return from(
      file.text().then((text) => {
        const entries: Participant[] = JSON.parse(text);
        if (!this.validate(entries)) {
          console.error('Could not parse participants');
          return [];
        }
        this.save(location);
        this.participants = entries;
        return this.participants;
      })
    );
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

  add(participant: Participant, location: string): Observable<Participant> {
    this.participants.push(participant);
    this.save(location);
    return of(participant);
  }

  update(participant: Participant, location: string): Observable<unknown> {
    const participantToUpdate = this.participants.find(
      (p) => p.numberPlate === participant.numberPlate
    );
    if (participantToUpdate) {
      participantToUpdate.category = participant.category;
      participantToUpdate.isSpare = participant.isSpare;
      participantToUpdate.name = participant.name;
      participantToUpdate.time = participant.time;
    }
    this.save(location);
    return of(undefined);
  }

  clear(location: string): Observable<unknown> {
    this.participants = [];
    localStorage.removeItem(this.localStorageKey(location));
    return of(undefined);
  }

  private save(location: string): void {
    localStorage.setItem(
      this.localStorageKey(location),
      JSON.stringify(this.participants)
    );
  }

  private log(message: string): void {
    this.messageService.add(`ParticipantService: ${message}`);
  }
}

