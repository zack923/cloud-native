import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalHelper } from '@delon/theme';
import {AddComponent} from "./add/add.component";
import {Router} from "@angular/router";
import {EditComponent} from "./edit/edit.component";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-list-dinosaurList',
  templateUrl: './dinosaurList.component.html',
  styles: [
    `
      :host ::ng-deep .ant-card-meta-title {
        margin-bottom: 12px;
      }
    `
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProDinosaurListComponent implements OnInit {
  q = {
    pi: 1,
    ps: 8,
    total: 0,
    name: '',
    show: true
  };
  list: Array<any[] | null> = [null];

  loading = true;

  user = {
    userId: inject(SettingsService).user.id
  }

  constructor(private http: _HttpClient, private msg: NzMessageService, private cdr: ChangeDetectorRef, private mh: ModalHelper, private router: Router) {}

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.loading = true;
    this.q.show = true;
    this.list = [null];
    this.http.get('https://logiczack1234.azurewebsites.net/api/user-item-list/triggers/manual/invoke/'+ this.user.userId +'/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ibtrA3B8A0UZH4YTpp9iF1li471gDkcs4uuFYxvOKuE',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.list = this.list.concat(res);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  remove(dinosaurId: any): void {
    this.http.delete('/api/dinosaurs/delete', {dinosaurId: dinosaurId})
      .subscribe(res => {
        if (res.msg != 'ok') {
          this.msg.error('Delete failed');
          this.cdr.detectChanges();
          return;
        }
        this.msg.success('Delete succeeded');
        this.listChange(1)
      });
  }

  listChange(e: number): void {
    this.q.pi = e;
    this.list = [null];
    this.getData();
  }

  show(text: string): void {
    this.msg.success(text);
  }

  open(): void {
    this.mh.create(AddComponent).subscribe(console.log);
  }

  edit(record: { id?: number } = {}): void {
    this.mh.create(EditComponent, { record }, { size: 'md' }).subscribe(res => {
      this.cdr.detectChanges();
    });
  }

  goPage(id: any): void {
    this.router.navigate(['/home/details'],{ queryParams: { id: id }});
  }

  reset(): void {
    setTimeout(() => this.getData());
  }
}
