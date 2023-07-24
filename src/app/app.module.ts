import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { StartListModule } from './start-list/start-list.module';
import { TimekeepingModule } from './timekeeping/timekeeping.module';

@NgModule({
  declarations: [
    AppComponent,
    SnackbarComponent,
    EvaluationComponent,
  ],
  imports: [BrowserModule, FormsModule, StartListModule, TimekeepingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
