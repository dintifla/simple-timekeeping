import { Component } from '@angular/core';
import { Participant } from '../participant';
import { EntryService } from '../entry.service';
import { exportAsJson } from '../fileDownloader';
import { parseTime, roundTo100Ms } from '../time';
import { CountdownService } from '../countdown.service';

@Component({
  selector: 'app-timekeeping',
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.css'],
})
export class TimekeepingComponent {
  constructor(
    private entryService: EntryService,
    private countdownService: CountdownService
  ) {}

  entries: Participant[] = [];

  location: string = 'Start';

  reset() {
    this.clearEntries();
    (<HTMLInputElement>document.getElementById('load-file')).value = '';
  }

  getEntries(): void {
    this.entryService
      .getEntries(this.location)
      .subscribe((entries) => (this.entries = entries));
  }

  loadFromFile(): void {
    this.clearEntries();
    const fileInput = <HTMLInputElement>document.getElementById('load-file');
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput.files.item(0);
      if (file)
        this.entryService
          .getEntriesFromFile(file, this.location)
          .subscribe((e) => (this.entries = e));
    }
  }

  private clearEntries(): void {
    this.entries = [];
  }

  exportMeasurements(): void {
    exportAsJson(this.entries, `${this.location}_${Date.now()}.json`);
  }

  takeTime(entry: Participant): void {
    const timestamp = roundTo100Ms(new Date());
    entry!.time = timestamp;
    this.save(entry);
    this.countdownService.start();
  }

  setManualTime(event: Event, entry: Participant): void {
    const value = (<HTMLInputElement>event.target).value;
    if (value) entry!.time = parseTime(value);
    else entry!.time = '';
    this.save(entry);
  }

  private save(entry: Participant): void {
    this.entryService.update(entry!, this.location!).subscribe();
  }
}
