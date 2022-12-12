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
      imgFile: [null, [Validators.required]],
      videoFile: [null, [Validators.required]],
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
    const imgFile = $("#upImg")[0] as HTMLInputElement
    const data = new FormData();
    data.append('videoName', String(this.validateForm.value['fileName']))
    // @ts-ignore
    data.append('img', imgFile.files[0])
    // @ts-ignore
    data.append('video', upFile.files[0])
    data.append('description', String(this.validateForm.value['description']))
    data.append('userId', String(this.user.userId));

    this.http.post('https://prod-23.centralus.logic.azure.com:443/workflows/243e2a19cecc4083af8918d483cb9671/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iGHfGwNRgnyg1eGLTlmdDpgjcBQi2tqqcTaRpjSfZkA',
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
