import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, throwError, tap } from 'rxjs';

type ApiRecord = Record<string, unknown>;
type QueryParamValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryParamValue>;

export interface OrdemServicoApiItem extends ApiRecord {
  osCod?: number | string;
  osDescricao?: string;
  equipCod?: string;
  equipIndentificador?: string;
  equipId?: string;
  osId?: string;
  OsId?: string;
  numeroOs?: number | string;
  NumeroOs?: number | string;
}

export interface LookupItem extends ApiRecord {
  id?: string;
  codigo?: string | number;
  descricao?: string;
  nome?: string;
  equipamento?: string;
  EquipamentoId?: string;
  empreendimentoId?: string;
  EmpreendimentoId?: string;
  colaboradorId?: string;
  colaboradorCod?: string | number;
  colaboradorNome?: string;
  fornId?: string;
}
@Injectable({
  providedIn: 'root',
})
export class OrdemServicoService {
  constructor(private api: ApiService) {}

  // Alguns ambientes publicam a rota "OrdensServico" (plural) e outros "OrdemServico" (singular).
  // Para evitar 404 repetido, memorizamos em runtime qual endpoint funcionou.
  private fotoEndpointPreferido: 'legado' | 'swagger' | null = null;

  private getApiErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;
    if (!err || typeof err !== 'object') return '';
    const e = err as Record<string, unknown>;
    const errorObj = e['error'];
    if (errorObj && typeof errorObj === 'object') {
      const eo = errorObj as Record<string, unknown>;
      const mensagem = eo['Mensagem'];
      if (typeof mensagem === 'string') return mensagem;
    }
    const message = e['message'];
    return typeof message === 'string' ? message : '';
  }

  private sanitizeQueryParams(params: QueryParams): Record<string, string | number | boolean> {
    const sanitized: Record<string, string | number | boolean> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return;
        sanitized[key] = trimmed;
        return;
      }

      sanitized[key] = value;
    });

    return sanitized;
  }

  // =======================
  // 1) BUSCA / LISTAGEM DE OS
  // =======================
  // Buscar OS por número (a gente ainda não está usando esse na edição,
  // mas ele já fica pronto pra quando o back liberar)
  buscarOSPorNumero(): Observable<OrdemServicoApiItem[]> {
    // Método descontinuado: backend não aceita mais NumeroOs, use buscarOSPorId
    console.warn('buscarOSPorNumero está obsoleto. Use buscarOSPorId(osId: string)');
    return this.api.get<OrdemServicoApiItem[]>('/api/frotas/OrdensServico/ConsultaGeralOrdensServico', {}); // Retorna vazio
  }

  // Buscar OS por Id (GUID)
  buscarOSPorId(osId: string): Observable<OrdemServicoApiItem[]> {
    return this.api.get<OrdemServicoApiItem[]>('/api/frotas/OrdensServico/ConsultaGeralOrdensServico', { OsId: osId });
  }

  // Pesquisa geral de OS (tela de pesquisa)
  consultarGeral(filtros: {
    osCodigo?: string | number | null;
    osId?: string | null;
    empreendimentoId?: string | null;
    equipamentoId?: string | null;
    causaIntervencaoId?: string | null;
    manutentorId?: string | null;
    status?: string | null;
    dataInicial?: string | null;
    dataFinal?: string | null;
  }): Observable<OrdemServicoApiItem[]> {
    const params: QueryParams = {};
    if (filtros.osCodigo !== null && filtros.osCodigo !== undefined && String(filtros.osCodigo).trim() !== '') {
      params.OsCodigo = filtros.osCodigo;
    }
    if (filtros.osId) params.OsId = filtros.osId;
    if (filtros.empreendimentoId) params.EmpreendimentoId = filtros.empreendimentoId;
    if (filtros.equipamentoId) params.EquipamentoId = filtros.equipamentoId;
    if (filtros.causaIntervencaoId) params.CausaIntervencaoId = filtros.causaIntervencaoId;
    if (filtros.manutentorId) params.ManutentorId = filtros.manutentorId;
    if (filtros.status) params.Status = filtros.status;
    if (filtros.dataInicial) params.DataInicial = filtros.dataInicial;
    if (filtros.dataFinal) params.DataFinal = filtros.dataFinal;
    return this.api.get<OrdemServicoApiItem[]>(
      '/api/frotas/OrdensServico/ConsultaGeralOrdensServico',
      params
    );
  }

  // Empreendimentos (combo Empreendimento / Empreendimento da intervenção)
  listarEmpreendimentos(): Observable<LookupItem[]> {
    return this.api.post<LookupItem[]>('/api/cadastros/Lookups/Empreendimentos', {});
  }

  // Classificação de serviço
  listarClassificacoesServico(): Observable<LookupItem[]> {
    return this.api.post<LookupItem[]>('/api/frotas/Lookups/ClassificacaoOs', {});
  }

  // Tipos de OS
  listarTiposOs(): Observable<LookupItem[]> {
    return this.api.post<LookupItem[]>('/api/frotas/Lookups/TipoOs', {});
  }

  // Causas de intervenção
  listarCausasIntervencao(): Observable<LookupItem[]> {
    return this.api.post<LookupItem[]>('/api/frotas/Lookups/CausaIntervencao', {});
  }

  // Colaboradores Motoristas / Operadores
  listarColaboradoresMotoristas(): Observable<LookupItem[]> {
    return this.api.get<LookupItem[]>('/api/frotas/OrdensServico/ConsultaColaborador', { Classificacao: 1 });
  }

  // Colaboradores Manutentores
  listarColaboradoresManutentores(): Observable<LookupItem[]> {
    return this.api.get<LookupItem[]>('/api/frotas/OrdensServico/ConsultaColaborador', { Classificacao: 2 });
  }

  // Mock para evitar erro de compilação
  gravarDetalhesOrdem(payload: ApiRecord): Observable<unknown> {
    // Chamada real da API para gravar detalhes da OS
    return this.api.post('/api/frotas/OrdensServico/GravarDetOrdemServico', payload);
  }

  listarEquipamentos(): Observable<LookupItem[]> {
    return this.api.post<LookupItem[]>('/api/frotas/Lookups/EquipamentosMobile', {});
    }

    public listarStatusOS(): Array<{ codigo: number; descricao: string }> {
      return [
        { codigo: 0, descricao: 'Aberta' },
        { codigo: 1, descricao: 'Serviço Iniciado' },
        { codigo: 2, descricao: 'Serviço Concluído' },
        { codigo: 3, descricao: 'Fechada' },
        { codigo: 4, descricao: 'Reprov./Cancelada' }
      ];
    }

  gravarOrdem(params: QueryParams): Observable<unknown> {
    const sanitizedParams = this.sanitizeQueryParams(params);
    return this.api.post('/api/frotas/OrdensServico/GravarOrdemServico', {}, sanitizedParams);
  }

  // Envia foto (base64) para a OS
  gravarOrdemServicoFoto(
    ordemServicoId: string,
    fotoOrdemServicoBase64: string,
    fotoId?: string,
    osCod?: string | number
  ): Observable<string> {
    // Swagger indica rota singular e body com:
    // { ordemServicoId, fotoOrdemServicoBase64, fotoId }
    // Porém, neste ambiente, a rota singular pode não existir (404).
    // Então tentamos:
    // 1) /api/frotas/OrdemServico/GravarOrdemServicoFoto
    // 2) fallback: /api/frotas/OrdensServico/GravarOrdemServicoFoto
    // E enviamos aliases no body para compatibilidade com backends legados.

    const payload: ApiRecord = {
      // contrato do Swagger
      ordemServicoId,
      fotoOrdemServicoBase64,
    fotoId: fotoId ?? null,

      // aliases legados comuns
      OsId: ordemServicoId,
      IdOs: ordemServicoId,
      FotoBase64: fotoOrdemServicoBase64,
    };

    if (osCod !== undefined && osCod !== null && String(osCod).trim() !== '') {
      payload['osCod'] = osCod;
      payload['OsCod'] = osCod;
      payload['NumeroOs'] = osCod;
      payload['CodigoOrdemServico'] = osCod;
    }

    const endpointSwagger = '/api/frotas/OrdemServico/GravarOrdemServicoFoto';
    const endpointLegado = '/api/frotas/OrdensServico/GravarOrdemServicoFoto';

    const callLegado$ = this.api.postText(endpointLegado, payload).pipe(
      tap(() => {
        this.fotoEndpointPreferido = 'legado';
      })
    );
    const callSwagger$ = this.api.postText(endpointSwagger, payload).pipe(
      tap(() => {
        this.fotoEndpointPreferido = 'swagger';
      })
    );

    // Ordem de tentativa:
    // - Se já sabemos o endpoint certo, chama direto.
    // - Caso contrário, tenta primeiro o legado (o que está funcionando neste ambiente) e faz fallback pro swagger.
    const primary$ = this.fotoEndpointPreferido === 'swagger'
      ? callSwagger$
      : callLegado$;
    const fallback$ = this.fotoEndpointPreferido === 'swagger'
      ? callLegado$
      : callSwagger$;

    return primary$.pipe(
      catchError((err: unknown) => {
        const msg = this.getApiErrorMessage(err).toLowerCase();
        if (msg.includes('url nao encontrada')) {
          return fallback$;
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Monta o payload completo para gravar uma Ordem de Serviço
   * @param dados Dados coletados das telas de edição, defeitos, etc
   */
  montarPayloadOrdemServico(dados: ApiRecord): QueryParams {
    const asNullableString = (value: unknown): string | null => {
      if (value === null || value === undefined) return null;

      const normalized = String(value).trim();
      if (!normalized) return null;
      if (normalized.toLowerCase() === 'null') return null;

      return normalized;
    };

    const descricao = asNullableString(dados['Descricao']);

    const payload: QueryParams = {
      OsId: asNullableString(dados['OsId'] ?? dados['IdOs']),
      Descricao: descricao ? descricao.toUpperCase() : null,
      EquipamentoId: asNullableString(dados['EquipamentoId']),
      Status: Number(dados['Status'] ?? 1),
      StatusId: Number(dados['Status'] ?? 1),
      statusCod: Number(dados['Status'] ?? 1),
      OsDataAbertura: asNullableString(dados['OsDataAbertura'] ?? dados['DataAbertura']),
      OsDataConclusao: asNullableString(dados['OsDataConclusao'] ?? dados['DataFechamento']),
      TipoServicoId: asNullableString(dados['TipoServicoId'] ?? dados['TipoOs']),
      ClassificacaoId: asNullableString(dados['ClassificacaoId'] ?? dados['Classificacao']),
      CausasId: asNullableString(dados['CausasId'] ?? dados['CausaIntervencao']),
      MotoristaOperadorId: asNullableString(dados['MotoristaOperadorId'] ?? dados['ColaboradorId']),
      EmpreendimentoId: asNullableString(dados['EmpreendimentoId']),
      EmprdintervencaoId: asNullableString(dados['EmprdintervencaoId'] ?? dados['EmpreendimentoIntervencao']),
      Observacao: asNullableString(dados['Observacao'] ?? dados['observacao']),
      ObsDef: asNullableString(dados['ObsDef'] ?? dados['DefeitosConstatados']),
      ObsCausas: asNullableString(dados['ObsCausas'] ?? dados['CausasProvaveis']),
      ManutentorResponsavelId: asNullableString(dados['ManutentorResponsavelId']),
      Odometro: asNullableString(dados['Odometro'] ?? dados['Hodometro']),
      Horimetro: asNullableString(dados['Horimetro'] ?? dados['horimetro']),

      Origem: 3,
    };
    return payload;
  }
}
