import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProListProjectsComponent } from './projects/projects.component';
import {ProDetailsComponent} from "./details/details.component";

const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: 'projects', component: ProListProjectsComponent },
  { path: 'details', component: ProDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
