import { Component } from '@angular/core';
import { SFSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {_HttpClient} from "@delon/theme";
import {Router} from "@angular/router";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-basic-list-add',
  templateUrl: './edit.component.html'
})
export class EditComponent {
  record: any = {};
  schema: SFSchema = {
    properties: {
      videoName: { type: 'string', title: 'Video Name' },
      description: { type: 'string', title: 'Description' },
    },
    required: ['Video Name', 'Description'],
    ui: {
      spanLabelFixed: 150,
      grid: { span: 24 }
    }
  };

  constructor(private modal: NzModalRef, private msg: NzMessageService, public http: _HttpClient, private router: Router) {}

  save(value: any): void {
    const data = new FormData();
    data.append('videoName', String(value.videoName))
    data.append('description', String(value.description))

    this.http.put('https://prod-05.centralus.logic.azure.com/workflows/e3f71b39e1c14f429166941399e89ca3/triggers/manual/paths/invoke/'+ value.id +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2uaPp9ULaSUQsND6cYmtvK-5aQkYIDHbfzh346Tg4J8',
      data,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
      if (res.msg !== 'ok') {
        this.msg.error(res.msg, {nzDuration: 3000});
        return;
      }
      this.msg.success('Modify dinosaur information successfully', {nzDuration: 3000});
      this.modal.close(true);
      location.reload();
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
