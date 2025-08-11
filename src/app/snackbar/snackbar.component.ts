import { Component } from '@angular/core';
import { MessageService } from '../message.service';


@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
  imports: [],
})
export class SnackbarComponent {
  constructor(private messageService: MessageService) {}

  message?: string;
  visible = false;

  ngOnInit(): void {
    this.messageService.newLog.subscribe((m) => this.show(m));
  }

  show(message: string) {
    this.message = message;

    this.visible = true;
    setTimeout(() => {
      this.visible = false;
      this.message = undefined;
    }, 3000);
  }
}
