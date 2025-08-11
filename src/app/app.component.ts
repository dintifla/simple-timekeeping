import { Component } from '@angular/core';
import { StartListComponent } from './start-list/start-list/start-list.component';
import { TimekeepingComponent } from './timekeeping/timekeeping/timekeeping.component';
import { EvaluationComponent } from './evaluation/evaluation/evaluation.component';
import { SnackbarComponent } from './snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    StartListComponent,
    TimekeepingComponent,
    EvaluationComponent,
    SnackbarComponent,
  ],
})
export class AppComponent {
  displayTarget = 'startlist';
}
