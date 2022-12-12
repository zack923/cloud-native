import { NgModule } from '@angular/core';
import { AvatarListModule } from '@delon/abc/avatar-list';
import { EllipsisModule } from '@delon/abc/ellipsis';
import { FooterToolbarModule } from '@delon/abc/footer-toolbar';
import { TagSelectModule } from '@delon/abc/tag-select';
import { CurrencyPipeModule } from '@delon/util/pipes/currency';
import { SharedModule } from '@shared';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { ProAccountCenterArticlesComponent } from './account/center/reviews/reviews.component';
import { ProAccountCenterComponent } from './account/center/center.component';
import { ProAccountCenterProjectsComponent } from './account/center/collections/collections.component';
import { ProDinosaurListComponent } from './list/dinosaurList/dinosaurList.component';
import { ProRoutingModule } from './pro-routing.module';
import {AddComponent} from "./list/dinosaurList/add/add.component";
import {EditComponent} from "./list/dinosaurList/edit/edit.component";
import {ProUserDetailComponent} from "./userDetail/userDetail.component";
import {ProUserDetailCollectionsComponent} from "./userDetail/collections/userCollections.component";

const COMPONENTS = [
  ProDinosaurListComponent,
  AddComponent,
  EditComponent,
  ProAccountCenterComponent,
  ProAccountCenterArticlesComponent,
  ProAccountCenterProjectsComponent,
  ProUserDetailComponent,
  ProUserDetailCollectionsComponent
];

@NgModule({
  imports: [
    SharedModule,
    ProRoutingModule,
    EllipsisModule,
    TagSelectModule,
    AvatarListModule,
    FooterToolbarModule,
    NzPaginationModule,
    NzStepsModule,
    CurrencyPipeModule
  ],
  declarations: COMPONENTS
})
export class ProModule {}
