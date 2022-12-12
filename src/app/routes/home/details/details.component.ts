import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-profile-basic',
  templateUrl: './details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProDetailsComponent {
  q = {
    pi: 1,
    ps: 5,
    total: 0,
    status: false
  };
  loading = true;
  dinosaur: any[] = []

  getData(): void {
    this.http.get('https://prod-26.centralus.logic.azure.com/workflows/b75b1417b917460eae44021331af3130/triggers/manual/paths/invoke/'+ this.activatedRoute.snapshot.queryParams['id'] +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bc0IfG_rGqgPYDGkOOyUKpqpIIfaalHO7kjHYT9dHtc',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.dinosaur = res;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  getReviews(): void {
    this.http.get('https://prod-17.centralus.logic.azure.com/workflows/8e3fd00c98ee47c280a8991a64214bba/triggers/manual/paths/invoke/'+ this.activatedRoute.snapshot.queryParams['id'] +'/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RYt3otkU2yq5TsuTki70NXetBvATQTEmHekYdk-FMAI',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.reviews = res.review;
        this.q.total = res.total;
        this.loading = false;
        this.cdr.detectChanges();
      })
  }

  listChange(e: number): void {
    this.q.pi = e;
    this.getReviews();
  }

  ngOnInit(): void {
    this.whetherCollect();
    this.getData();
    this.getReviews();
  }

  reviews: any[] = [];
  submitting = false;
  user = {
    userId: inject(SettingsService).user.id,
    author: inject(SettingsService).user.username,
  };
  inputValue = '';

  handleSubmit(): void {
    this.submitting = true;
    const content = this.inputValue;
    const data = new FormData();
    data.append('userId', String(this.user.userId))
    data.append('videoId', String(this.activatedRoute.snapshot.queryParams['id']))
    data.append('text', String(content))

    this.http.post('https://prod-27.centralus.logic.azure.com:443/workflows/6f09091251f44327bc6c617eb24fc25e/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WOjUlFw2KmWsFoSSXpoqZ60acRRIgh7MUYtlhuRlSrI',
      data,
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        if (res.msg !== 'ok') {
          this.msg.error(res.msg);
          this.cdr.detectChanges();
          return;
        }
        this.msg.success('Post comment successfully');
        this.getReviews();
      })
    setTimeout(() => {
      this.submitting = false;
    }, 100);
  }

  addToCollection(): void {
    const data = new FormData();
    data.append('userId', String(this.user.userId))
    data.append('videoId', String(this.activatedRoute.snapshot.queryParams['id']))

    this.http.post('https://prod-27.centralus.logic.azure.com:443/workflows/6ccb308d9a5548eca3c2dae477e9e30f/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tGf9F2MjVmNsC9UvZPmW0-WUFZehEdUNBkM2jrdp9f0',
      data,
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        if (res.msg !== 'ok') {
          this.msg.error('Add failed');
          this.cdr.detectChanges();
          return;
        }
        this.q.status = true;
        this.ngOnInit();
        this.msg.success('Added to the collection Successfully');
      })
  }

  whetherCollect(): void {
    this.http.get('https://prod-15.centralus.logic.azure.com/workflows/6eaff82c2a3243cbbb0fcb905fcc476c/triggers/manual/paths/invoke/'+ this.user.userId +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5BcVG_5cwbBzRbBNbUCqqOiUTSApgXwt8nmVmTcFJ2w',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        for (let i = 0; i < res.length; i++) {
          if (res[i]['videoId'] == this.activatedRoute.snapshot.queryParams['id']) {
            this.q.status = true;
            return;
          }
        }
      })
  }

  constructor(private http: _HttpClient, private msg: NzMessageService, private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef, private router: Router) {}

  goUserPage(userId: string) {
    this.router.navigate(['/pro/userDetail'],{ queryParams: { userId: userId }});
  }
}
