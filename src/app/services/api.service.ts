import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthUser } from '@core/store/state/auth.state';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';

type QueryParams = HttpParams | Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
    // Utilitário para retornar Observable de array vazio
    of<T>(data: T) {
      return of(data);
    }

  private get baseUrl(): string {
    const dynamicBaseUrl = this.store.selectSnapshot(AuthUser.geturlAPISP7);
    return dynamicBaseUrl || environment.apiUrl;
  }

  private normalizeParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    if (params instanceof HttpParams) {
      return params;
    }

    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item === null || typeof item === 'undefined') {
            return;
          }

          httpParams = httpParams.append(key, this.serializeParamValue(item));
        });
        return;
      }

      httpParams = httpParams.append(key, this.serializeParamValue(value));
    });

    return httpParams;
  }

  private serializeParamValue(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return JSON.stringify(value);
  }

  constructor(private http: HttpClient, private store: Store) {}

  get<T>(endpoint: string, params?: QueryParams) {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: this.normalizeParams(params) });
  }

  post<T>(endpoint: string, body: unknown, params?: QueryParams) {
    const normalizedParams = this.normalizeParams(params);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, normalizedParams ? { params: normalizedParams } : {});
  }

  // Alguns endpoints retornam text/plain (ex.: GUID) em vez de JSON.
  // Angular precisa de responseType 'text' para não tentar fazer parse como JSON.
  postText(endpoint: string, body: unknown, params?: QueryParams) {
    const normalizedParams = this.normalizeParams(params);
    return this.http.post(`${this.baseUrl}${endpoint}`, body, {
      ...(normalizedParams ? { params: normalizedParams } : {}),
      responseType: 'text',
    });
  }
}
