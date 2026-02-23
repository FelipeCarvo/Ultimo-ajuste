import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
    // Utilitário para retornar Observable de array vazio
    of<T>(data: T) {
      return of(data);
    }
  // Base: https://demo.poliview.com.br:21000/sieconwebwebapi
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any) {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: any, params?: any) {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, params ? { params } : {});
  }

  // Alguns endpoints retornam text/plain (ex.: GUID) em vez de JSON.
  // Angular precisa de responseType 'text' para não tentar fazer parse como JSON.
  postText(endpoint: string, body: any, params?: any) {
    return this.http.post(`${this.baseUrl}${endpoint}`, body, {
      ...(params ? { params } : {}),
      responseType: 'text',
    });
  }
}
