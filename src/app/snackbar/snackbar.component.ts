import { Component } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
})
export class SnackbarComponent {
  message?: string;
  visible: boolean = false;

  show(message: string) {
    this.message = message;

    this.visible = true;
    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}

