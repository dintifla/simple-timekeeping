import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartListComponent } from './start-list/start-list.component';
import { TimekeepingComponent } from './timekeeping/timekeeping.component';
import { EvaluationComponent } from './evaluation/evaluation.component';

const routes: Routes = [
  { path: 'startlist', component: StartListComponent },
  { path: 'timekeeping', component: TimekeepingComponent },
  { path: 'evaluation', component: EvaluationComponent },
  { path: '', redirectTo: '/startlist', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

