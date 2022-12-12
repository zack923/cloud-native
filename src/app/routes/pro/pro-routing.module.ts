import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProAccountCenterArticlesComponent } from './account/center/reviews/reviews.component';
import { ProAccountCenterComponent } from './account/center/center.component';
import { ProAccountCenterProjectsComponent } from './account/center/collections/collections.component';
import { ProDinosaurListComponent} from './list/dinosaurList/dinosaurList.component';
import {PageGuard} from "@core";

const routes: Routes = [
  {
    path: 'list',
    canActivate: [PageGuard],
    children: [
      { path: 'dinosaurList', component: ProDinosaurListComponent }
    ]
  },
  {
    path: 'account',
    children: [
      {
        path: 'center',
        component: ProAccountCenterComponent,
        children: [
          { path: '', redirectTo: 'reviews', pathMatch: 'full' },
          {
            path: 'reviews',
            component: ProAccountCenterArticlesComponent,
            data: { titleI18n: 'pro-account-center' }
          },
          {
            path: 'collections',
            component: ProAccountCenterProjectsComponent,
            data: { titleI18n: 'pro-account-center' }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProRoutingModule {}
