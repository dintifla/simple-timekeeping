import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  displayTarget: string = 'startlist';

  showStartList(): void {
    this.displayTarget = 'startlist';
  }

  showTimekeeping(): void {
    this.displayTarget = 'timekeeping';
  }

  showEvaluation(): void {
    this.displayTarget = 'evaluation';
  }
}
