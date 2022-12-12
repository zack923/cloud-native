import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, ActivationEnd, Router} from '@angular/router';
import { _HttpClient } from '@delon/theme';
import { Subscription, filter } from 'rxjs';
import {HttpContext} from "@angular/common/http";
import {ALLOW_ANONYMOUS} from "@delon/auth";

@Component({
  selector: 'app-account-center',
  templateUrl: './userDetail.component.html',
  styleUrls: ['./userDetail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProUserDetailComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private http: _HttpClient, private cdr: ChangeDetectorRef, private activatedRoute: ActivatedRoute) {}
  private router$!: Subscription;
  @ViewChild('tagInput', { static: false }) private tagInput!: ElementRef<HTMLInputElement>;

  notice: any;
  tabs = [
    {
      key: 'release',
      tab: 'release'
    }
  ];
  pos = 0;

  user: any[] = [];

  private setActive(): void {
    const key = this.router.url.substring(this.router.url.lastIndexOf('/') + 1);
    const idx = this.tabs.findIndex(w => w.key === key);
    if (idx !== -1) {
      this.pos = idx;
    }
  }

  getData(): void {
    this.http.get('https://prod-10.centralus.logic.azure.com/workflows/c2234b7e578441858c27f5c4da1f04b4/triggers/manual/paths/invoke/'+ this.activatedRoute.snapshot.queryParams['userId'] +'?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mofKn6GQyB0UcSvz4e7rcDYVHyQIq8Mz8NqWrFQIlv4',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.user = res
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    this.router$ = this.router.events.pipe(filter(e => e instanceof ActivationEnd)).subscribe(() => this.setActive());
    this.setActive();
    this.getData();
  }

  to(item: { key: string }): void {
    this.router.navigateByUrl(`/pro/account/center/${item.key}`);
  }

  ngOnDestroy(): void {
    this.router$.unsubscribe();
  }
}
