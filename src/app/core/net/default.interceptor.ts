import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponseBase
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, IGNORE_BASE_URL, _HttpClient, CUSTOM_ERROR, RAW_BODY } from '@delon/theme';
import { environment } from '@env/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, Observable, of, throwError, catchError, filter, mergeMap, switchMap, take } from 'rxjs';

const CODEMESSAGE: { [key: number]: string } = {
  200: 'The server successfully returned the requested data.',
  201: 'Successfully created or modified data.',
  202: 'A request has entered the background queue (asynchronous task).',
  204: 'Data deleted successfully.',
  400: 'Data deleted successfully. There was an error in the request sent. The server did not create or modify data.',
  401: 'The user does not have permission (wrong token, user name and password).',
  403: 'The user is authorized, but access is prohibited.',
  404: 'The request was made for a non-existent record, and the server did not operate.',
  406: 'The requested format is not available.',
  410: 'The requested resource is permanently deleted and will not be obtained again.',
  422: 'A validation error occurred while creating an object.',
  500: 'An error occurred on the server. Please check the server.',
  502: 'Gateway error.',
  503: 'The service is unavailable, and the server is temporarily overloaded or maintained.',
  504: 'Gateway timed out.'
};

@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenEnabled = environment.api.refreshTokenEnabled;
  private refreshTokenType: 're-request' | 'auth-refresh' = environment.api.refreshTokenType;
  private refreshToking = false;
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector) {
    if (this.refreshTokenType === 'auth-refresh') {
      this.buildAuthRefresh();
    }
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(`Request Error ${ev.status}: ${ev.url}`, errortext);
  }

  private refreshTokenRequest(): Observable<any> {
    const model = this.tokenSrv.get();
    return this.http.post(`/api/auth/refresh`, null, null, { headers: { refresh_token: model?.['refresh_token'] || '' } });
  }

  private tryRefreshToken(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if ([`/api/auth/refresh`].some(url => req.url.includes(url))) {
      this.toLogin();
      return throwError(() => ev);
    }
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter(v => !!v),
        take(1),
        switchMap(() => next.handle(this.reAttachToken(req)))
      );
    }
    this.refreshToking = true;
    this.refreshToken$.next(null);

    return this.refreshTokenRequest().pipe(
      switchMap(res => {
        this.refreshToking = false;
        this.refreshToken$.next(res);
        this.tokenSrv.set(res);
        return next.handle(this.reAttachToken(req));
      }),
      catchError(err => {
        this.refreshToking = false;
        this.toLogin();
        return throwError(() => err);
      })
    );
  }

  private reAttachToken(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenSrv.get()?.token;
    return req.clone({
      setHeaders: {
        token: `Bearer ${token}`
      }
    });
  }

  // #endregion

  private buildAuthRefresh(): void {
    if (!this.refreshTokenEnabled) {
      return;
    }
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(res => {
          console.log(res);
          this.refreshToking = true;
          return this.refreshTokenRequest();
        })
      )
      .subscribe({
        next: res => {
          // TODO: Mock expired value
          res.expired = +new Date() + 1000 * 60 * 5;
          this.refreshToking = false;
          this.tokenSrv.set(res);
        },
        error: () => this.toLogin()
      });
  }

  // #endregion

  private toLogin(): void {
    this.notification.error(`You are not logged in or your login has expired. Please log in again.`, ``);
    this.goTo(this.tokenSrv.login_url!);
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.checkStatus(ev);
    switch (ev.status) {
      case 200:
        break;
      case 401:
        if (this.refreshTokenEnabled && this.refreshTokenType === 're-request') {
          return this.tryRefreshToken(ev, req, next);
        }
        this.toLogin();
        break;
      case 403:
      case 404:
      case 500:
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            'Unknown error, mostly due to the back-end does not support cross domain CORS or invalid configuration',
            ev
          );
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(() => ev);
    } else {
      return of(ev);
    }
  }

  private getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
    const res: { [name: string]: string } = {};
    const lang = this.injector.get(ALAIN_I18N_TOKEN).currentLang;
    if (!headers?.has('Accept-Language') && lang) {
      res['Accept-Language'] = lang;
    }

    return res;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let url = req.url;
    if (!req.context.get(IGNORE_BASE_URL) && !url.startsWith('https://') && !url.startsWith('http://')) {
      const { baseUrl } = environment.api;
      url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }

    const newReq = req.clone({ url, setHeaders: this.getAdditionalHeaders(req.headers) });
    return next.handle(newReq).pipe(
      mergeMap(ev => {
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        return of(ev);
      })
    );
  }
}
