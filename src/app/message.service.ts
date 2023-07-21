import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  logs: string[] = [];

  add(message: string): void {
    this.logs.push(message);
    console.error(message);
  }

  clear(): void {
    this.logs = [];
  }
}

