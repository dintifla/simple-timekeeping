import { Component } from '@angular/core';
import { Participant } from '../participant';
import { EntryService } from '../entry.service';
import { exportAsJson } from '../fileDownloader';

@Component({
  selector: 'app-timekeeping',
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.css'],
})
export class TimekeepingComponent {
  constructor(private entryService: EntryService) {}

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
    this.setCountdown();
    const fileInput = <HTMLInputElement>document.getElementById('load-file');
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput.files.item(0);
      if (file)
        this.entryService
          .getEntriesFromFile(file, this.location)
          .subscribe((e) => (this.entries = e));
    }
  }

  private setCountdown(): void {}

  private clearEntries(): void {
    this.entries = [];
    this.entryService.clear(this.location).subscribe();
  }

  exportMeasurements(): void {
    exportAsJson(this.entries, `${this.location}_${Date.now()}.json`);
  }
}

