import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { StartListComponent } from './start-list/start-list.component';
import { ParticipantInputComponent } from './participant-input/participant-input.component';
import { AppComponent } from './app.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { AppRoutingModule } from './app-routing.module';
import { TimekeepingComponent } from './timekeeping/timekeeping.component';
import { EntryComponent } from './entry/entry.component';
import { FormatDateToTimeStringPipe } from './pipes/date-to-timestring.pipe';
import { StartCountdownComponent } from './start-countdown/start-countdown.component';
import { EvaluationComponent } from './evaluation/evaluation.component';

@NgModule({
  declarations: [
    AppComponent,
    StartListComponent,
    ParticipantInputComponent,
    SnackbarComponent,
    TimekeepingComponent,
    EntryComponent,
    FormatDateToTimeStringPipe,
    StartCountdownComponent,
    EvaluationComponent,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

