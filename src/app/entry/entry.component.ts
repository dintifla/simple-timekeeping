import { Component, Input } from '@angular/core';
import { Participant } from '../participant';
import { parseTime, roundTo100Ms } from '../time';
import { EntryService } from '../entry.service';
import { CountdownService } from '../countdown.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css'],
})
export class EntryComponent {
  @Input() entry?: Participant;
  @Input() location?: string;

  constructor(
    private entryService: EntryService,
    private countdownService: CountdownService
  ) {}

  takeTime(): void {
    const timestamp = roundTo100Ms(new Date());
    this.entry!.time = timestamp;
    this.save();
    this.countdownService.start();
  }

  setManualTime(event: Event): void {
    const value = (<HTMLInputElement>event.target).value;
    if (value) this.entry!.time = parseTime(value);
    else this.entry!.time = '';
    this.save();
  }

  private save(): void {
    this.entryService.update(this.entry!, this.location!).subscribe();
  }
}

