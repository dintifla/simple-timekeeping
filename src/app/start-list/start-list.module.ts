import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartListComponent } from './start-list/start-list.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [StartListComponent],
  imports: [FormsModule, CommonModule],
  exports: [StartListComponent],
})
export class StartListModule {}
