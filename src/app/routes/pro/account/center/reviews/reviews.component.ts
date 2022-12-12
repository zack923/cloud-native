import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Inject} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import {Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-account-center-reviews',
  templateUrl: './reviews.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProAccountCenterArticlesComponent {
  list!: any[];

  q = {
    name: '',
    show: true,
    pi: 1,
    ps: 8,
    total: 0
  };
  constructor(private http: _HttpClient, private cdr: ChangeDetectorRef, private router: Router, private msg: NzMessageService) {}

  loading = true;

  userId =  inject(SettingsService).user.id;

  getData(): void {
    this.loading = true;
    this.q.show = true;
    this.http.get('https://prod-23.centralus.logic.azure.com/workflows/0599db81c069424e8b49e7f037937970/triggers/manual/paths/invoke/'+ this.userId +'/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=APlbsf7hFIiVT4138qdu-wY4FdQrxJpltBT_LHCBmdI',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.list = res.review;
        this.q.total = res.total;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  goPage(videoId: any): void {
    this.router.navigate(['/home/details'],{ queryParams: { id: videoId }});
  }

  remove(id: any): void {
    this.http.delete('https://prod-04.centralus.logic.azure.com/workflows/9e6913507f594fba9e2817c79ca0ecd9/triggers/manual/paths/invoke/'+ id +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=euNexsyf8xt3JvHcZKWdjuW3K-j1O2ZoFc-aWPijJEo',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        if (res.msg != 'ok') {
          this.msg.error('Delete failed');
          this.cdr.detectChanges();
          return;
        }
        this.msg.success('Delete succeeded');
        this.getData();
      });
  }

  listChange(e: number): void {
    this.q.pi = e;
    this.getData();
  }

  ngOnInit(): void {
    this.getData();
  }
}
