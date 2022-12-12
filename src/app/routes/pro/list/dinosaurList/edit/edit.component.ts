import { Component } from '@angular/core';
import { SFSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {_HttpClient} from "@delon/theme";
import {Router} from "@angular/router";

@Component({
  selector: 'app-basic-list-add',
  templateUrl: './edit.component.html'
})
export class EditComponent {
  record: any = {};
  schema: SFSchema = {
    properties: {
      name: { type: 'string', title: 'name' },
      diet: { type: 'string', title: 'diet' },
      period: { type: 'string', title: 'period' },
      lived_in: { type: 'string', title: 'lived in' },
      type: { type: 'string', title: 'type' },
      length: { type: 'string', title: 'length' },
      taxonomy: { type: 'string', title: 'taxonomy' },
      named_by: { type: 'string', title: 'named by' },
      species: { type: 'string', title: 'species' },
      avatar_url: { type: 'string', title: 'avatar' },
    },
    required: ['name', 'diet', 'period', 'lived_in', 'type', 'length', 'taxonomy', 'named_by', 'species', 'avatar_url'],
    ui: {
      spanLabelFixed: 150,
      grid: { span: 24 }
    }
  };

  constructor(private modal: NzModalRef, private msg: NzMessageService, public http: _HttpClient, private router: Router) {}

  save(value: any): void {
    this.http.put('/api/dinosaurs/update', value).subscribe(res => {
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
