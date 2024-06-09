import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatDateToTimeStringPipe } from './pipes/date-to-timestring.pipe';
import { StartCountdownComponent } from './start-countdown/start-countdown.component';
import { TimekeepingComponent } from './timekeeping/timekeeping.component';

@NgModule({
  declarations: [
    TimekeepingComponent,
    StartCountdownComponent,
    FormatDateToTimeStringPipe,
  ],
  imports: [FormsModule, CommonModule],
  exports: [TimekeepingComponent],
})
export class TimekeepingModule {}
