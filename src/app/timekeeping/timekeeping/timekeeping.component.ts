import { Component } from '@angular/core';
import { Participant } from '../../participant';
import { ParticipantService } from '../participant.service';
import { FileDownloader } from '../../file-downloader';
import { parseTime, roundTo100Ms } from '../../time';
import { CountdownService } from '../countdown.service';

@Component({
  selector: 'app-timekeeping',
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.css'],
})
export class TimekeepingComponent {
  constructor(
    private participantService: ParticipantService,
    private countdownService: CountdownService
  ) {}

  participants: Participant[] = [];

  location: string = 'Start';

  reset() {
    this.clearEntries();
    (<HTMLInputElement>document.getElementById('load-file')).value = '';
  }

  getEntries(): void {
    this.participantService
      .getEntries(this.location)
      .subscribe((entries) => (this.participants = entries));
  }

  loadFromFile(): void {
    this.clearEntries();
    const fileInput = <HTMLInputElement>document.getElementById('load-file');
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput.files.item(0);
      if (file)
        this.participantService
          .getEntriesFromFile(file, this.location)
          .subscribe((e) => (this.participants = e));
    }
  }

  private clearEntries(): void {
    this.participants = [];
  }

  exportMeasurements(): void {
    FileDownloader.exportAsJson(this.participants, `${this.location}_${Date.now()}.json`);
  }

  takeTime(participant: Participant): void {
    const timestamp = roundTo100Ms(new Date());
    participant.time = timestamp;
    this.save(participant);
    this.countdownService.start();
  }

  setManualTime(event: Event, participant: Participant): void {
    const value = (<HTMLInputElement>event.target).value;
    if (value) participant.time = parseTime(value);
    else participant.time = '';
    this.save(participant);
  }

  private save(participant: Participant): void {
    this.participantService.update(participant, this.location).subscribe();
  }
}
