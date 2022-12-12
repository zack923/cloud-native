import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutPassportComponent } from '../../layout/passport/passport.component';
import { UserLoginComponent } from './login/login.component';
import { UserRegisterResultComponent } from './register-result/register-result.component';
import { UserRegisterComponent } from './register/register.component';

const routes: Routes = [
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: UserLoginComponent,
        data: { title: 'login' }
      },
      {
        path: 'register',
        component: UserRegisterComponent,
        data: { title: 'register' }
      },
      {
        path: 'register-result',
        component: UserRegisterResultComponent,
        data: { title: 'register' }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PassportRoutingModule {}
