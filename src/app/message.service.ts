import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  logs: string[] = [];

  newLog: EventEmitter<string> = new EventEmitter<string>();

  add(message: string): void {
    this.logs.push(message);
    this.newLog.emit(message);
    console.error(message);
  }

  clear(): void {
    this.logs = [];
  }
}

