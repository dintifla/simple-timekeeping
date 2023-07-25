import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { StartListModule } from './start-list/start-list.module';
import { TimekeepingModule } from './timekeeping/timekeeping.module';
import { EvaluationModule } from './evaluation/evaluation.module';

@NgModule({
  declarations: [AppComponent, SnackbarComponent],
  imports: [
    BrowserModule,
    FormsModule,
    StartListModule,
    TimekeepingModule,
    EvaluationModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
