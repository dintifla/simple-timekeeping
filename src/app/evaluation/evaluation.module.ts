import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationComponent } from './evaluation/evaluation.component';

@NgModule({
  declarations: [EvaluationComponent],
  imports: [CommonModule],
  exports: [EvaluationComponent],
})
export class EvaluationModule {}
