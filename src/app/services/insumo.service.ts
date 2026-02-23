// Serviço para buscar insumos (usando endpoint padrão do EnumLockup)
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class InsumoService {
  constructor(private api: ApiService) {}

  listarInsumos(empreendimentoId: number): import('rxjs').Observable<any[]> {
    // Body ajustado: envia apenas empreendimentoId como string
    const body: any = {
      empreendimentoId: String(empreendimentoId)
    };
    return this.api.post<any[]>('/api/suprimentos/Lookups/Insumos', body);
  }
}
