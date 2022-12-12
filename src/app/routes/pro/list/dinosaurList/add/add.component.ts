import {Component, inject, OnInit} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";
import * as $ from 'jquery';

@Component({
  selector: 'app-sys-user-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {
  validateForm!: UntypedFormGroup

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private fb: UntypedFormBuilder
  ) {}

  user = {
    userId: inject(SettingsService).user.id
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      fileName: [null, [Validators.required]],
      file: [null, [Validators.required]],
      description: [null,[Validators.required]]
    });
  }

  save(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });

      return;
    }

    const upFile = $("#upFile")[0] as HTMLInputElement
    const data = new FormData();
    data.append('fileName', String(this.validateForm.value['fileName']))
    // @ts-ignore
    data.append('File', upFile.files[0])
    data.append('description', String(this.validateForm.value['description']))
    data.append('userId', String(this.user.userId));

    this.http.post('https://logiczack1234.azurewebsites.net:443/api/user-release/triggers/manual/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=gfTJGL6u7FOIwc33_Wl7TgBzy3tbdPJfNFIDPNfLzuE',
      data,
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
      if (res.msg !== 'ok') {
        this.msg.error(res.msg, {nzDuration: 3000});
        return;
      }
      this.msg.success('Release successfully', {nzDuration: 3000});
      this.modal.close(true);
      location.reload();
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
