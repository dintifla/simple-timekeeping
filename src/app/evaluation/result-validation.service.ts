import { Injectable } from '@angular/core';
import { MessageService } from './../message.service';
import { Participant } from './../participant';

@Injectable({
  providedIn: 'root',
})
export class ResultValidationService {
  constructor(private messageService: MessageService) {}

  validate(starts: Participant[], finishes: Participant[]) {
    if (!(starts instanceof Array)) {
      this.messageService.add('Start file is not an array!');
      return false;
    }

    if (!(finishes instanceof Array)) {
      this.messageService.add('Finish file is not an array!');
      return false;
    }
    if (!starts.every((p) => 'numberPlate' in p && 'name' in p)) {
      this.messageService.add('Start file has wrong format!');
      return false;
    }

    if (!finishes.every((p) => 'numberPlate' in p && 'name' in p)) {
      this.messageService.add('Finish file has wrong format!');
      return false;
    }

    if (
      Math.min(
        ...starts
          .map((x) => x.time)
          .filter((x): x is string => !!x)
          .map((x) => Date.parse(x)),
      ) >
      Math.min(
        ...finishes
          .map((x) => x.time)
          .filter((x): x is string => !!x)
          .map((x) => Date.parse(x)),
      )
    ) {
      this.messageService.add('Start und Finish file are reversed!');
      return false;
    }
    return true;
  }
}
