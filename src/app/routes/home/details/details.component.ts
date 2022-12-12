import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute} from "@angular/router";
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
    this.http.get('https://logiczack1234.azurewebsites.net/api/video-details/triggers/manual/invoke/'+ this.activatedRoute.snapshot.queryParams['id'] +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hcpl2vCd82bxpyIStTiFbDuie-nflUqeVePrFFOFAag',
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
    this.http.get('https://logiczack1234.azurewebsites.net/api/get-item-comment/triggers/manual/invoke/'+ this.activatedRoute.snapshot.queryParams['id'] +'/'+ this.q.ps * (this.q.pi - 1) +'/'+ this.q.ps +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rYv3LUCKrn7r5XlLFgONkEUjjtNT6inpCI9j7XiJgbw',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.reviews = res;
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

    this.http.post('https://logiczack1234.azurewebsites.net:443/api/add-comment/triggers/manual/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=j4tQg4hYWbZjyP9PQvaDQ4iY1ofE0aKdUt9sGX4vuBU',
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

    this.http.post('https://logiczack1234.azurewebsites.net:443/api/add-collection/triggers/manual/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8G-otEVvvIDgX6EclWYRzgWlC14yVoB9SExjCoPqDoc',
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
    this.http.get('https://logiczack1234.azurewebsites.net/api/whether-collect/triggers/manual/invoke/'+ this.user.userId +'/'+ this.activatedRoute.snapshot.queryParams['id'] +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XgaWszMI8v5QRi0dppUku97-zluu_BW3Ark72pyZLjI',
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

  constructor(private http: _HttpClient, private msg: NzMessageService, private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef) {}
}
