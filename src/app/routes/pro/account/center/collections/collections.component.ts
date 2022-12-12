import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {Router} from "@angular/router";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-account-center-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProAccountCenterProjectsComponent {
  listLoading = true;
  list: any[] = [];
  q = {
    pi: 1,
    ps: 8,
    total: 0
  };

  user = {
    userId: inject(SettingsService).user.id
  };

  constructor(private http: _HttpClient, private msg: NzMessageService, private cdr: ChangeDetectorRef,  private router: Router) {}

  getData(): void {
    this.http.get('https://prod-23.centralus.logic.azure.com/workflows/50bfa129d4124e4a901bb34321f9d7f4/triggers/manual/paths/invoke/'+ this.user.userId +'/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=gzL_5V4eUCAC6J4nFzUYvHoGKmD4V2DPwq9VJihybzc',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.list = res.collection;
        this.q.total = res.total;
        this.listLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    this.getData();
  }

  remove(id: any): void {
    this.http.delete('https://prod-10.centralus.logic.azure.com/workflows/9eb3d55248c74a1e977225d1717dbcdf/triggers/manual/paths/invoke/'+ id +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6rRH6bkpsm2A5JMDWJGpBkaDWZayJ1gtnK2TFHCE6ZM',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        if (res.msg != 'ok') {
          this.msg.error('Remove failed');
          this.cdr.detectChanges();
          return;
        }
        this.msg.success('Removed successfully');
      });
    this.listLoading = true;
    this.getData();
  }

  listChange(e: number): void {
    this.q.pi = e;
    this.getData();
  }

  goPage(videoId: any): void {
    this.router.navigate(['/home/details'],{ queryParams: { id: videoId }});
  }
}
