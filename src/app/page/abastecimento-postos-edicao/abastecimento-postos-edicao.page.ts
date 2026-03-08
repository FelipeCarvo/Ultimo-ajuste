import { Component, OnInit } from '@angular/core';
import { PopoverController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { format, parseISO } from 'date-fns';
import { forkJoin, of } from 'rxjs';
import { CalendarPopoverComponent } from '../../components/calendar-popover/calendar-popover.component';
import { AbastecimentoService } from '../../services/abastecimento.service';

type LookupId = string | number;
type LookupItem = {
  id: LookupId;
  descricao?: string;
  planoContasPadraoId?: LookupId | null;
  [key: string]: unknown;
};

@Component({
  selector: 'app-abastecimento-postos-edicao',
  templateUrl: './abastecimento-postos-edicao.page.html',
  styleUrls: ['./abastecimento-postos-edicao.page.scss'],
  standalone: false
})
export class AbastecimentoPostosEdicaoPage implements OnInit {
  dtRetirada: string | null = null;
  hodometroData: string | null = null;
  nCtlPostoData: string | null = null;
  equipamento: LookupId | null = null;
  empreendimento: LookupId | null = null;
  private empreendimentoCod: LookupId | null = null;
  private empreendimentoDesc: string | null = null;
  empresa: LookupId | null = null;
  fornecedor: LookupId | null = null;
  centroDespesas: LookupId | null = null;
  planoContasPadraoId: string | null = null;
  etapa: LookupId | null = null;
  insumo: LookupId | null = null;
  observacao: string = '';
  numeroControlePosto: string = '';
  bloco: LookupId | null = null;
  qtdRetirada: number | null = null;
  total: number | null = null;
  hodometro: number | null = null;
  horimetro: number | null = null;
  retorno: boolean = true;
  estoque: boolean = false;
  equipamentos: LookupItem[] = [];
  empreendimentos: LookupItem[] = [];
  empresas: LookupItem[] = [];
  fornecedores: LookupItem[] = [];
  centrosDespesas: LookupItem[] = [];
  etapas: LookupItem[] = [];
  insumos: LookupItem[] = [];
  blocos: LookupItem[] = [];


  private ultimoAbastecimentoIdCarregado: string | null = null;

  ionViewWillLeave() {
    this.ultimoAbastecimentoIdCarregado = null;
  }

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router,
    private route: ActivatedRoute,
    private abastecimentoService: AbastecimentoService,
    private toastCtrl: ToastController
  ) {}

  private async mostrarToastSucesso(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  compareLookupId = (a: LookupId | null, b: LookupId | null): boolean => {
    if (a === null || typeof a === 'undefined' || b === null || typeof b === 'undefined') {
      return a === b;
    }
    return String(a) === String(b);
  };

  ngOnInit() {
    this.abastecimentoService.listarEquipamentosMobile().subscribe({
      next: dados => {
        this.equipamentos = dados;
      },
      error: () => {
      }
    });
    this.abastecimentoService.listarEmpreendimentos().subscribe({
      next: dados => {
        this.empreendimentos = dados;
        this.resolverEmpreendimentoPendenteECarregarDependencias();
      },
      error: err => {}
    });
    this.abastecimentoService.listarEmpresas().subscribe({
      next: dados => {
        this.empresas = dados;
        this.resolverEmpresaPendente();
      },
      error: err => {}
    });
    this.abastecimentoService.listarFornecedores().subscribe({
      next: dados => {
        this.fornecedores = dados;
      },
      error: err => {}
    });
    this.centrosDespesas = [];
  }

  ionViewWillEnter() {
    const navState = this.getNavigationState();

    if (navState.mode === 'novo' || (!navState.item && !navState.abastecimentoId)) {
      this.resetForm();
      this.ultimoAbastecimentoIdCarregado = null;
      return;
    }

    this.resetForm();

    this.resolverEmpresaPendente();
    this.resolverEmpreendimentoPendenteECarregarDependencias();
    if (this.isGuid(this.empreendimento)) {
      this.carregarEtapas({ empreendimentoId: this.empreendimento });
      this.carregarInsumos(this.empreendimento);
      this.carregarBlocos(this.empreendimento, this.bloco ?? undefined);
    }

    if (navState.abastecimentoId) {
      this.ultimoAbastecimentoIdCarregado = navState.abastecimentoId;
      this.abastecimentoService.consultarAbastecimentoPostoPorId(navState.abastecimentoId).subscribe({
        next: (dados) => {
          let detalhe = null;
          if (Array.isArray(dados) && dados.length > 0) {
            detalhe = dados.find((item) => {
              const obj = item as Record<string, any>;
              const id = obj['abastecimentoId'] || obj['AbastecimentoId'] || obj['id'] || obj['Id'];
              return id === navState.abastecimentoId;
            }) || dados[0];
          } else if (dados && typeof dados === 'object') {
            detalhe = dados;
          }
          if (!detalhe) {
            return;
          }
          this.preencherFormulario(detalhe);
          this.resolverEmpresaPendente();
          this.resolverEmpreendimentoPendenteECarregarDependencias();
          if (this.isGuid(this.empreendimento)) {
            this.carregarEtapas({ empreendimentoId: this.empreendimento });
            this.carregarInsumos(this.empreendimento);
            this.carregarBlocos(this.empreendimento, this.bloco ?? undefined);
          }
          if (!this.centroDespesas && this.insumo) {
            this.onInsumoChange(this.insumo);
          }
        },
        error: (err) => {}
      });
    }
  }

  private resetForm() {
    this.dtRetirada = null;
    this.hodometroData = null;
    this.nCtlPostoData = null;

    this.equipamento = null;
    this.empreendimento = null;
    this.empreendimentoCod = null;
    this.empreendimentoDesc = null;
    this.empresa = null;
    this.fornecedor = null;
    this.centroDespesas = null;
    this.planoContasPadraoId = null;
    this.etapa = null;
    this.insumo = null;
    this.observacao = '';
    this.numeroControlePosto = '';
    this.bloco = null;
    this.qtdRetirada = null;
    this.total = null;
    this.hodometro = null;
    this.horimetro = null;
    this.retorno = true;
    this.estoque = false;
    this.centrosDespesas = [];
    this.etapas = [];
    this.insumos = [];
    this.blocos = [];
  }

  private isGuid(value: LookupId | null): value is string {
    if (typeof value !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private resolverEmpreendimentoPendenteECarregarDependencias() {
    // Se já é GUID, não precisa resolver.
    if (this.isGuid(this.empreendimento)) return;

    // Tenta resolver a partir do código/descrição vindos do item da pesquisa.
    if (!this.empreendimentoCod && !this.empreendimentoDesc) return;
    if (!Array.isArray(this.empreendimentos) || this.empreendimentos.length === 0) return;

    const codStr = this.empreendimentoCod !== null && typeof this.empreendimentoCod !== 'undefined'
      ? String(this.empreendimentoCod)
      : null;

    const encontrado = this.empreendimentos.find((emp) => {
      const empObj = emp as Record<string, unknown>;
      const candidatosCodigo = [
        empObj['emprdCod'],
        empObj['codigo'],
        empObj['cod'],
        empObj['codigoEmpreendimento'],
        empObj['emprCod'],
      ].filter(v => v !== null && typeof v !== 'undefined');

      const bateCodigo = codStr
        ? candidatosCodigo.some(v => String(v) === codStr)
        : false;

      if (bateCodigo) return true;

      if (this.empreendimentoDesc) {
        const desc = String(emp.descricao ?? emp.nome ?? emp.label ?? '').trim();
        return desc.length > 0 && desc === this.empreendimentoDesc;
      }

      return false;
    });

    if (encontrado?.id) {
      this.empreendimento = encontrado.id;
      // Agora que temos GUID, carrega dependências
      this.carregarEtapas({ empreendimentoId: this.empreendimento });
      this.carregarInsumos(this.empreendimento);
      this.carregarBlocos(this.empreendimento, this.bloco ?? undefined);
    }
  }

  private resolverEmpresaPendente() {
    // Se já é GUID, não precisa resolver.
    if (this.isGuid(this.empresa)) return;

    // Só tenta resolver se veio algum valor e já temos lookup carregado.
    if (this.empresa === null || typeof this.empresa === 'undefined') return;
    if (!Array.isArray(this.empresas) || this.empresas.length === 0) return;

    const codStr = String(this.empresa);

    const encontrado = this.empresas.find((emp) => {
      const empObj = emp as Record<string, unknown>;
      const candidatosCodigo = [
        // Alguns backends expõem esse código como "entidade".
        empObj['entidade'],
        empObj['entidadeCod'],
        empObj['empresaCod'],
        empObj['codigo'],
        empObj['cod'],
        empObj['idCod'],
      ].filter(v => v !== null && typeof v !== 'undefined');

      if (candidatosCodigo.some(v => String(v) === codStr)) {
        return true;
      }

      const descricao = String(emp.descricao ?? empObj['nome'] ?? empObj['label'] ?? '').trim();
      const matchCodigoDescricao = descricao.match(/^\s*(\d+)/);
      return matchCodigoDescricao?.[1] === codStr;
    });

    if (encontrado?.id) {
      this.empresa = encontrado.id;
    }
  }

  private getNavigationState(): { mode: string | null; item: unknown | null; abastecimentoId: string | null } {
    const currentNav = this.router.getCurrentNavigation();
    const stateFromNav = currentNav?.extras?.state as { [key: string]: unknown } | undefined;
    const stateFromHistory = history.state as { [key: string]: unknown } | undefined;
    const idFromRoute = this.route?.snapshot?.paramMap?.get('id');

    const modeRaw = (stateFromNav?.['mode'] ?? stateFromHistory?.['mode']) as unknown;
    const mode = modeRaw !== null && typeof modeRaw !== 'undefined' ? String(modeRaw) : null;
    const item = (stateFromNav?.['item'] ?? stateFromHistory?.['item']) as unknown | null;
    const abastecimentoIdRaw = (
      idFromRoute ??
      stateFromNav?.['abastecimentoId'] ??
      stateFromHistory?.['abastecimentoId'] ??
      (item && this.getItemValue(item, [
        'abastecimentoId',
        'AbastecimentoId',
        'idAbastecimento',
        'IdAbastecimento',
        'id',
        'Id'
      ]))
    ) as unknown;
    const abastecimentoId = abastecimentoIdRaw !== null && typeof abastecimentoIdRaw !== 'undefined' ? String(abastecimentoIdRaw) : null;
    return { mode, item, abastecimentoId };
  }

  private getItemValue(item: unknown, keys: string[]): unknown {
    if (!item || typeof item !== 'object') return undefined;
    const obj = item as { [key: string]: unknown };
    for (const k of keys) {
      const v = obj[k];
      if (v !== null && typeof v !== 'undefined') return v;
    }
    return undefined;
  }

  private preencherFormulario(item: unknown, options?: { onlyIfEmpty?: boolean }) {
    const onlyIfEmpty = options?.onlyIfEmpty === true;
    const shouldSet = (current: unknown): boolean => {
      if (!onlyIfEmpty) return true;
      return current === null || typeof current === 'undefined' || current === '';
    };

    const fornecedorRaw = this.getItemValue(item, ['fornecedorId', 'IdFornecedor', 'idFornecedor']);
    if (shouldSet(this.fornecedor) && (typeof fornecedorRaw === 'string' || typeof fornecedorRaw === 'number')) {
      this.fornecedor = fornecedorRaw;
    }

    const equipamentoRaw = this.getItemValue(item, ['equipamentoId', 'IdEquipamento', 'idEquipamento']);
    if (shouldSet(this.equipamento) && (typeof equipamentoRaw === 'string' || typeof equipamentoRaw === 'number')) {
      this.equipamento = equipamentoRaw;
    }

    // Empresa: o select espera GUID (emp.id). Alguns retornos trazem apenas código numérico (ex.: entidade=0),
    // então evitamos setar esse "0" para não quebrar a seleção.
    const empresaIdRaw = this.getItemValue(item, [
      'empresaId',
      'IdEmpresa',
      'idEmpresa',
      'entidadeId',
      'EntidadeId',
      'idEntidade',
      'IdEntidade'
    ]);
    let empresaValue: LookupId | null = null;
    if (shouldSet(this.empresa) && (typeof empresaIdRaw === 'string' || typeof empresaIdRaw === 'number')) {
      empresaValue = empresaIdRaw;
    }
    // Fallback: código numérico (apenas se for diferente de 0) para tentar resolver via lookup.
    if (shouldSet(this.empresa)) {
      const empresaCodRaw = this.getItemValue(item, ['entidadeCod', 'empresaCod', 'entidade', 'EmpresaCod', 'EntidadeCod']);
      if (typeof empresaCodRaw === 'number' && empresaCodRaw !== 0) {
        empresaValue = empresaCodRaw;
      } else if (typeof empresaCodRaw === 'string') {
        const trimmed = empresaCodRaw.trim();
        if (trimmed !== '' && trimmed !== '0') {
          empresaValue = trimmed;
        }
      }
    }
    if (empresaValue && this.empresas && Array.isArray(this.empresas) && this.empresas.length > 0) {
      const isGuid = (val: unknown) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      if (!isGuid(empresaValue)) {
        const codStr = String(empresaValue).trim();
        const encontrado = this.empresas.find((emp) => {
          const empObj = emp as Record<string, unknown>;
          if (typeof empObj['descricao'] === 'string') {
            const match = empObj['descricao'].match(/^\s*(\d+)/);
            if (match && match[1] && match[1] === codStr) {
              return true;
            }
          }
          return false;
        });
        if (encontrado?.id) {
          this.empresa = encontrado.id;
        } else {
          this.empresa = empresaValue;
        }
      } else {
        this.empresa = empresaValue;
      }
    } else if (empresaValue) {
      this.empresa = empresaValue;
    }

    // IMPORTANTE: não usar emprdCod (numérico) como ID do select (o select espera GUID).
    // Tenta pegar o GUID normalmente
    let empreendimentoRaw = this.getItemValue(item, [
      'empreendimentoId', 'IdEmprd', 'idEmprd', 'emprdId', 'emprdID', 'EmprdId', 'EmprdID'
    ]);
    // Se não veio GUID, tenta mapear pelo código (emprdCod)
    if (!empreendimentoRaw) {
      const cod = this.getItemValue(item, ['emprdCod', 'codigo', 'codigoEmpreendimento', 'cod', 'codigoEmpreend']);
      if (cod) {
        const encontrado = this.empreendimentos.find(emp => {
          const empObj = emp as Record<string, unknown>;
          const candidatosCodigo = [
            empObj['emprdCod'], empObj['codigo'], empObj['cod'], empObj['codigoEmpreendimento'], empObj['emprCod']
          ].filter(v => v !== null && typeof v !== 'undefined');
          return candidatosCodigo.some(v => String(v) === String(cod));
        });
        if (encontrado) {
          empreendimentoRaw = encontrado.id;
        }
      }
    }
    if (typeof empreendimentoRaw === 'string' && empreendimentoRaw.trim() !== '') {
      this.empreendimento = empreendimentoRaw;
    } else if (typeof empreendimentoRaw === 'number') {
      this.empreendimento = empreendimentoRaw;
    } else {
      this.empreendimento = null;
    }

    const empreendimentoCodRaw = this.getItemValue(item, ['emprdCod', 'empreendimentoCod', 'codigoEmpreendimento', 'emprCod']);
    if (shouldSet(this.empreendimentoCod) && (typeof empreendimentoCodRaw === 'string' || typeof empreendimentoCodRaw === 'number')) {
      this.empreendimentoCod = empreendimentoCodRaw;
    }

    const emprDesc = this.getItemValue(item, ['emprDesc', 'empreendimentoDesc', 'empreendimentoDescricao']);
    if (shouldSet(this.empreendimentoDesc) && typeof emprDesc === 'string') {
      this.empreendimentoDesc = emprDesc;
    }

    const etapaRaw = this.getItemValue(item, ['etapaId', 'IdEtapa', 'idEtapa']);
    if (shouldSet(this.etapa) && (typeof etapaRaw === 'string' || typeof etapaRaw === 'number')) {
      this.etapa = etapaRaw;
    }

    const insumoRaw = this.getItemValue(item, ['insumoId', 'IdInsumo', 'idInsumo']);
    if (shouldSet(this.insumo) && (typeof insumoRaw === 'string' || typeof insumoRaw === 'number')) {
      this.insumo = insumoRaw;
    }

    const blocoRaw = this.getItemValue(item, ['blocoId', 'IdBloco', 'idBloco']);
    if (shouldSet(this.bloco) && (typeof blocoRaw === 'string' || typeof blocoRaw === 'number')) {
      this.bloco = blocoRaw;
    }

    const centroRaw = this.getItemValue(item, [
      'centroDespesaId',
      'IdCentroDespesa',
      'idCentroDespesa',
      'IdPlanoContasDespesa',
      'idPlanoContasDespesa',
      'planoContasDespesaId',
      'planoContasId',
      'planoContasDespesaID',
      'planoContasID'
    ]);
    if (shouldSet(this.centroDespesas) && (typeof centroRaw === 'string' || typeof centroRaw === 'number')) {
      this.centroDespesas = centroRaw;
    }

    const obs = this.getItemValue(item, ['observacao', 'Observacao']);
    if (shouldSet(this.observacao) && typeof obs === 'string') this.observacao = obs;

    const data = this.getItemValue(item, ['dataAbastecimento', 'DataAbastecimento', 'data']);
    if (shouldSet(this.dtRetirada) && typeof data === 'string') this.dtRetirada = data;

    const qtd = this.getItemValue(item, ['quantidade', 'QtdInsumo']);
    if (shouldSet(this.qtdRetirada)) this.qtdRetirada = typeof qtd === 'number' ? qtd : (typeof qtd === 'string' ? Number(qtd) : null);

    const total = this.getItemValue(item, ['valorTotal', 'TotalAbastecimentoPosto', 'total']);
    if (shouldSet(this.total)) this.total = typeof total === 'number' ? total : (typeof total === 'string' ? Number(total) : null);

    const odometro = this.getItemValue(item, ['odometro', 'Odometro', 'hodometro']);
    if (shouldSet(this.hodometro)) this.hodometro = typeof odometro === 'number' ? odometro : (typeof odometro === 'string' ? Number(odometro) : null);

    const horimetro = this.getItemValue(item, ['horimetro', 'Horimetro']);
    if (shouldSet(this.horimetro)) this.horimetro = typeof horimetro === 'number' ? horimetro : (typeof horimetro === 'string' ? Number(horimetro) : null);

    const voucher = this.getItemValue(item, ['NumeroControlePosto', 'numeroControlePosto', 'numVoucher', 'voucher']);
    if (shouldSet(this.numeroControlePosto)) this.numeroControlePosto = typeof voucher === 'string' || typeof voucher === 'number' ? String(voucher) : '';

    const retorno = this.getItemValue(item, ['Retorno', 'retorno', 'numRetornoPosto']);
    const retornoFlag = this.parseBooleanFlag(retorno);
    if (retornoFlag !== null) {
      this.retorno = retornoFlag;
    }

    const estoque = this.getItemValue(item, ['Estoque', 'estoque']);
    const estoqueFlag = this.parseBooleanFlag(estoque);
    if (estoqueFlag !== null) {
      this.estoque = estoqueFlag;
    }
  }

  private getCentroDespesaValue(item: unknown): string | null {
    if (!item || typeof item !== 'object') return null;
    const obj = item as { [key: string]: unknown };
    const value =
      obj['id'] ??
      obj['Id'] ??
      obj['planoContasId'] ??
      obj['PlanoContasId'] ??
      obj['planoContasDespesaId'] ??
      obj['PlanoContasDespesaId'] ??
      obj['planoContasDespesaID'] ??
      obj['PlanoContasDespesaID'] ??
      obj['idPlanoContasDespesa'] ??
      obj['IdPlanoContasDespesa'];
    return value !== null && typeof value !== 'undefined' ? String(value) : null;
  }

  private getCentroDespesaDescricao(item: unknown): string {
    if (!item || typeof item !== 'object') return '';
    const obj = item as { [key: string]: unknown };
    const desc =
      obj['descricao'] ??
      obj['planoContasDescr'] ??
      obj['PlanoContasDescr'] ??
      obj['nome'] ??
      obj['label'];
    return desc !== null && typeof desc !== 'undefined' ? String(desc).trim() : '';
  }

  private isCentroDespesaSelecionavel(item: unknown): boolean {
    if (!item || typeof item !== 'object') return false;
    const obj = item as Record<string, unknown>;

    // Se o backend/lookup já expõe flags, respeita.
    const analitico = obj['analitico'] ?? obj['isAnalitico'] ?? obj['Analitico'];
    if (typeof analitico === 'boolean') return analitico;
    if (analitico === 1 || analitico === '1') return true;
    if (analitico === 0 || analitico === '0') return false;

    const possuiFilhos = obj['possuiFilhos'] ?? obj['PossuiFilhos'] ?? obj['temFilhos'] ?? obj['TemFilhos'];
    if (possuiFilhos === true || possuiFilhos === 1 || possuiFilhos === '1') return false;

    const nivel = obj['nivel'] ?? obj['Nivel'] ?? obj['grau'] ?? obj['Grau'];
    if (typeof nivel === 'number') return nivel >= 3;
    if (typeof nivel === 'string' && nivel.trim() !== '' && !Number.isNaN(Number(nivel))) return Number(nivel) >= 3;

    // Heurística: itens agregadores costumam vir como "2 - DESPESAS".
    // Itens analíticos normalmente vêm com código (ex.: 03.03.0013 ...).
    const descricao = this.getCentroDespesaDescricao(item);
    const pareceAgrupador = /^\d+\s*-\s*.+$/i.test(descricao) && !/\d{2}\.\d{2}\./.test(descricao);
    return !pareceAgrupador;
  }

  private parseNumber(value: unknown): number | null {
    if (value === null || typeof value === 'undefined') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private parseBooleanFlag(value: unknown): boolean | null {
    if (value === null || typeof value === 'undefined') return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (!normalized) return null;
      if (['1', 'true', 's', 'sim', 'yes', 'y'].includes(normalized)) return true;
      if (['0', 'false', 'n', 'nao', 'não', 'no'].includes(normalized)) return false;
    }
    return null;
  }

  onEmpreendimentoChange(empreendimentoId: LookupId) {
    this.empreendimento = empreendimentoId;
    this.etapa = null;
    this.insumo = null;
    this.centroDespesas = null;
    this.carregarCentrosDespesas(this.planoContasPadraoId ?? undefined);
    this.carregarEtapas({ empreendimentoId }, () => {
      this.carregarInsumos(empreendimentoId);
      this.carregarBlocos(empreendimentoId);
    });
  }

  onCentroDespesaChange(valor: LookupId | null) {
  }

  onInsumoChange(insumoId: LookupId) {
    this.insumo = insumoId;
    const centroDespesaAnterior = this.centroDespesas;
    const insumoSelecionado = this.insumos.find(i => String(i.id ?? i.insumoId) === String(insumoId));
    const insumoSelecionadoObj = (insumoSelecionado ?? {}) as Record<string, unknown>;
    const planoContasPadraoId = insumoSelecionado?.planoContasPadraoId
      ?? insumoSelecionadoObj['planoContasPadraoID']
      ?? insumoSelecionadoObj['planoContasId'];
    this.planoContasPadraoId = planoContasPadraoId ? String(planoContasPadraoId) : null;
    this.carregarCentrosDespesas(this.planoContasPadraoId ?? undefined, centroDespesaAnterior);
    if (this.empreendimento) {
      this.carregarEtapas({ empreendimentoId: this.empreendimento });
    }
  }
  onEmpresaChange(empresaId: LookupId) {
    this.empresa = empresaId;
    this.centroDespesas = null;
    this.carregarCentrosDespesas(this.planoContasPadraoId ?? undefined);
  }
  carregarCentrosDespesas(lookupKey?: string, preservarSelecao?: LookupId | null) {

    const selecionadoStr = preservarSelecao !== null && typeof preservarSelecao !== 'undefined'
      ? String(preservarSelecao)
      : '';

    const obsPrincipal = lookupKey
      ? this.abastecimentoService.listarCentrosDespesas('', '', lookupKey)
      : this.abastecimentoService.listarCentrosDespesas('', selecionadoStr, undefined);

    const obsSelecionado = (lookupKey && selecionadoStr)
      ? this.abastecimentoService.listarCentrosDespesas('', selecionadoStr, undefined)
      : of([] as unknown[]);

    forkJoin({ principal: obsPrincipal, selecionado: obsSelecionado }).subscribe({
      next: ({ principal, selecionado }) => {
        const listaPrincipal = Array.isArray(principal) ? principal : [];
        const listaSelecionado = Array.isArray(selecionado) ? selecionado : [];
        const jaTem = new Set(listaPrincipal.map(cd => this.getCentroDespesaValue(cd)).filter(Boolean) as string[]);
        const extras = listaSelecionado.filter(cd => {
          const id = this.getCentroDespesaValue(cd);
          return !!id && !jaTem.has(id);
        });
        this.centrosDespesas = [...listaPrincipal, ...extras];
        if (selecionadoStr) {
          const existe = this.centrosDespesas.some(cd => this.getCentroDespesaValue(cd) === selecionadoStr);
          this.centroDespesas = existe ? preservarSelecao! : null;
        }
      },
      error: (err) => {
        this.centrosDespesas = [];
      }
    });
  }

  carregarEtapas(
    params: { empreendimentoId: LookupId; mostrarDI?: boolean; insumoId?: LookupId },
    callback?: () => void
  ) {
    if (!params.empreendimentoId) {
      this.etapas = [];
      if (callback) callback();
      return;
    }

    const serviceParams = {
      empreendimentoId: String(params.empreendimentoId),
      pesquisa: '',
      mostrarDI: params.mostrarDI || true,
      insumoId: typeof params.insumoId !== 'undefined' && params.insumoId !== null
        ? String(params.insumoId)
        : undefined
    };

    this.abastecimentoService
      .listarEtapas(serviceParams)
      .subscribe(
        dados => {
          if (Array.isArray(dados) && dados.length > 0) {
            this.etapas = dados;
          } else {
            this.etapas = [];
          }
          if (callback) callback();
        },
        () => {
          this.etapas = [];
          if (callback) callback();
        }
      );
  }

  carregarInsumos(empreendimentoId: LookupId) {
    if (!empreendimentoId) {
      this.insumos = [];
      return;
    }
    this.abastecimentoService.listarInsumos(String(empreendimentoId)).subscribe(dados => {
      this.insumos = dados;
      if (this.insumo !== null && typeof this.insumo !== 'undefined') {
        this.onInsumoChange(this.insumo);
      }
    });
  }

  carregarBlocos(empreendimentoId: LookupId, valorSelecionado?: LookupId) {
    if (!empreendimentoId) {
      this.blocos = [];
      return;
    }
    const valorSel = typeof valorSelecionado !== 'undefined' && valorSelecionado !== null
      ? String(valorSelecionado)
      : '';
    this.abastecimentoService.listarBlocos(String(empreendimentoId), '', valorSel).subscribe(dados => {
      this.blocos = dados;
    });
  }

  onBack() {
    this.router.navigate(['/tabs/abastecimento-postos-pesquisa']);
  }

  async openCalendar(
    event: Event,
    fieldName: 'dtRetirada' | 'hodometroData' | 'nCtlPostoData'
  ) {
    const popover = await this.popoverCtrl.create({
      component: CalendarPopoverComponent,
      event,
      backdropDismiss: true,
      translucent: true,
      cssClass: 'calendar-popover'
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.cleared) {
      this[fieldName] = null;
      return;
    }

    if (data?.date) {
      this[fieldName] = data.date;
    }
  }

  formatDate(isoString: string | null): string {
    if (!isoString) return '';
    try {
      return format(parseISO(isoString), 'dd/MM/yyyy');
    } catch {
      return '';
    }
  }

  confirmar() {
    if (!this.dtRetirada) {
      alert('⚠️ Data obrigatória');
      return;
    }

    // Formatar data para ISO padrão (ex: 2026-01-26T00:00:00.000Z)
    const d = new Date(this.dtRetirada);
    if (Number.isNaN(d.getTime())) {
      alert('⚠️ Data inválida');
      return;
    }
    const dataFormatada = d.toISOString();

    // Validação Quantidade / Total
    const qtdNum = this.parseNumber(this.qtdRetirada);
    if (qtdNum === null || qtdNum <= 0) {
      alert('⚠️ Informe a quantidade (maior que zero).');
      return;
    }
    const totalNum = this.parseNumber(this.total);
    if (totalNum === null || totalNum <= 0) {
      alert('⚠️ Informe o total (maior que zero).');
      return;
    }

    // Validação do Centro de Despesa
    if (!this.centrosDespesas || !Array.isArray(this.centrosDespesas)) {
      alert('Centro de Despesa não carregado');
      return;
    }
    const centroDespesaSelecionado = this.centrosDespesas.find(cd => this.getCentroDespesaValue(cd) === String(this.centroDespesas ?? ''));

    if (!this.centroDespesas || !centroDespesaSelecionado) {
      alert('Selecione um Centro de Despesa válido antes de confirmar!');
      this.centroDespesas = null;
      return;
    }

    if (!this.isCentroDespesaSelecionavel(centroDespesaSelecionado)) {
      const desc = this.getCentroDespesaDescricao(centroDespesaSelecionado);
      alert(
        '⚠️ Centro de Despesa inválido para o Insumo.\n' +
          'Selecione um Centro de Despesa analítico (não agrupador).\n\n' +
          (desc ? `Selecionado: ${desc}` : '')
      );
      return;
    }

    // Montar payload conforme documentação
    const qtd = qtdNum;
    const total = totalNum;
    // Corrigir envio do bloco zerado
    let blocoValido = this.bloco ?? null;
    if (blocoValido === '00000000-0000-0000-0000-000000000000') {
      blocoValido = null;
    }
      const payload: Record<string, unknown> = {
        TpAbastecimento: 1,
        DataAbastecimento: dataFormatada,
        IdFornecedor: this.fornecedor ?? null,
        IdEquipamento: this.equipamento ?? null,
        IdEmprd: this.empreendimento ?? null,
        IdEmpresa: this.empresa ?? null,
        IdCentroDespesa: this.centroDespesas ?? null,
        IdEtapa: this.etapa ?? null,
        IdInsumo: this.insumo ?? null,
        IdBloco: blocoValido ?? null,
        QtdInsumo: qtd,
        TotalAbastecimentoPosto: total,
        Origem: 3,
        Observacao: this.observacao ?? '',
        Odometro: this.hodometro ?? null,
        Horimetro: this.horimetro ?? null,
        NumeroControlePosto: this.numeroControlePosto ?? ''  ,
        Retorno: (this.retorno ?? true) ? 1 : 0,
        Estoque: (this.estoque ?? false) ? 1 : 0,
      };
    if (this.ultimoAbastecimentoIdCarregado) {
      payload['IdAbastecimento'] = this.ultimoAbastecimentoIdCarregado;
    }
    Object.keys(payload).forEach(key => (payload[key] === null || payload[key] === undefined) && delete payload[key]);

    this.abastecimentoService.gravarAbastecimento(payload).subscribe({
      next: (res) => {
        this.mostrarToastSucesso('Abastecimento gravado com sucesso');
        this.router.navigate(['/tabs/abastecimento-postos']);
      },
      error: (err) => {
        alert('Erro ao gravar abastecimento.\n\nNão foi possível concluir a operação.');
      }
    });
  }
}
