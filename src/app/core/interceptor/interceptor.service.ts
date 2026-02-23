import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpClient }
from '@angular/common/http';
import { Observable,throwError, } from 'rxjs';
import { catchError ,switchMap} from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { AuthUser } from '@core/store/state/auth.state';
import {setAuthData,Logout} from '@core/store/actions/auth.actions';
import { Router } from '@angular/router';
import {LoginService} from '@services/login/login.service'
import { ToastController } from '@ionic/angular';
@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private store: Store,private http:HttpClient,private router:Router,private loginService:LoginService,private toastController:ToastController){}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let errorMsg = '';
    const tokenUrl = request.url.includes('/connect/token');
    const documentUrl  = request.url.includes('/api/RequisicaoDocumentos');
    const isAuthenticated = this.store.selectSnapshot(AuthUser.isAuthenticated);
    const isFormData = typeof FormData !== 'undefined' && request.body instanceof FormData;

    if(tokenUrl){
      request = request.clone(
        {
          setHeaders: { 'Content-Type': 'application/x-www-form-urlencoded','Accept':'*/*'},
        }
      )
    }
    else if(!documentUrl && !tokenUrl && isAuthenticated){
      const token = this.store.selectSnapshot(AuthUser.getToken);
      // Importante: não setar Content-Type quando o body é FormData.
      // O browser precisa calcular o boundary do multipart automaticamente.
      request = request.clone({
        setHeaders: isFormData
          ? {
              Accept: '*/*',
              Authorization: `Bearer ${token}`
            }
          : {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
      });

    }

    else if(documentUrl  && isAuthenticated){
      const token = this.store.selectSnapshot(AuthUser.getToken);
      request = request.clone( {
        setHeaders: {
           Accept: '*/*',
          Authorization: `Bearer ${token}`
        }

      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const noContaisUrl = this.store.selectSnapshot(AuthUser.noUrls);
        if(noContaisUrl){
         this.redirecToLogin(error.error.error_description).then();
          return throwError(`Error: ${error}`);
        }
        if(error.status ===404){
          return throwError('url nao encontrada');
        }
        if(error.status === 401){
          return this.handle401Error(request, next)
        }else{
          const errorBody: Record<string, unknown> = (error.error && typeof error.error === 'object')
            ? (error.error as Record<string, unknown>)
            : {};

          const invalidToken = Boolean(error.status) && errorBody['error'] === 'invalid_grant';
          if(invalidToken){
            const desc = typeof errorBody['error_description'] === 'string' ? errorBody['error_description'] : '';
            if(desc !== 'Usuário ou senha inválidos!' && isAuthenticated){
              this.redirecToLogin(desc).then();
            }

            errorMsg = desc;
          }
          else if (error.error instanceof ErrorEvent) {
            console.log('this is client side error');
            errorMsg = `Error: ${error.error.message}`;
          }
          else {
            console.log('this is server side error',error);
            const err = errorBody;

            // 1) Padrão do backend atual (Mensagem/MensagemDetalhada)
            let msg = (typeof err['mensagem'] === 'string' ? err['mensagem'] : undefined)
              ?? (typeof err['Mensagem'] === 'string' ? err['Mensagem'] : undefined);

            // 2) Padrão ASP.NET ApiController (RFC9110) para validação (400)
            // { title, status, errors: { Campo: ["msg"] } }
            // Prioriza errors.{campo} (mais acionável) e usa title como fallback.
            if (!msg) {
              const errors = err['errors'];
              if (errors && typeof errors === 'object') {
                const errs = errors as Record<string, unknown>;
                const keys = Object.keys(errs);
                for (const k of keys) {
                  const v = errs[k];
                  if (Array.isArray(v) && typeof v[0] === 'string' && v[0].trim() !== '') {
                    msg = `${k}: ${v[0]}`;
                    break;
                  }
                  if (typeof v === 'string' && v.trim() !== '') {
                    msg = `${k}: ${v}`;
                    break;
                  }
                }
              }

              if (!msg) {
                const title = err['title'];
                if (typeof title === 'string' && title.trim() !== '') {
                  msg = title;
                }
              }
            }

            msg = msg ?? 'erro interno'
            const errorDescription = typeof err['error_description'] === 'string' ? err['error_description'] : '';
            errorMsg = `${errorDescription ? errorDescription : msg}`;
            console.log(errorMsg)
          }
          return throwError(errorMsg);
        }
      })
    );
  }
  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const refresh_token = this.store.selectSnapshot(AuthUser.getRefreshToken);
    const userName = this.store.selectSnapshot(AuthUser.getUserName);

    return this.loginService.getAuthToken(refresh_token).pipe(
      switchMap((res) =>{
        const {access_token,refresh_token} = res;
        const authData = {
          token:access_token,
          refreshToken:refresh_token,
          userName
        }
        this.store.dispatch(new setAuthData(authData));
          const newRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${access_token}`
          }
        });
        return next.handle(newRequest);
      }),
      catchError((err: HttpErrorResponse) => {
        const errorBody: Record<string, unknown> = (err.error && typeof err.error === 'object')
          ? (err.error as Record<string, unknown>)
          : {};
        const msg = (typeof errorBody['mensagem'] === 'string' ? errorBody['mensagem'] : undefined)
          ?? (typeof errorBody['Mensagem'] === 'string' ? errorBody['Mensagem'] : undefined)
          ?? 'Sessão expirada.';
        this.redirecToLogin(msg).then();
        return throwError(() => msg);
      })
    )
  }
  async redirecToLogin(msg: string){
    const toast = await this.toastController.create({
      message: String(msg ?? ''),
      duration: 2000
    });
    toast.present();
    setTimeout(()=>{
      this.store.dispatch(new Logout())
      this.router.navigate([ `/tabs/login`]);
    },1000)
  }
}
