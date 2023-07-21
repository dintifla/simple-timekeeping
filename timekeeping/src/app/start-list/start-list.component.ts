import { Component } from '@angular/core';
import { Participant } from '../participant';
import { Configuration, ConfigurationService } from '../configurationService';
import { exportAsJson } from '../fileDownloader';
import { ParticipantService } from '../participant.service';
import { MessageService } from '../message.service';

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

  private _config?: Configuration;
  private _categories?: string[];

  participants: Participant[] = [];

  ngOnInit(): void {
    this.getConfig();
    this._categories = this._config?.categories;
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

  private getConfig(): void {
    this.configService
      .getConfig()
      .subscribe((config) => (this._config = config));
  }

  newParticipantList(): void {
    if (this.participants.length > 0) this.exportParticipants();
    this.clearParticipants();

    if (this._categories && this._categories.length <= 0) {
      this.log('Configuriere mindestens eine Kategorie');
      throw Error('no categories configured');
    }
  }

  private clearParticipants(): void {
    this.participants = [];
    this.participantService.clear().subscribe();
  }

  addParticipant(): void {
    this.participantService
      .add({ name: '', category: this._categories![0] } as Participant)
      .subscribe((participant) => {
        this.participants.push(participant);
      });
  }

  exportParticipants(): void {
    this.participantService
      .getWithSpare(this._categories![0])
      .subscribe((p) => exportAsJson(p, `Startliste_${Date.now()}.json`));
  }

  private log(message: string): void {
    this.messageService.add(`StartList: ${message}`);
  }
}

