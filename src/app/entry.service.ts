import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { Participant } from './participant';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class EntryService {
  constructor(private messageService: MessageService) {}

  entries: Participant[] = [];

  private localStorageKeyPrefix = 'measurement';

  getEntries(location: string): Observable<Participant[]> {
    const value = localStorage.getItem(
      `${this.localStorageKeyPrefix}-${location}`
    );
    if (!value) {
      console.error('Could not load participants from storage');
      return of([]);
    }
    const entries: Participant[] = JSON.parse(value);
    if (!this.validate(entries)) {
      console.error('Could not parse participants');
      return of([]);
    }
    this.entries = entries;
    return of(this.entries);
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
        this.entries = entries;
        return this.entries;
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

  add(entry: Participant, location: string): Observable<Participant> {
    this.entries.push(entry);
    this.save(location);
    return of(entry);
  }

  update(entry: Participant, location: string): Observable<any> {
    let entryToUpdate = this.entries.find(
      (p) => p.numberPlate === entry.numberPlate
    );
    if (entryToUpdate) {
      entryToUpdate.category = entry.category;
      entryToUpdate.isSpare = entry.isSpare;
      entryToUpdate.name = entry.name;
      entryToUpdate.time = entry.time;
    }
    this.save(location);
    return of(undefined);
  }

  clear(location: string): Observable<any> {
    this.entries = [];
    localStorage.removeItem(`${this.localStorageKeyPrefix}-${location}`);
    return of(undefined);
  }

  private save(location: string): void {
    localStorage.setItem(
      `${this.localStorageKeyPrefix}-${location}`,
      JSON.stringify(this.entries)
    );
  }

  private log(message: string): void {
    this.messageService.add(`EntryService: ${message}`);
  }
}

