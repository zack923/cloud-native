import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ALLOW_ANONYMOUS } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { MatchControl } from '@delon/util/form';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'passport-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRegisterComponent implements OnDestroy {
  constructor(private fb: FormBuilder, private router: Router, private http: _HttpClient, private cdr: ChangeDetectorRef) {}

  // #region fields

  form = this.fb.nonNullable.group(
    {
      mail: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(12)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(12), UserRegisterComponent.checkPassword.bind(this)]],
      confirm: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(12)]],
    },
    {
      validators: MatchControl('password', 'confirm')
    }
  );
  error = '';
  type = 0;
  loading = false;
  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap: { [key: string]: 'success' | 'normal' | 'exception' } = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception'
  };

  // #endregion

  // #region get captcha

  count = 0;
  interval$: NzSafeAny;

  static checkPassword(control: FormControl): NzSafeAny {
    if (!control) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: NzSafeAny = this;
    self.visible = !!control.value;
    if (control.value && control.value.length > 9) {
      self.status = 'ok';
    } else if (control.value && control.value.length > 5) {
      self.status = 'pass';
    } else {
      self.status = 'pool';
    }

    if (self.visible) {
      self.progress = control.value.length * 10 > 100 ? 100 : control.value.length * 10;
    }
  }

  // #endregion

  submit(): void {
    this.error = '';
    Object.keys(this.form.controls).forEach(key => {
      const control = (this.form.controls as NzSafeAny)[key] as AbstractControl;
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }

    const data = new FormData();
    data.append('username',String(this.form.value.userName));
    data.append('email',String(this.form.value.mail));
    data.append('password',String(this.form.value.password));
    data.append('confirm',String(this.form.value.confirm));
    this.loading = true;
    this.cdr.detectChanges();
    this.http
      .post('https://logiczack1234.azurewebsites.net:443/api/user-register/triggers/manual/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xF8yo1f4TIzOKY8srUiqIkYrkYD_f_hGbkBfiYwzbno',
        data, null, {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(res => {
        if (res.msg !== 'ok') {
          this.error = res.msg;
          this.cdr.detectChanges();
          return;
        }
        this.router.navigate(['passport', 'register-result']);
      });
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
