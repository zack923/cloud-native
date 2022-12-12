import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, User } from '@delon/theme';

@Component({
  selector: 'header-user',
  template: `
    <div class="alain-default__nav-item d-flex align-items-center px-sm" nzPlacement="bottomRight">
      <i nz-i con nzType="logout" class="mr-sm" (click)="logout()">{{ 'Logout' }}</i>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderUserComponent {
  get user(): User {
    return this.settings.user;
  }

  constructor(private settings: SettingsService, private router: Router, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {}

  logout(): void {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
  }
}
