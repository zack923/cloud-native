import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService, SocialService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { NzTabChangeEvent } from 'ng-zorro-antd/tabs';
import { finalize } from 'rxjs';
import {ACLService} from "@delon/acl";

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLoginComponent implements OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    private aclService: ACLService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    private http: _HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
  }

  // #region fields

  form = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.pattern(/^[\w]{5,12}$/)]],
    password: ['', [Validators.required, Validators.pattern(/^[\w]{5,12}$/)]],
  });
  error = '';
  type = 0;
  loading = false;

  // #region get captcha

  count = 0;
  interval$: any;

  // #endregion

  switch({ index }: NzTabChangeEvent): void {
    this.type = index!;
  }

  // #endregion

  submit(): void {
    this.error = '';
    if (this.type === 0) {
      const { userName, password } = this.form.controls;
      userName.markAsDirty();
      userName.updateValueAndValidity();
      password.markAsDirty();
      password.updateValueAndValidity();
      if (userName.invalid || password.invalid) {
        return;
      }
    }

    const data = new FormData();
    data.append('username', String(this.form.value.userName))
    data.append('password', String(this.form.value.password))

    console.info(data)

    this.loading = true;
    this.cdr.detectChanges();
    this.http
      .post(
        'https://prod-21.centralus.logic.azure.com:443/workflows/d7719650bfa64a468ab9930cb5598141/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dJKOCv-8rpz5jCmPGFhwQK3wmE8I01VbJw5pv0L8p8M',
        data,
        null,
        {
          context: new HttpContext().set(ALLOW_ANONYMOUS, true)
        }
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(res => {
        if (res.code == 400) {
          this.error = res.msg;
          this.cdr.detectChanges();
          return;
        }
        this.reuseTabService.clear();

        res[0].expired = + new Date() + 10000 * 60 * 5;
        this.tokenService.set(res[0]);

        this.startupSrv.load().subscribe(() => {
          this.settingsService.setUser(res[0])
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          this.router.navigateByUrl(url);
        });
      });
  }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
