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
    show: true
  };
  constructor(private http: _HttpClient, private cdr: ChangeDetectorRef, private router: Router, private msg: NzMessageService) {}

  loading = true;

  userId =  inject(SettingsService).user.id;

  getData(): void {
    this.loading = true;
    this.q.show = true;
    this.http.get('https://logiczack1234.azurewebsites.net/api/user-comment/triggers/manual/invoke/'+ this.userId +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iOL7xWtrWdy9_CeyDGRZG0DECu5lgAiMoCEvm4_zqaQ',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.list = res;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  goPage(videoId: any): void {
    this.router.navigate(['/home/details'],{ queryParams: { id: videoId }});
  }

  remove(reviewId: any): void {
    this.http.delete('/api/reviews/delete', {reviewId: reviewId})
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

  ngOnInit(): void {
    this.getData();
  }
}
