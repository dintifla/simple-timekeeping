import { Component } from '@angular/core';
import { Participant } from '../../participant';
import { ParticipantService } from '../participant.service';
import { FileDownloader } from '../../file-downloader';
import { parseTime, roundTo100Ms } from '../../time';
import { CountdownService } from '../countdown.service';
import { ConfigurationService } from 'src/app/configuration-service';
import { FormsModule } from '@angular/forms';
import { StartCountdownComponent } from '../start-countdown/start-countdown.component';
import { FormatDateToTimeStringPipe } from '../pipes/date-to-timestring.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timekeeping',
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.css'],
  imports: [
    FormsModule,
    StartCountdownComponent,
    FormatDateToTimeStringPipe,
    CommonModule,
  ],
})
export class TimekeepingComponent {
  constructor(
    private participantService: ParticipantService,
    private countdownService: CountdownService,
    private configService: ConfigurationService,
  ) {}

  participants: Participant[] = [];
  categories: string[] = [];
  location = 'Start';

  ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.configService
      .getConfig()
      .subscribe((c) => (this.categories = c.categories));
  }

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
    FileDownloader.exportAsJson(
      this.participants,
      `${this.location}_${Date.now()}.json`,
    );
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

  save(participant: Participant): void {
    this.participantService.update(participant, this.location).subscribe();
  }

  nameEditIsEnabled(participant: Participant) {
    if (this.location !== 'Start') return false;
    return participant.isSpare != undefined && participant.isSpare === true;
  }
}
