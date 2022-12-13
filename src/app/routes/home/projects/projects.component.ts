import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {Router} from "@angular/router";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-list-collections',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProListProjectsComponent implements OnInit {
  q = {
    pi: 1,
    ps: 8,
    categories: [],
    owners: ['zxx'],
    type: '',
    text: '',
    rate: null,
    total: 0,
    show: true
  };
  list: any[] = [];
  loading = true;

  constructor(private http: _HttpClient, public msg: NzMessageService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.loading = true;
    this.q.show = true;
    this.http.get('https://prod-28.centralus.logic.azure.com/workflows/7f48bf7e38744460bf20a4fd0dd0a55e/triggers/manual/paths/invoke/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jA6-83eJDfedGHpkd3nDgokt-QvaQ_VqyXLyHogq34k',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
      this.list = res.video;
      this.q.total = res.total;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  listChange(e: number): void {
    this.q.pi = e;
    this.getData();
  }

  goPage(id: any): void {
    this.router.navigate(['/home/details'],{ queryParams: { id: id }});
  }

  reset(): void {
    setTimeout(() => this.getData());
  }

  sentimentAnalysis(): void {
    const data = new FormData();
    data.append('text', String(this.q.text))

    this.http.post('https://prod-00.centralus.logic.azure.com:443/workflows/2b606b71fdd44732bb7e9e06ef732fd6/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HfRYAWLYNGWsDtcmSfH9VC_Jf0F7zxAsfVRgtLmIaDk',
      data,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.msg.success('You are ' + res[0].sentiment + ', and your confidence scores are as follows. positive: ' + res[0].confidenceScores.positive +
          ', neutral: ' + res[0].confidenceScores.neutral + ', negative: ' + res[0].confidenceScores.negative, {nzDuration: 10000});
      });
  }
}
