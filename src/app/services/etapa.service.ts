// Serviço para buscar etapas (usando endpoint padrão do EnumLockup)
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class EtapaService {
  constructor(private api: ApiService) {}

  listarEtapas(empreendimentoId: string, insumoId?: string): import('rxjs').Observable<any[]> {
    // Só envia se empreendimentoId for válido e insumoId presente
    const guidZerado = '00000000-0000-0000-0000-000000000000';
    if (!empreendimentoId || empreendimentoId === guidZerado || !insumoId) {
      return this.api.of([]);
    }
    const body: any = {
      empreendimentoId,
      mostrarDI: true,
      requisito: insumoId // campo exigido pela API
    };
    return this.api.post<any[]>('/api/orcamentos/Lookups/Etapas', body);
  }
}
