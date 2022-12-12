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

  user = {
    userId: inject(SettingsService).user.id
  };

  constructor(private http: _HttpClient, private msg: NzMessageService, private cdr: ChangeDetectorRef,  private router: Router) {}

  getData(): void {
    this.http.get('https://logiczack1234.azurewebsites.net/api/get-user-collection/triggers/manual/invoke/'+ this.user.userId +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aRB6ZJFGeOwIFLqlA13Hqk2x8ZQG5OH-XkI3Q5zfOCY',
      null,
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe(res => {
        this.list = res;
        this.listLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    this.getData();
  }

  remove(id: any): void {
    this.http.delete('https://logiczack1234.azurewebsites.net/api/remove-collection/triggers/manual/invoke/'+ id +'?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=UxgQH4vLaSLZ1jiiYtaF_NqWg4zvURzgpyqJGofR_qw',
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

  goPage(videoId: any): void {
    this.router.navigate(['/home/details'],{ queryParams: { id: videoId }});
  }
}
