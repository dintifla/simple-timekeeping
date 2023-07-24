import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { TimekeepingComponent } from './timekeeping/timekeeping.component';
import { FormatDateToTimeStringPipe } from './pipes/date-to-timestring.pipe';
import { StartCountdownComponent } from './start-countdown/start-countdown.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { StartListModule } from './start-list/start-list.module';

@NgModule({
  declarations: [
    AppComponent,
    SnackbarComponent,
    TimekeepingComponent,
    FormatDateToTimeStringPipe,
    StartCountdownComponent,
    EvaluationComponent,
  ],
  imports: [BrowserModule, FormsModule, StartListModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
