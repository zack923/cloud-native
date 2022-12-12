import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SettingsService} from '@delon/theme';
import { Observable } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

export const PageGuard: CanActivateFn = (_, state): boolean | Observable<boolean> => {
  const message = inject(NzMessageService)
  const userSrv = inject(SettingsService).user;
  /*if (userSrv.role != 'admin') {
    message.warning('You do not have enough permissions!',{nzDuration: 10000});
    return false;
  }*/
  return true;
};
