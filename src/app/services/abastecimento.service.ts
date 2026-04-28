// Função utilitária para normalizar valores nulos
function normalizeNulls(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeNulls);
  } else if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === undefined || value === null || value === 'null') {
        result[key] = null;
      } else if (typeof value === 'object') {
        result[key] = normalizeNulls(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, of, switchMap } from 'rxjs';

export type LookupId = string | number;
export type LookupItem = {
  id: LookupId;
  descricao?: string;
  nome?: string;
  label?: string;
  [key: string]: unknown;
};

export type EquipamentoLookup = LookupItem & {
  placa?: string;
  modelo?: string;
};



export type EmpresaLookup = LookupItem & {
  descricao?: string;
};

export type ColaboradorFrentistaDto = {
  id: string;
  descricao: string;
  [key: string]: unknown;
};

export type MotoristaOperadorDto = {
  fornId: string;
  colaboradorNome: string;
  [key: string]: unknown;
};

export type BombaDto = {
  bombaId: string;
  empreendimentoId?: string;
  bombaDescricao?: string;
  bombaCod?: string;
  [key: string]: unknown;
};

export type BicoDto = {
  bicoId: string;
  bicoDescricao?: string;
  bicoCdg?: string | number;
  [key: string]: unknown;
};

export type DestinoDto = {
  destino: string;
  destinoTipo?: string;
  destinoDesc?: string;
  destinoid?: string;
  [key: string]: unknown;
};

export type EquipamentoDto = {
  id: string;
  descricao: string;
  [key: string]: unknown;
};

export type InsumoDto = {
  insumoId: string;
  insumoDescr: string;
  [key: string]: unknown;
};

export type AplicacaoDto = {
  aplicacaoId: string;
  aplicacaoDescr: string;
  [key: string]: unknown;
};

export interface AbastecimentoConsulta {
  // Campos principais
  abastecimentoId?: string;
  dataAbastecimento: string;
  dataCadastro?: string;
  tpAbastecimento?: number;

  // Equipamento
  equipamentoId?: string;
  codEquipamento: string;
  identificador?: string;
  placa: string;
  modelo: string;

  // Fornecedor (para postos)
  fornecedorId?: string;
  fornecedorRazao: string;

  // Insumo
  insumoId?: string;
  insumoCdg?: string;
  insumoDesc: string;
  quantidade: number;
  valorTotal?: number;

  // Bomba/Comboio
  comboioBombaId?: string;
  comboioBombaCdg?: string;
  comboioBombaDescr?: string;

  // Bico
  bicoId?: string;
  bicoCdg?: number;
  bicoDescr?: string;

  // Empreendimento
  emprdCod?: number;
  emprDesc?: string;

  // Outros
  numVoucher: number;
  numRetornoPosto?: number;
  numeroCartao?: string;
  odometro?: number;
  horimetro?: number;
  localAbastecimento?: string;

  // Responsável
  responsavelId?: string;
  responsavelCod?: string;
  responsavelNome?: string;

  // Outros
  entidade?: number;
  codAbastecimentoExterno?: string;

  // Destino
  destino?: string;
  destinoTipo?: string;
  destinoDesc?: string;
  destinoid?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AbastecimentoService {
  constructor(private api: ApiService) {}

  private normalizePayloadForCompat(payload: Record<string, unknown>): Record<string, unknown> {
    const nextPayload = { ...payload };
    const abastecimentoId =
      nextPayload['IdAbastecimento'] ??
      nextPayload['AbastecimentoId'] ??
      nextPayload['idAbastecimento'] ??
      nextPayload['abastecimentoId'];

    if (abastecimentoId !== null && typeof abastecimentoId !== 'undefined' && String(abastecimentoId).trim() !== '') {
      nextPayload['IdAbastecimento'] = abastecimentoId;
      nextPayload['AbastecimentoId'] = abastecimentoId;
      nextPayload['idAbastecimento'] = abastecimentoId;
    }

    return nextPayload;
  }

  private normalizeConsultaAbastecimentoPorIdResponse(response: unknown, abastecimentoId: string) {
    const norm = normalizeNulls(response);
    if (Array.isArray(norm)) {
      const alvo = String(abastecimentoId || '').toLowerCase();
      return norm.find((item: any) => {
        const itemId = String(
          item?.abastecimentoId ??
          item?.AbastecimentoId ??
          item?.idAbastecimento ??
          item?.IdAbastecimento ??
          item?.id ??
          item?.Id ??
          ''
        ).toLowerCase();
        return itemId === alvo;
      }) || norm[0] || null;
    }
    return norm;
  }

  // Empresas (Lookup correto)
  listarEmpresas() {
    return this.api.post<EmpresaLookup[]>('/api/cadastros/Lookups/Empresas', { tipoEmpresa: 0 });
  }

  consultarAbastecimentoPosto(filtros: {
    fornecedorId?: string | null;
    equipamentoId?: string | null;
    dataInicial?: string | null;
    dataFinal?: string | null;
    numVoucher?: string | null;
    // compat (versões antigas)
    fornecedor?: string | null;
    equipamento?: string | null;
  }) {
    const params: Record<string, string | number> = {
      TpAbastecimento: 1, // 1 = abastecimento em postos
      Origem: 3 // Só registros feitos pelo app
    };

    const fornecedorId = (filtros.fornecedorId ?? filtros.fornecedor ?? '')?.toString().trim();
    const equipamentoId = (filtros.equipamentoId ?? filtros.equipamento ?? '')?.toString().trim();
    const numVoucher = (filtros.numVoucher ?? '')?.toString().trim();

    if (fornecedorId) {
      params['IdFornecedor'] = fornecedorId;
      // compat: alguns backends podem esperar outro casing
      params['fornecedorId'] = fornecedorId;
    }
    if (equipamentoId) {
      params['IdEquipamento'] = equipamentoId;
      params['equipamentoId'] = equipamentoId;
    }
    if (filtros.dataInicial) {
      params['DataIni'] = filtros.dataInicial;
      params['DataInicial'] = filtros.dataInicial;
    }
    if (filtros.dataFinal) {
      params['DataFim'] = filtros.dataFinal;
      params['DataFinal'] = filtros.dataFinal;
    }
    if (numVoucher) {
      params['NumVoucher'] = numVoucher;
      params['numVoucher'] = numVoucher;
    }
    return this.api.get<unknown[]>(
      '/api/frotas/Abastecimentos/ConsultaAbastecimento',
      params
    ).pipe(
      map((res: any) => normalizeNulls(res))
    );
  }

  consultarAbastecimentoPostoPorId(abastecimentoId: string) {
    const params: Record<string, string | number> = {
      TpAbastecimento: 1,
      // compat: registros do app são gravados com Origem=3
      Origem: 3,
      // swagger publica IdAbastecimento; mantemos alias por compatibilidade entre ambientes
      IdAbastecimento: abastecimentoId,
      AbastecimentoId: abastecimentoId,
    };
    return this.api.get<unknown[]>('/api/frotas/Abastecimentos/ConsultaAbastecimento', params);
    // Normalização pode ser feita no componente que consome, se necessário
  }

listarBlocosPosto(
  empreendimentoId: string,
  requisito?: string,
  aplicacaoId?: string
) {

  const body: Record<string, unknown> = {
    empreendimentoId
  };

  if (requisito) {
    body['requisito'] = requisito;
  }

  if (aplicacaoId) {
    body['aplicacaoId'] = aplicacaoId;
  }

  return this.api.post<LookupItem[]>(
    '/api/cadastros/Lookups/Blocos',
    body
  );
}


  listarColaboradoresMotoristaOperador() {
    return this.api.get<MotoristaOperadorDto[]>
    ('/api/frotas/OrdensServico/ConsultaColaborador', { Classificacao: 1 });
  }

consultarAplicacaoPrev(equipamentoId: string, insumoId: string) {
  const params = {
    EquipamentoId: equipamentoId,
    InsumoId: insumoId
  };

  return this.api.get<any[]>(
    '/api/frotas/Abastecimentos/ConsultaAplicacaoPrevEquipInsumo',
    params
  );
}

  listarInsumosComboio(bombaId: string) {
    return this.api.get<InsumoDto[]>(
      '/api/frotas/Abastecimentos/ConsultaEstoqueComboio',
      { bombaId }
    );
  }


listarEmpreendimentos(emprdId?: string) {

  const body: any = {};

  if (emprdId) {
    body.emprdId = emprdId;
  }

  return this.api.post<LookupItem[]>(
    '/api/cadastros/Lookups/Empreendimentos',
    body
  );
}

  // Equipamentos (Mobile) - conforme documentação do Abastecimento Posto
  listarEquipamentosMobile() {
    return this.api.post<EquipamentoLookup[]>('/api/frotas/Lookups/EquipamentosMobile', {});
  }

  listarBombas() {
    return this.api.get<BombaDto[]>('/api/frotas/Abastecimentos/ConsultaBomba');
  }

consultarBomba(bombaId: string) {
  return this.api.get<BombaDto[]>(
    `/api/frotas/Abastecimentos/ConsultaBomba?Id=${bombaId}`
  );
}

  listarEquipamentos() {
    return this.api.post<EquipamentoDto[]>('/api/frotas/Lookups/Equipamentos', {});
  }
listarColaboradoresFrentista() {
  return this.api.post<any[]>(
    '/api/cadastros/Lookups/Pessoas',
    {
      tipoPessoa: 'Funcionário'
    }
  );
}
  // Consulta de abastecimento próprio (tela de pesquisa)
  consultarAbastecimentoProprio(filtros: {
    origemTanque?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
  }) {
    const params: Record<string, unknown> = {
      TpAbastecimento: 0,
      Origem: 3,
    };

    if (filtros.origemTanque) {
      params.ComboioBomba = filtros.origemTanque;
      params.BombaId = filtros.origemTanque;
      params.IdTanqueOrigem = filtros.origemTanque;
      params.comboioBombaId = filtros.origemTanque;
    }
    if (filtros.equipamento) {
      params.EquipamentoId = filtros.equipamento;
      params.IdEquipamento = filtros.equipamento;
      params.equipamentoId = filtros.equipamento;
    }

    if (filtros.dataInicial) {
      params.DataIni = filtros.dataInicial;
      params.DataInicial = filtros.dataInicial;
    }
    if (filtros.dataFinal) {
      params.DataFim = filtros.dataFinal;
      params.DataFinal = filtros.dataFinal;
    }

    return this.api.get<AbastecimentoConsulta[]>(
      '/api/frotas/Abastecimentos/ConsultaAbastecimento',
      params
    ).pipe(
      map((res: any) => normalizeNulls(res))
    );
  }

  // Consulta de abastecimento próprio por ID (igual ao posto)
  consultarAbastecimentoProprioPorId(abastecimentoId: string) {
    const endpoint = '/api/frotas/Abastecimentos/ConsultaAbastecimento';
    const paramsComOrigem: Record<string, string | number> = {
      TpAbastecimento: 0,
      Origem: 3,
      IdAbastecimento: abastecimentoId,
      AbastecimentoId: abastecimentoId,
      idAbastecimento: abastecimentoId,
    };
    const paramsSemOrigem: Record<string, string | number> = {
      TpAbastecimento: 0,
      IdAbastecimento: abastecimentoId,
      AbastecimentoId: abastecimentoId,
      idAbastecimento: abastecimentoId,
    };

    return this.api.get<unknown[]>(endpoint, paramsComOrigem).pipe(
      map((res: any) => this.normalizeConsultaAbastecimentoPorIdResponse(res, abastecimentoId)),
      switchMap((resultado) => {
        if (resultado) {
          return of(resultado);
        }

        return this.api.get<unknown[]>(endpoint, paramsSemOrigem).pipe(
          map((res: any) => this.normalizeConsultaAbastecimentoPorIdResponse(res, abastecimentoId))
        );
      })
    );
  }

  // Gravação de abastecimento (Próprio ou Posto)
  gravarAbastecimento(payload: Record<string, unknown>) {
    const normalizedPayload = this.normalizePayloadForCompat(payload);
    const obrigatorios: { campo: string; label: string; regra?: (v: unknown) => boolean; }[] = [
      {
        campo: 'TpAbastecimento',
        label: 'Tipo de Abastecimento',
        regra: v => v === 0 || v === 1 // Aceita abastecimento próprio (0) ou posto (1)
      },
      { campo: 'DataAbastecimento', label: 'Data do Abastecimento', regra: v => !!v },
      // Só exige Origem/Tanque para abastecimento próprio (TpAbastecimento: 0)
      // Para postos (TpAbastecimento: 1), não é obrigatório
      ...(normalizedPayload['TpAbastecimento'] === 0 ? [
        { campo: 'IdTanqueOrigem', label: 'Origem/Tanque', regra: v => !!v && v !== '00000000-0000-0000-0000-000000000000' }
      ] : []),
      // Só exige Bico para abastecimento próprio (TpAbastecimento: 0)
      ...(normalizedPayload['TpAbastecimento'] === 0 ? [
        { campo: 'IdBico', label: 'Bico', regra: v => !!v && v !== '00000000-0000-0000-0000-000000000000' }
      ] : []),
      { campo: 'IdInsumo', label: 'Insumo', regra: v => !!v && v !== '00000000-0000-0000-0000-000000000000' },
      { campo: 'QtdInsumo', label: 'Quantidade', regra: v => v !== null && v !== undefined && v !== '' },
      { campo: 'Origem', label: 'Origem (fixo 3)', regra: v => v === 3 },
    ];
    // Só exige TpDestino (Destino) se for abastecimento próprio (TpAbastecimento: 0)
    if (normalizedPayload['TpAbastecimento'] === 0) {
      obrigatorios.push({ campo: 'TpDestino', label: 'Destino', regra: v => !!v });
    }
    // IdEquipamento obrigatório quando destinoTipo = 'M'
    const destinoTipo = normalizedPayload['TpDestino'] || normalizedPayload['destinoTipo'];
    if (destinoTipo === 'M') {
      obrigatorios.push({ campo: 'IdEquipamento', label: 'Equipamento', regra: v => !!v && v !== '00000000-0000-0000-0000-000000000000' });
    }
    // Validação dos campos obrigatórios
    for (const ob of obrigatorios) {
      const valor = normalizedPayload[ob.campo];
      if (!ob.regra ? !valor : !ob.regra(valor)) {
        throw new Error(`O campo obrigatório "${ob.label}" não foi informado ou está inválido.`);
      }
    }

    // Remover duplicidade de AbastecimentoId/abastecimentoId
    if ('abastecimentoId' in normalizedPayload && 'AbastecimentoId' in normalizedPayload) {
      delete normalizedPayload['abastecimentoId'];
    }

    // Monta a query string manualmente
    const params = new URLSearchParams();
    Object.keys(normalizedPayload).forEach(key => {
      const value = normalizedPayload[key];
      if (value !== null && typeof value !== 'undefined') {
        params.append(key, String(value));
      }
    });
    const url = `/api/frotas/Abastecimentos/GravaAbastecimento?${params.toString()}`;
    // Envia como POST sem corpo, só com query string
    return this.api.post(url, null);
  }

  // Bicos (referente à bomba)
listarBicos(bombaId: string) {
  return this.api.get<BicoDto[]>(
    `/api/frotas/Abastecimentos/ConsultaBico?Id=${bombaId}`
  );
}
  // Destinos (referente à bomba)
listarDestinos(bombaId: string) {
  // ConsultaDestinoAbastecimentos espera o parâmetro bombaId
  return this.api.get<any[]>(
    `/api/frotas/Abastecimentos/ConsultaDestinoAbastecimentos?bombaId=${bombaId}`
  );
}
  // Centro de Despesas (Plano de Contas)
  listarCentrosDespesas(
    pesquisa: string = '',
    valorSelecionado: string = '',
    lookupKey?: string
  ) {
    // Swagger mostra body apenas com { pesquisa, valorSelecionado }.
    // Para seguir a documentação interna (usar planoContasPadraoId do Insumo como "LookupKey"),
    // enviamos esse valor em valorSelecionado.
    const body: Record<string, unknown> = {
      pesquisa,
      valorSelecionado: lookupKey ? String(lookupKey) : valorSelecionado
    };

    return this.api
      .post<unknown>('/api/cadastros/Lookups/PlanoContasDespesas', body)
      .pipe(
        map((res) => {
          if (typeof res === 'string') {
            try {
              return JSON.parse(res) as unknown;
            } catch {
              return [] as unknown[];
            }
          }
          return res;
        })
      );
  }

  // Etapas (por empreendimento)
listarEtapas(params: {
  empreendimentoId: string;
  pesquisa?: string;
  valorSelecionado?: string;
  mostrarDI?: boolean;
  insumoId?: string;
  emprdCod?: string | number;  // Código numérico do empreendimento (fallback)
}) {
  const body: Record<string, unknown> = {
    pesquisa: params.pesquisa || '',
    valorSelecionado: params.valorSelecionado || '',
    empreendimentoId: params.empreendimentoId,
    mostrarDI: typeof params.mostrarDI !== 'undefined' ? params.mostrarDI : true,
    requisito: false  // Campo obrigatório pela API
  };

  // Fallback legado opcional
  if (params.emprdCod !== undefined && params.emprdCod !== null) {
    body['emprdCod'] = params.emprdCod;
  }

  if (params.insumoId) {
    body['insumoId'] = params.insumoId;
  }

  return this.api.post<any[]>(
    '/api/orcamentos/Lookups/Etapas',
    body
  );
}

  // Insumos (por empreendimento, apenas de abastecimento)
  listarInsumos(empreendimentoId: string, pesquisa: string = '', valorSelecionado: string = '') {
    const body: Record<string, unknown> = {
      pesquisa,
      valorSelecionado,
      empreendimentoId,
      somenteInsumosDeAbastecimento: true
    };
    return this.api.post<LookupItem[]>(
      '/api/suprimentos/Lookups/Insumos',
      body
    );
  }
consultarUltimoNumeroBico(bombaId: string, bicoId: string) {
  return this.api.get<number>(
    `/api/frotas/Abastecimentos/ConsultaUltimoNumeroBico?bombaId=${bombaId}&bicoId=${bicoId}`
  );
}

listarFornecedores(pesquisa: string = '', valorSelecionado: string = '') {
  return this.api.post<any[]>(
    '/api/cadastros/Lookups/Pessoas',
    {
      pesquisa,
      valorSelecionado,
      tipoPessoa: 'Fornecedor'
    }
  );
}
  // Blocos (por empreendimento)
  listarBlocos(empreendimentoId: string, pesquisa: string = '', valorSelecionado: string = '') {
    const body: Record<string, unknown> = {
      pesquisa,
      valorSelecionado,
      empreendimentoId
    };
    return this.api.post<LookupItem[]>(
      '/api/cadastros/Lookups/Blocos',
      body
    );
  }

  // Blocos (por empreendimento) - Abastecimento Próprio/Legado
listarBlocosProprio(empreendimentoId: string) {
  return this.api.post(
    '/api/cadastros/Lookups/Unidades',
    {

   empreendimentoId: empreendimentoId,
   pesquisa: "",
   valorSelecionado: ""

    }
  );
}
}
