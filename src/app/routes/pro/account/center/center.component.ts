import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { _HttpClient } from '@delon/theme';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-account-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProAccountCenterComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private http: _HttpClient, private cdr: ChangeDetectorRef) {}
  private router$!: Subscription;
  @ViewChild('tagInput', { static: false }) private tagInput!: ElementRef<HTMLInputElement>;

  notice: any;
  tabs = [
    {
      key: 'reviews',
      tab: 'reviews'
    },
    {
      key: 'collections',
      tab: 'collections'
    }
  ];
  pos = 0;

  private setActive(): void {
    const key = this.router.url.substring(this.router.url.lastIndexOf('/') + 1);
    const idx = this.tabs.findIndex(w => w.key === key);
    if (idx !== -1) {
      this.pos = idx;
    }
  }

  ngOnInit(): void {
    this.router$ = this.router.events.pipe(filter(e => e instanceof ActivationEnd)).subscribe(() => this.setActive());
    this.setActive();
  }

  to(item: { key: string }): void {
    this.router.navigateByUrl(`/pro/account/center/${item.key}`);
  }

  ngOnDestroy(): void {
    this.router$.unsubscribe();
  }
}