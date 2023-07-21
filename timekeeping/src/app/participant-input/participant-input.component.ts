import { Component, Input } from '@angular/core';
import { Participant } from '../participant';
import { ParticipantService } from '../participant.service';
import { ConfigurationService } from '../configurationService';

@Component({
  selector: 'app-participant-input',
  templateUrl: './participant-input.component.html',
  styleUrls: ['./participant-input.component.css'],
})
export class ParticipantInputComponent {
  constructor(
    private participantService: ParticipantService,
    private configurationService: ConfigurationService
  ) {}

  @Input() participant?: Participant;

  categories: string[] = [];

  ngOnInit() {
    this.getCategories();
  }

  private getCategories(): void {
    this.configurationService
      .getConfig()
      .subscribe((c) => (this.categories = c.categories));
  }

  save(): void {
    this.participantService.update(this.participant!).subscribe();
  }
}

