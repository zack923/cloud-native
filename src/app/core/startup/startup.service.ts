import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { MenuService, SettingsService, TitleService } from '@delon/theme';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, zip, catchError, map } from 'rxjs';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  load(): Observable<void> {
    return zip(this.httpClient.get('assets/tmp/app-data.json')).pipe(
      catchError(res => {
        console.warn(`StartupService.load: Network request failed`, res);
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        return [];
      }),
      map(([appData]: [NzSafeAny]) => {

        this.settingService.setApp(appData.app);

        this.menuService.add(appData.menu);

        this.titleService.default = '';
        this.titleService.suffix = appData.app.name;
      }),
    );
  }
}
