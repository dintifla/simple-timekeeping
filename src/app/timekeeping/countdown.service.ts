import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CountdownService {
  started: EventEmitter<void> = new EventEmitter<void>();

  start(): void {
    this.started.emit();
  }
}
