import { Component } from '@angular/core';
import { Participant } from '../../participant';
import { ConfigurationService } from '../../configuration-service';
import { FileDownloader } from '../../file-downloader';
import { ParticipantService } from '../participant.service';
import { MessageService } from '../../message.service';

@Component({
  selector: 'app-start-list',
  templateUrl: './start-list.component.html',
  styleUrls: ['./start-list.component.css'],
})
export class StartListComponent {
  constructor(
    private configService: ConfigurationService,
    private participantService: ParticipantService,
    private messageService: MessageService
  ) {}

  title = 'timekeeping';

  participants: Participant[] = [];
  categories: string[] = [];

  ngOnInit(): void {
    this.getCategories();
  }

  getParticipants(): void {
    this.participantService
      .getParticipants()
      .subscribe((participants) => (this.participants = participants));
  }

  loadFromFile(): void {
    this.clearParticipants();
    const fileInput = <HTMLInputElement>document.getElementById('load-file');
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput.files.item(0);
      if (file)
        this.participantService
          .getParticipantsFromFile(file)
          .subscribe((p) => (this.participants = p));
    }
  }

  private getCategories(): void {
    this.configService
      .getConfig()
      .subscribe((c) => (this.categories = c.categories));
  }

  newParticipantList(): void {
    if (this.participants.length > 0) this.exportParticipants();
    this.clearParticipants();

    if (this.categories && this.categories.length <= 0) {
      this.log('Configuriere mindestens eine Kategorie');
      throw Error('no categories configured');
    }
    this.participantService
      .getParticipants()
      .subscribe((p) => (this.participants = p));
  }

  private clearParticipants(): void {
    this.participants = [];
    this.participantService.clear().subscribe();
  }

  addParticipant(): void {
    this.participantService
      .add({ name: '', category: this.categories[0] } as Participant)
      .subscribe();
  }

  exportParticipants(): void {
    this.participantService
      .getWithSpare(this.categories[0])
      .subscribe((p) =>
        FileDownloader.exportAsJson(p, `Startliste_${Date.now()}.json`)
      );
  }

  save(participant: Participant): void {
    this.participantService.update(participant!).subscribe();
  }

  private log(message: string): void {
    this.messageService.add(`StartList: ${message}`);
  }
}
