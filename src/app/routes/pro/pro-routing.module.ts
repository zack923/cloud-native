import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProAccountCenterArticlesComponent } from './account/center/reviews/reviews.component';
import { ProAccountCenterComponent } from './account/center/center.component';
import { ProAccountCenterProjectsComponent } from './account/center/collections/collections.component';
import { ProDinosaurListComponent} from './list/dinosaurList/dinosaurList.component';
import {PageGuard} from "@core";
import {ProUserDetailCollectionsComponent} from "./userDetail/collections/userCollections.component";
import {ProUserDetailComponent} from "./userDetail/userDetail.component";

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
  },
  {
    path: 'userDetail',
    component: ProUserDetailComponent,
    children: [
      { path: '', redirectTo: 'collections', pathMatch: 'full' },
      {
        path: 'collections',
        component: ProUserDetailCollectionsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProRoutingModule {}
