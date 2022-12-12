import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-account-center-collections',
  templateUrl: './userCollections.component.html',
  styleUrls: ['./userCollections.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProUserDetailCollectionsComponent {
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

  constructor(private http: _HttpClient, private msg: NzMessageService, private cdr: ChangeDetectorRef,  private router: Router, private activatedRoute: ActivatedRoute) {}

  getData(): void {
    this.http.get('https://prod-23.centralus.logic.azure.com/workflows/dd4d305b37594a09b108a59fe4cf60c0/triggers/manual/paths/invoke/'+ this.activatedRoute.snapshot.queryParams['userId'] +'/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MAIp4XkEeL_7CLmNL5RSUfmimDK8uc3Ugp_sQZGA3CQ',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.list = res.video;
        this.q.total = res.total;
        this.listLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
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
