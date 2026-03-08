import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CalendarPopoverComponent } from '../../components/calendar-popover/calendar-popover.component';
import { AbastecimentoService } from '../../services/abastecimento.service';
import { InsumoService } from '../../services/insumo.service';

type IonicChangeEvent<T = unknown> = CustomEvent<{ value: T }>;

type EmpreendimentoDto = {
  id: string | number;
  descricao?: string;
  nome?: string;
  empreendimentoDesc?: string;
  empreendimentoNome?: string;
  emprdCod?: number | null;
};

type BombaDto = {
  bombaId: string;
  empreendimentoId?: string;
  bombaDescricao?: string;
  bombaCod?: string;
};

type EquipamentoDto = {
  id: string;
  descricao: string;
  tipoControle?: string;
};
type BicoDto = { bicoId: string; bicoDescricao?: string; bicoCdg?: string | number };

type DestinoDto = {
  destino: string;
  destinoTipo?: string;
  destinoDesc?: string;
  destinoid?: string;
};
//fazer a chamada dele
type EtapaDto = { id: string; descricao: string };
type InsumoDto = { insumoId: string; insumoDescr: string };
type AplicacaoDto = { aplicacaoId: string; aplicacaoDescr: string };
type MotoristaOperadorDto = {
  fornId?: string;
  id?: string | number;
  colaboradorId?: string;
  colaColaboradorId?: string;
  colaboradorCod?: string | number;
  colaboradorNome: string;
  [key: string]: unknown;
};
type ColaboradorFrentistaDto = { id: string; descricao: string };
type TipoPrevAbastValor = 'T' | 'R';

type CamposPersistidosLocal = {
  tipoPrevAbast: TipoPrevAbastValor | null;
  blocoSelecionado: string | null;
  blocoDescricao?: string | null;
  etapaSelecionada: string | null;
  etapaDescricao?: string | null;
  aplicacaoSelecionada: string | null;
  aplicacaoDescricao?: string | null;
  horimetroAtual?: number | null;
  odometroAtual?: number | null;
  atualizadoEm: string;
};


//
type BlocoDto = {
  id?: string | number;
  blocoId?: string;
  BlocoId?: string;
  nome?: string;
  nomeBloco?: string;
  descricao?: string;
  Descricao?: string;
};

@Component({
  standalone: false,
  selector: 'app-abastecimento-proprio-edicao',
  templateUrl: './abastecimento-proprio-edicao.page.html',
  styleUrls: ['./abastecimento-proprio-edicao.page.scss'],
})
export class AbastecimentoProprioEdicaoPage implements OnInit {
  private readonly cacheCamposKey = 'abastecimento_proprio_campos_cache_v1';

  // Novos campos para exibição completa
  public fornecedorRazao: string | null = null;
  public placa: string | null = null;
  public modelo: string | null = null;
  public equipamentoNome: string | null = null;
  public empresaNome: string | null = null;
  public centroDespesaDescr: string | null = null;
  public emprDesc: string | null = null;
  // Novos campos compatíveis com backend
  public frentistaCod: string | null = null;
  public frentistalNome: string | null = null;
  public frentistaId: string | null = null;
  public emprdCod: number | null = null;
  public emprdId: string | null = null;

// =====================================================
//  FUNÇÕES DE MUDANÇA DE CAMPOS (COM AUTOCOMPLETE)
// =====================================================

// =======================
// BOMBA
// =======================

onBombaChange(value: string | null) {
  const bombaId = value ? String(value) : null;

  this.bombaSelecionada = bombaId;

  // Limpa dependentes
  this.bicoSelecionado = null;
  this.bicos = [];

  this.destinoSelecionado = null;
  this.destinos = [];

  this.insumoSelecionado = null;
  this.insumos = [];

  this.empreendimentoSelecionado = null;
  this.empreendimentos = [];

  if (!bombaId) return;

  // Consulta bomba para pegar Emprd
  this.abastecimentoService.consultarBomba(bombaId).subscribe({
  next: (bombas: any[]) => {

  const bomba = bombas?.[0]; // pega o primeiro item
  const emprdId = bomba?.empreendimentoId;

  this.emprdId = emprdId ? String(emprdId) : null;

  if (emprdId) {
    this.carregarEmpreendimentoPorBomba(emprdId);
  }
      //Carrega dependências
      this.carregarBicos(bombaId);
      this.carregarDestinos(bombaId);
      this.carregarInsumos(bombaId);

    },
    error: () => {
      this.toast('Erro ao consultar bomba', 'danger');
    }
  });
}

/* DAPTADOR AUTOCOMPLETE BOMBA */
selecionarBomba(item: any) {
  const bombaId = item?.id ?? null;
  this.onBombaChange(bombaId);
}
// =======================
// BICO
// =======================

onBicoChange(value: string | null) {
  this.bicoSelecionado = value ? String(value) : null;

  this.carregarUltimoNumeroBico(); // chama automaticamente
}

/* ADAPTADOR AUTOCOMPLETE BICO */
selecionarBico(item: any) {
  this.onBicoChange(item?.id ?? null);
}
selecionarEquipamento(item: any) {
  const equipamentoId = item?.id ?? null;
  this.onEquipamentoChange(equipamentoId);
}
// =======================
// DESTINO
// =======================
onDestinoChange(value: string | null) {
  this.destinoSelecionado = value ? String(value) : null;

  if (!this.equipamentoSelecionado) {
    this.destinoTravado = false;
  }

  if (!this.destinoSelecionado) return;

  const destinoObj = this.destinos.find(
    d => String(d.id) === String(this.destinoSelecionado)
  );

  if (!destinoObj) return;

  if (destinoObj.destinoTipo !== 'M') {
    this.equipamentoSelecionado = null;
    this.destinoTravado = false;
  }
}

/* ADAPTADOR AUTOCOMPLETE DESTINO */
selecionarDestino(item: any) {
  const destinoId = item?.id ?? null;
  this.onDestinoChange(destinoId);
}
// =======================
// ETAPA
// =======================

onEtapaChange(value: string | null) {
  this.etapaSelecionada = value ? String(value) : null;
}

/* ADAPTADOR AUTOCOMPLETE ETAPA */
selecionarEtapa(item: any) {
  this.onEtapaChange(item?.id ?? null);
}

// =======================
// INSUMO
// =======================

onInsumoChange(value: string | null) {
  this.insumoSelecionado = value ? String(value) : null;
  this.etapaSelecionada = null;
  this.etapas = [];
  this.aplicacaoSelecionada = null;
  this.aplicacoes = [];
  this.aplicacaoHabilitada = false;
  this.tipoPrevAbast = null;

  this.carregarEtapas();
  this.carregarAplicacoes();
}
/* ADAPTADOR AUTOCOMPLETE EMPREENDIMENTO */
selecionarEmpreendimento(item: any) {
  const empreendimentoId = item?.id ?? null;
  this.onEmpreendimentoChange(empreendimentoId);
}
/* ADAPTADOR AUTOCOMPLETE INSUMO */
selecionarInsumo(item: any) {
  this.onInsumoChange(item?.id ?? null);

}
/*  ADAPTADOR AUTOCOMPLETE TROCA/REPOSIÇÃO */
selecionarTipoPrevAbast(item: any) {
  this.tipoPrevAbast = this.normalizarTipoPrevAbast(item?.id);
}
/* ADAPTADOR AUTOCOMPLETE APLICAÇÃO */
aplicacaoSelecionada: any = null;

selecionarAplicacao(item: any) {
   this.aplicacaoSelecionada = item?.id ?? null;
}
/* ADAPTADOR AUTOCOMPLETE MOTORISTA */
selecionarMotoristaOperador(item: any) {
  this.motoristaOperadorSelecionado = item?.id ?? item?.fornId ?? null;
}
/* ADAPTADOR AUTOCOMPLETE FRENTISTA */
selecionarColaboradorFrentista(item: any) {
  this.colaboradorFrentistaSelecionado = item?.id ?? null;
}
/* ADAPTADOR AUTOCOMPLETE BLOCO */
selecionarBloco(item: any) {
  this.blocoSelecionado = item?.id ?? item?.blocoId ?? item?.BlocoId ?? item?.unidadeId ?? null;
}
    onMotoristaOperadorChange(event: Event) {
      const value = (event as CustomEvent).detail?.value;
      this.motoristaOperadorSelecionado = value as typeof this.motoristaOperadorSelecionado;
      this.logPayloadPreview();
    }

    onColaboradorFrentistaChange(event: Event) {
      const value = (event as CustomEvent).detail?.value;
      this.colaboradorFrentistaSelecionado = String(value ?? '');
      this.logPayloadPreview();
    }

    onBlocoChange(event: Event) {
      const value = (event as CustomEvent).detail?.value;
      this.blocoSelecionado = String(value ?? '');
    }
  // Blocos para select
  blocos: BlocoDto[] = [];
  blocoSelecionado: string | null = null;

  // Colaboradores/Frentistas
  colaboradoresFrentista: ColaboradorFrentistaDto[] = [];
  colaboradorFrentistaSelecionado: string | null = null;

  // Motoristas/Operadores
  motoristasOperadores: MotoristaOperadorDto[] = [];
  motoristaOperadorSelecionado: string | null = null;

tipoPrevAbast: TipoPrevAbastValor | null = null;

tiposPrevAbast = [
  { id: 'T', descricao: 'Troca' },
  { id: 'R', descricao: 'Reposição' }
];
  //aplicacaoSelecionada: string | null = null;
  aplicacoes: any[] = [];
  aplicacaoHabilitada = false;
  insumos: any[] = [];
  insumoSelecionado: string | null = null;
  etapas: { id: string; descricao: string }[] = [];
  etapaSelecionada: string | null = null;
  empreendimentos: EmpreendimentoDto[] = [];
  empreendimentoSelecionado: string | null = null;
  data: string | null = null;
  bombas: { id: string; descricao: string }[] = [];
  equipamentos: EquipamentoDto[] = [];
  bombaSelecionada: string | null = null;
  equipamentoSelecionado: string | null = null;
  destinoSelecionado: string | null = null;
  bicoSelecionado: string | null = null;
  bicos: any[] = [];
  destinos: any[] = [];
  quantidade: number | null = null;
  numBombaInicial: number | null = null;
  numBombaFinal: number | null = null;
  horimetroAtual: number | null = null;
  odometroAtual: number | null = null;
  horimetro: number | null = null;
  odometro: number | null = null;
  observacao: string = '';
  horaAbastecimento: string | null = null;
  carregando = false;


  // ID do abastecimento para edição
  abastecimentoId: string | null = null;
  // Dados do abastecimento para edição
  dadosAbastecimento: any = null;

  destinoTravado = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private abastecimentoService: AbastecimentoService,
    private insumoService: InsumoService,
    private toastCtrl: ToastController
  )
  {
    // Captura os dados passados via state (só funciona no construtor)
    const navigation = this.router.getCurrentNavigation();
    this.dadosAbastecimento = navigation?.extras?.state?.['abastecimento'];
  }

  private async toast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      icon: color === 'success' ? 'checkmark-circle-outline' : undefined,
    });
    await toast.present();
  }

ngOnInit() {
  this.carregarBombas();
  this.carregarMotoristasOperadores();
  this.carregarColaboradoresFrentista();
  this.carregarEquipamentos();

  if (!this.abastecimentoId) {
    const hoje = new Date();
    this.data = hoje.toISOString().split('T')[0];
  }
}

  // Carrega todos os empreendimentos disponíveis
  private carregarEmpreendimentos() {
    this.abastecimentoService.listarEmpresas().subscribe({
      next: (emps) => {
        this.empreendimentos = emps || [];
        // Garante que o empreendimento selecionado está na lista
        if (this.empreendimentoSelecionado && !this.empreendimentos.find(e => String(e.id) === String(this.empreendimentoSelecionado))) {
          // Adiciona um item fake apenas para manter o select funcionando
          this.empreendimentos.push({
            id: this.empreendimentoSelecionado,
            descricao: '[Selecionado anteriormente - não encontrado na lista]'
          });
        }
      },
      error: () => {
        this.empreendimentos = [];
        //
      },
    });
  }

  /**
   * Executa sempre que a página fica visível
   * Garante que ao voltar da navegação os dados sejam reprocessados se necessário
   */
  private paramMapSubscription: any;

  ionViewWillEnter() {
  if (this.paramMapSubscription) {
    this.paramMapSubscription.unsubscribe();
  }

  this.paramMapSubscription = this.route.paramMap.subscribe(params => {

    const id = params.get('id');

    // LIMPA SEMPRE PRIMEIRO
    this.limparFormulario();

    if (id) {
      // ===============================
      //  MODO EDIÇÃO
      // ===============================
      this.abastecimentoId = id;

      this.carregarBombas();

      this.abastecimentoService.listarEquipamentos().subscribe({
        next: (eqps) => {
          this.equipamentos = eqps || [];

          this.abastecimentoService
            .consultarAbastecimentoProprioPorId(id)
            .subscribe({
              next: (res: any) => {
                const dados = Array.isArray(res) ? res[0] : res;

                if (dados) {

                  const bombaId = dados.comboioBombaId;
                  const empreendimentoId = dados.emprdId;
                  const insumoId = dados.insumoId;

                  const promises: Promise<any>[] = [];

                  if (bombaId) {
                    promises.push(
                      this.abastecimentoService.listarBicos(bombaId)
                        .toPromise()
                        .then(bicos => {
                        this.bicos = (bicos || []).map(b => ({
                          id: b.bicoId,
                          descricao: b.bicoDescricao
                        }));
                      })
                    );

                    promises.push(
                      this.abastecimentoService.listarDestinos(bombaId)
                        .toPromise()
                        .then((destinos: any) => {
                          this.destinos = (destinos || []).map((d: any) => ({
                            id: d.destino,
                            descricao: d.destinoDesc,
                            destinoTipo: d.destinoTipo,
                            destinoId: d.destinoId ?? d.destinoid,
                            emprdId: d.emprdId,
                            emprdCod: d.emprdCod
                          }));
                        })
                    );

                    promises.push(
                      this.abastecimentoService.listarInsumosComboio(bombaId)
                        .toPromise()
                        .then((insumos: any) => {
                          this.insumos = (insumos || []).map((i: any) => ({
                            id: i.insumoId,
                            descricao: i.insumoDescr,
                            insumoDescr: i.insumoDescr
                          }));
                        })
                    );
                  }

                  if (empreendimentoId) {
                    promises.push(
                      this.abastecimentoService
                        .listarEtapas({
                          empreendimentoId: String(empreendimentoId),
                          pesquisa: '',
                          mostrarDI: true
                        })
                        .toPromise()
                        .then((etapas: any) => {

                          this.etapas = (etapas || []).map(e => ({
                            id: String(e.id),
                            descricao: e.descricao || e.nome
                          }));

                        })
                    );

                  }
                Promise.all(promises).then(() => {

                  this.preencherFormularioComDados(dados);
                });
                }
              },
              error: () => {
                this.limparFormulario();
              }
            });
        }
      });

    } else {

      this.abastecimentoId = null;

      const hoje = new Date();
      this.data = hoje.toISOString().split('T')[0];
    }

  });
}

  ngOnDestroy() {
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }
  }

  // Novos campos para exibição completa

  // Método auxiliar para buscar valor de campo por múltiplos nomes
  private getItemValue(item: any, keys: string[]): any {
    if (!item || typeof item !== 'object') return undefined;
    for (const k of keys) {
      const v = item[k];
      if (v !== null && typeof v !== 'undefined') return v;
    }
    return undefined;
  }

  private normalizarTipoPrevAbast(valor: unknown): TipoPrevAbastValor | null {
    const tipoNormalizado = String(valor ?? '').trim().toUpperCase();
    const tipoNumero = Number(valor);

    if (
      tipoNormalizado === 'T' ||
      tipoNormalizado.includes('TROCA') ||
      tipoNumero === 0 ||
      tipoNumero === 1
    ) {
      return 'T';
    }

    if (
      tipoNormalizado === 'R' ||
      tipoNormalizado.includes('REPOS') ||
      tipoNumero === 2
    ) {
      return 'R';
    }

    return null;
  }

  private obterTipoPrevAbastPayload(): number | undefined {
    if (!this.aplicacaoHabilitada || !this.tipoPrevAbast) {
      return undefined;
    }

    return this.tipoPrevAbast === 'T' ? 0 : 1;
  }

  private resolverMotoristaOperadorSelecionado(dados: any): string | null {
    if (!this.motoristasOperadores?.length) {
      return null;
    }

    const guidZerado = '00000000-0000-0000-0000-000000000000';
    const candidatosId = [
      this.getItemValue(dados, ['responsavelId', 'operadorSolicitanteId', 'colaboradorId', 'colaColaboradorId'])
    ]
      .filter((valor) => valor !== null && typeof valor !== 'undefined' && valor !== guidZerado)
      .map((valor) => String(valor));

    for (const candidatoId of candidatosId) {
      const encontradoPorId = this.motoristasOperadores.find((item) => {
        const ids = [item.id, item.colaboradorId, item.colaColaboradorId, item.fornId]
          .filter((valor) => valor !== null && typeof valor !== 'undefined')
          .map((valor) => String(valor));

        return ids.includes(candidatoId);
      });

      if (encontradoPorId?.id !== null && typeof encontradoPorId?.id !== 'undefined') {
        return String(encontradoPorId.id);
      }
    }

    const codigo = this.getItemValue(dados, ['responsavelCod', 'colaboradorCod']);
    if (codigo !== null && typeof codigo !== 'undefined') {
      const encontradoPorCodigo = this.motoristasOperadores.find(
        (item) => String(item.colaboradorCod ?? '') === String(codigo)
      );

      if (encontradoPorCodigo?.id !== null && typeof encontradoPorCodigo?.id !== 'undefined') {
        return String(encontradoPorCodigo.id);
      }
    }

    const nome = this.getItemValue(dados, ['responsavelNome', 'colaboradorNome']);
    if (typeof nome === 'string' && nome.trim()) {
      const nomeNormalizado = nome.trim().toUpperCase();
      const encontradoPorNome = this.motoristasOperadores.find(
        (item) => String(item.colaboradorNome ?? '').trim().toUpperCase() === nomeNormalizado
      );

      if (encontradoPorNome?.id !== null && typeof encontradoPorNome?.id !== 'undefined') {
        return String(encontradoPorNome.id);
      }
    }

    return null;
  }

  private extrairLista<T = any>(response: any): T[] {
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        return this.extrairLista<T>(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(response)) {
      return response as T[];
    }

    if (response && typeof response === 'object') {
      const candidatos = [
        response.items,
        response.data,
        response.result,
        response.resultado,
        response.value,
        response.values,
        response.lista,
        response.$values,
        response.registros,
        response.itens
      ];

      const lista = candidatos.find(Array.isArray);
      if (Array.isArray(lista)) {
        return lista as T[];
      }

      const valores = Object.values(response);
      if (valores.length && valores.every((item) => typeof item === 'object' && item !== null)) {
        return valores as T[];
      }
    }

    return [];
  }

  private obterCacheCampos(): Record<string, CamposPersistidosLocal> {
    try {
      const bruto = localStorage.getItem(this.cacheCamposKey);
      if (!bruto) return {};
      const parsed = JSON.parse(bruto);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private salvarCacheCampos(abastecimentoId: string): void {
    if (!abastecimentoId) return;

    const blocoAtual = this.blocos.find(b => String(b.id) === String(this.blocoSelecionado));
    const etapaAtual = this.etapas.find(e => String(e.id) === String(this.etapaSelecionada));
    const aplicacaoAtual = this.aplicacoes.find(a => String(a.id) === String(this.aplicacaoSelecionada));

    const registro: CamposPersistidosLocal = {
      tipoPrevAbast: this.tipoPrevAbast,
      blocoSelecionado: this.blocoSelecionado,
      blocoDescricao: blocoAtual?.descricao ?? null,
      etapaSelecionada: this.etapaSelecionada,
      etapaDescricao: etapaAtual?.descricao ?? null,
      aplicacaoSelecionada: this.aplicacaoSelecionada,
      aplicacaoDescricao: aplicacaoAtual?.descricao ?? null,
      horimetroAtual: this.horimetroAtual,
      odometroAtual: this.odometroAtual,
      atualizadoEm: new Date().toISOString()
    };

    const cache = this.obterCacheCampos();
    cache[String(abastecimentoId)] = registro;
    localStorage.setItem(this.cacheCamposKey, JSON.stringify(cache));
  }

  private aplicarCacheCampos(abastecimentoId: string): void {
    if (!abastecimentoId) return;

    const cache = this.obterCacheCampos();
    const registro = cache[String(abastecimentoId)];
    if (!registro) return;

    if (!this.blocoSelecionado && registro.blocoSelecionado) {
      this.blocoSelecionado = registro.blocoSelecionado;
      if (!this.blocos.some(b => String(b.id) === String(registro.blocoSelecionado))) {
        this.blocos = [
          ...this.blocos,
          {
            id: registro.blocoSelecionado,
            descricao: registro.blocoDescricao || 'Bloco (cache local)'
          }
        ];
      }
    }

    if (!this.etapaSelecionada && registro.etapaSelecionada) {
      this.etapaSelecionada = registro.etapaSelecionada;
      if (!this.etapas.some(e => String(e.id) === String(registro.etapaSelecionada))) {
        this.etapas = [
          ...this.etapas,
          {
            id: registro.etapaSelecionada,
            descricao: registro.etapaDescricao || 'Etapa (cache local)'
          }
        ];
      }
    }

    // Restaurar horimetroAtual e odometroAtual se não vieram do backend
    if (this.horimetroAtual == null && registro.horimetroAtual != null) {
      this.horimetroAtual = registro.horimetroAtual;
    }

    if (this.odometroAtual == null && registro.odometroAtual != null) {
      this.odometroAtual = registro.odometroAtual;
    }
  }

  private preencherFormularioComDados(dados: any) {
    this.dadosAbastecimento = dados;
    this.abastecimentoId = this.getItemValue(dados, ['abastecimentoId', 'IdAbastecimento', 'idAbastecimento']);
    const guidZerado = '00000000-0000-0000-0000-000000000000';

    const bombaRaw = this.getItemValue(dados, ['comboioBombaId', 'bombaId', 'idBomba', 'IdTanqueOrigem']);
    this.bombaSelecionada = (bombaRaw && bombaRaw !== guidZerado) ? String(bombaRaw) : null;

    const bicoRaw = this.getItemValue(dados, ['bicoId', 'idBico', 'IdBico']);
    this.bicoSelecionado = (bicoRaw && bicoRaw !== guidZerado) ? String(bicoRaw) : null;

    const insumoRaw = this.getItemValue(dados, ['insumoId', 'idInsumo', 'IdInsumo']);
    this.insumoSelecionado = (insumoRaw && insumoRaw !== guidZerado) ? String(insumoRaw) : null;

    if (this.bicoSelecionado && !this.bicos.find(b => String(b.id) === String(this.bicoSelecionado))) {
      this.bicos = [
        ...this.bicos,
        {
          id: this.bicoSelecionado,
          descricao: this.getItemValue(dados, ['bicoDescricao', 'descBico']) || 'Bico carregado'
        }
      ];
    }

    if (this.insumoSelecionado && !this.insumos.find(i => String(i.id) === String(this.insumoSelecionado))) {
      const insumoDescr = this.getItemValue(dados, ['insumoDescr', 'descricaoInsumo']) || 'Insumo carregado';
      this.insumos = [
        ...this.insumos,
        {
          id: this.insumoSelecionado,
          descricao: insumoDescr,
          insumoDescr
        }
      ];
    }

    const equipamentoRaw = this.getItemValue(dados, ['equipamentoId', 'idEquipamento', 'IdEquipamento']);
    if (equipamentoRaw && equipamentoRaw !== guidZerado) {
      if (!this.equipamentos.find(e => String(e.id) === String(equipamentoRaw))) {
        this.equipamentos = [
          ...this.equipamentos,
          {
            id: equipamentoRaw,
            descricao: dados.modelo || 'Equipamento carregado',
            tipoControle: this.getItemValue(dados, ['tipoControle', 'TipoControle'])
          }
        ];
      }
      this.equipamentoSelecionado = String(equipamentoRaw);
    } else {
      this.equipamentoSelecionado = null;
    }

    const empreendimentoRaw = this.getItemValue(dados, ['emprdId', 'empreendimentoId', 'idEmpreendimento']);
    const empreendimentoCod = this.getItemValue(dados, ['emprdCod', 'codigoEmpreendimento', 'codEmpreendimento']);
    if (empreendimentoRaw && empreendimentoRaw !== guidZerado) {
      if (!this.empreendimentos.find(e => String(e.id) === String(empreendimentoRaw))) {
        this.empreendimentos = [
          ...this.empreendimentos,
          {
            id: empreendimentoRaw,
            descricao: dados.emprDesc || 'Empreendimento carregado',
            emprdCod: empreendimentoCod || dados.emprdCod || null
          }
        ];
      }
      this.empreendimentoSelecionado = String(empreendimentoRaw);
      this.emprdId = this.empreendimentoSelecionado;
      this.emprdCod = empreendimentoCod ? Number(empreendimentoCod) : null;
    } else {
      this.empreendimentoSelecionado = null;
    }

    const etapaRaw = this.getItemValue(dados, [
      'etapaId',
      'idEtapa',
      'EtapaId',
      'IdEtapa',
      'etapa',
      'etapaID',
      'etapaCod',
      'EtapaCod',
      'etapaCdg',
      'codigoEtapa'
    ]);
    if (etapaRaw && etapaRaw !== guidZerado) {
      this.etapaSelecionada = String(etapaRaw);

      if (!this.etapas.find(e => String(e.id) === String(this.etapaSelecionada))) {
        this.etapas = [
          ...this.etapas,
          {
            id: this.etapaSelecionada,
            descricao: this.getItemValue(dados, ['etapaDescr', 'descricaoEtapa', 'etapaDescricao', 'nomeEtapa']) || 'Etapa carregada'
          }
        ];
      }
    } else {
      this.etapaSelecionada = null;
    }

    const blocoRaw = this.getItemValue(dados, [
      'blocoId',
      'idBloco',
      'BlocoId',
      'blocoCod',
      'BlocoCod',
      'unidadeId',
      'UnidadeId',
      'idUnidade',
      'unidadeCod',
      'UnidadeCod'
    ]);
    if (blocoRaw && blocoRaw !== guidZerado) {
      if (!this.blocos.find(b => String(b.id) === String(blocoRaw) || String((b as any).blocoCod) === String(blocoRaw))) {
        this.blocos = [
          ...this.blocos,
          { id: blocoRaw, descricao: dados.blocoDescricao || 'Bloco carregado' }
        ];
      }
      this.blocoSelecionado = String(blocoRaw);
    } else {
      this.blocoSelecionado = null;
    }

    const frentistaRaw = this.getItemValue(dados, ['frentistaId', 'idFrentista', 'FrentistaId']);
    this.colaboradorFrentistaSelecionado = (frentistaRaw && frentistaRaw !== guidZerado) ? String(frentistaRaw) : null;

    this.motoristaOperadorSelecionado = this.resolverMotoristaOperadorSelecionado(dados);

    const aplicacaoRaw = this.getItemValue(dados, [
      'aplicacaoId',
      'idAplicacao',
      'AplicacaoId',
      'AplicacaoPrevId',
      'aplicacaoPrevId',
      'idAplicacaoPrev',
      'aplicacaoID',
      'aplicacaoCod',
      'AplicacaoCod'
    ]);
    this.aplicacaoSelecionada = (aplicacaoRaw && aplicacaoRaw !== guidZerado) ? String(aplicacaoRaw) : null;

    const destinoRaw = this.getItemValue(dados, ['destino', 'TpDestino']);
    this.destinoSelecionado = (destinoRaw && destinoRaw !== guidZerado) ? String(destinoRaw) : null;

    if (this.destinoSelecionado && !this.destinos.find(d => String(d.id) === String(this.destinoSelecionado))) {
      this.destinos = [
        ...this.destinos,
        {
          id: this.destinoSelecionado,
          descricao: this.getItemValue(dados, ['destinoDesc', 'descricaoDestino']) || 'Destino carregado',
          destinoTipo: this.getItemValue(dados, ['destinoTipo'])
        }
      ];
    }

    const tipo = this.getItemValue(dados, [
      'tipoPrevAbast',
      'TipoPrevAbast',
      'tpPrevAbast',
      'TpPrevAbast',
      'tpTrocaReposicao',
      'TpTrocaReposicao',
      'trocaReposicaoId',
      'TrocaReposicaoId',
      'tipoPrevAbastecimento',
      'TipoPrevAbastecimento',
      'tipoPrevAbastDesc',
      'trocaReposicao',
      'trocaReposicaoDesc'
    ]);
    this.tipoPrevAbast = this.normalizarTipoPrevAbast(tipo);

    this.quantidade = this.getItemValue(dados, ['quantidade', 'qtdInsumo', 'QtdInsumo']);

    this.horimetro = this.getItemValue(dados, ['horimetro', 'Horimetro', 'horiMetro']);
    this.odometro = this.getItemValue(dados, ['odometro', 'Odometro']);
    this.horimetroAtual = this.getItemValue(dados, ['horimetroAtual', 'HorimetroAtual', 'horiMetroAtual']);
    this.odometroAtual = this.getItemValue(dados, ['odometroAtual', 'OdometroAtual', 'hodometroAtual']);

    this.numBombaInicial = this.getItemValue(dados, ['numBombaInicial', 'bombaInicial', 'numBicoInicial']);
    this.numBombaFinal = this.getItemValue(dados, ['numBombaFinal', 'bombaFinal', 'numBicoFinal']);

    this.observacao = this.getItemValue(dados, ['observacao', 'Observacao', 'obs']) || '';

    if (dados.dataAbastecimento) {
      this.data = String(dados.dataAbastecimento).split('T')[0];
    }
    this.horaAbastecimento = this.getItemValue(dados, ['horaAbastecimento', 'HoraAbastecimento']);

    this.fornecedorRazao = this.getItemValue(dados, ['fornecedorRazao']);
    this.placa = this.getItemValue(dados, ['placa']);
    this.modelo = this.getItemValue(dados, ['modelo']);
    this.equipamentoNome = this.getItemValue(dados, ['codEquipamento']);
    this.empresaNome = this.getItemValue(dados, ['empresaNome']);
    this.centroDespesaDescr = this.getItemValue(dados, ['centroDespesaDescr']);
    this.emprDesc = this.getItemValue(dados, ['emprDesc']);
    this.frentistaCod = this.getItemValue(dados, ['frentistaCod']);
    this.frentistalNome = this.getItemValue(dados, ['frentistalNome']);
    this.frentistaId = (frentistaRaw && frentistaRaw !== guidZerado) ? String(frentistaRaw) : null;

    this.aplicacoes = [];
    this.aplicacaoHabilitada = false;

    if (this.abastecimentoId) {
      this.aplicarCacheCampos(String(this.abastecimentoId));
    }

    if (this.empreendimentoSelecionado) {
      this.onEmpreendimentoChange(this.empreendimentoSelecionado, false);
    }

    if (this.equipamentoSelecionado && this.insumoSelecionado) {
      this.carregarAplicacoes();
    }
  }
  /**
   * Limpa todos os campos do formulário para criar um novo abastecimento
   */
  private limparFormulario() {
    //

    // Limpar ID e dados
    this.abastecimentoId = null;
    this.dadosAbastecimento = null;

    // Limpar campos principais
    this.data = null;
    this.bombaSelecionada = null;
    this.equipamentoSelecionado = null;
    this.bicoSelecionado = null;
    this.destinoSelecionado = null;
    this.insumoSelecionado = null;
    this.quantidade = null;
    this.horimetro = null;
    this.odometro = null;
    this.observacao = '';
    this.numBombaInicial = null;
    this.numBombaFinal = null;

    // Limpar seleções de listas
    this.empreendimentoSelecionado = null;
    this.etapaSelecionada = null;
    this.blocoSelecionado = null;
    this.motoristaOperadorSelecionado = null;
    this.colaboradorFrentistaSelecionado = null;
    this.tipoPrevAbast = null;
    this.aplicacaoSelecionada = null;

    // Limpar arrays dependentes
    this.bicos = [];
    this.destinos = [];
    this.insumos = [];
    this.etapas = [];
    this.blocos = [];
    this.aplicacoes = [];
    this.aplicacaoHabilitada = false;

    //
  }
private carregarBlocosPorEmpreendimento(empreendimentoId: string) {

  if (!empreendimentoId) {
    this.blocos = [];
    return;
  }

  const blocoSelecionadoAtual = this.blocoSelecionado;
  const blocosAnteriores = [...this.blocos];

  const aplicarListaBlocos = (res: any): boolean => {
    const lista = this.extrairLista<any>(res);

    this.blocos = lista
      .map((b: any) => ({
        id: b.id ?? b.unidadeId ?? b.blocoId ?? b.BlocoId ?? b.valor,
        descricao: b.descricao ?? b.nome ?? b.nomeBloco ?? b.label
      }))
      .filter((b: any) => !!b.id);

    if (
      blocoSelecionadoAtual &&
      !this.blocos.some(b => String(b.id) === String(blocoSelecionadoAtual))
    ) {
      const blocoAnterior = blocosAnteriores.find(
        b => String(b.id) === String(blocoSelecionadoAtual)
      );

      if (blocoAnterior) {
        this.blocos = [...this.blocos, blocoAnterior];
      }
    }

    return this.blocos.length > 0;
  };

  this.abastecimentoService
    .listarBlocos(empreendimentoId, '', blocoSelecionadoAtual ?? '')
    .subscribe({
      next: (resBlocos: any) => {
        aplicarListaBlocos(resBlocos);
      },
      error: () => {
        this.blocos = [];
      }
    });
}
private testarEmpreendimentosComBlocos(): void {

  this.empreendimentos.forEach(emp => {

    this.abastecimentoService
      .listarBlocosProprio(emp.id as string)
      .subscribe((res: any) => {

        const lista = Array.isArray(res) ? res : [];

      });

  });

}

  private carregarColaboradoresFrentista() {
    this.abastecimentoService.listarColaboradoresFrentista().subscribe({
      next: (colabs) => {
        this.colaboradoresFrentista = colabs || [];
      },
      error: () => {},
    });
  }

  private carregarMotoristasOperadores() {
    this.abastecimentoService.listarColaboradoresMotoristaOperador().subscribe({
      next: (colabs) => {
        this.motoristasOperadores = (colabs || []).map((c: any) => ({
          ...c,
          id: c.id ?? c.colaboradorId ?? c.colaColaboradorId ?? c.fornId ?? c.colaboradorCod,
          colaboradorNome: c.colaboradorNome ?? c.descricao ?? c.nome
        }));

        if (this.dadosAbastecimento && !this.motoristaOperadorSelecionado) {
          this.motoristaOperadorSelecionado = this.resolverMotoristaOperadorSelecionado(this.dadosAbastecimento);
        }
      },
      error: () => {},
    });
  }

private carregarEmpreendimentoPorBomba(emprdId: string) {



  if (!emprdId) {
    this.empreendimentos = [];
    this.empreendimentoSelecionado = null;
    return;
  }

  this.abastecimentoService
    .listarEmpreendimentos(emprdId)
    .subscribe({
      next: (emps: any[]) => {

        this.empreendimentos = (emps || []).map(e => ({
          id: String(e.id),
          descricao: e.descricao || e.nome,
          emprdCod: Number(e.codigo)
        }));

        const empreendimentoDaBomba = this.empreendimentos.find(
          e => String(e.id) === String(emprdId)
        );

        if (empreendimentoDaBomba) {
          this.onEmpreendimentoChange(String(empreendimentoDaBomba.id));
        } else {
          this.empreendimentoSelecionado = null;
        }

      },
      error: () => {
        this.empreendimentos = [];
        this.empreendimentoSelecionado = null;
      }
    });
}
private carregarDestinos(bombaId: string) {

  this.abastecimentoService.listarDestinos(bombaId).subscribe({
    next: (destinosApi: any[]) => {

      this.destinos = (destinosApi || []).map(d => ({
        id: d.destino,
        descricao: d.destinoDesc,
        destinoTipo: d.destinoTipo,
        destinoId: d.destinoid
      }));

       this.aplicarRegraEquipamentoDestino();
    },
    error: () => {
      this.destinos = [];
    },
  });
}


private aplicarRegraEquipamentoDestino() {

  if (!this.equipamentoSelecionado) {
    this.destinoTravado = false;
    return;
  }

  if (!this.destinos?.length) return;

  const destinoEquip = this.destinos.find(d => {
    const tipo = String(d.destinoTipo || '')
      .trim()
      .toUpperCase();

    return tipo === 'M';
  });

  if (!destinoEquip) {
    this.destinoTravado = false;
    return;
  }

  this.destinoSelecionado = destinoEquip.id;
  this.destinoTravado = true;
}


private carregarInsumos(bombaId: string) {

  if (!bombaId) {
    this.insumos = [];
    return;
  }

  this.abastecimentoService
    .listarInsumosComboio(bombaId)
    .subscribe({
      next: (insumos: any[]) => {

        this.insumos = (insumos || []).map(i => ({
          id: i.insumoId ?? i.id ?? i.InsumoId,
          descricao: i.insumoDescr ?? i.descricao ?? i.nome,
          insumoDescr: i.insumoDescr ?? i.descricao ?? i.nome
        }));

      },
      error: () => {
        this.insumos = [];
      }
    });
}

private carregarUltimoNumeroBico() {

  if (!this.bombaSelecionada || !this.bicoSelecionado) {
    return;
  }

  this.abastecimentoService
    .consultarUltimoNumeroBico(
      this.bombaSelecionada,
      this.bicoSelecionado
    )
.subscribe({
  next: (retorno: any) => {
    this.numBombaInicial = retorno?.[0]?.numeracao ?? 0;
  },
  error: () => {}
});
}

onEmpreendimentoChange(value: string | null, resetDependentes: boolean = true) {
  this.empreendimentoSelecionado = value ? String(value) : null;

  const encontrado = this.empreendimentos.find(
    e => String(e.id) === String(this.empreendimentoSelecionado)
  );

 this.emprdCod = encontrado?.emprdCod ?? null;

  if (resetDependentes) {
    this.etapaSelecionada = null;
    this.blocoSelecionado = null;
    this.etapas = [];
    this.blocos = [];
  }

  if (!this.empreendimentoSelecionado) {
    this.etapas = [];
    this.blocos = [];
    return;
  }

  // Carrega Etapas
  this.carregarEtapas();

if (this.empreendimentoSelecionado) {
  this.carregarBlocosPorEmpreendimento(this.empreendimentoSelecionado);
}
}

onEquipamentoChange(value: string | null) {
  this.equipamentoSelecionado = value ? String(value) : null;

  this.carregarAplicacoes();

  if (!this.equipamentoSelecionado) {
    this.destinoTravado = false;
    return;
  }

  if (this.destinos && this.destinos.length > 0) {
    this.aplicarRegraEquipamentoDestino();
  }
}


  // Método auxiliar para carregar etapas
private carregarEtapas() {

  if (!this.empreendimentoSelecionado) {
    this.etapas = [];
    return;
  }

  const etapaSelecionadaAtual = this.etapaSelecionada;
  const etapasAnteriores = [...this.etapas];

  const aplicarListaEtapas = (response: any): boolean => {
    const lista = this.extrairLista<any>(response);

    this.etapas = lista
      .map(e => {
        const idRaw = e?.id ?? e?.Id ?? e?.etapaId ?? e?.IdEtapa ?? e?.idEtapa ?? e?.etapaID ?? e?.etapaCdg ?? e?.etapaCod ?? e?.value ?? e?.valor ?? e?.codigo ?? e?.cod;
        const descricao = e?.descricao ?? e?.Descricao ?? e?.nome ?? e?.label ?? e?.etapaDescr ?? e?.EtapaDescr ?? e?.descr ?? '';
        return {
          id: idRaw !== null && typeof idRaw !== 'undefined' ? String(idRaw) : '',
          descricao
        };
      })
      .filter(e => !!e.id && e.id !== '' && !!String(e.descricao ?? '').trim());

    if (
      etapaSelecionadaAtual &&
      !this.etapas.some(e => String(e.id) === String(etapaSelecionadaAtual))
    ) {
      const etapaAnterior = etapasAnteriores.find(
        e => String(e.id) === String(etapaSelecionadaAtual)
      );
      if (etapaAnterior) {
        this.etapas = [...this.etapas, etapaAnterior];
      }
    }

    return this.etapas.length > 0;
  };

  const consultarEtapas = (
    empreendimentoId: string,
    insumoId: string | null,
    emprdCod: string | number | null,
    tentativa: string,
    onDone: (ok: boolean) => void
  ) => {
    this.abastecimentoService
      .listarEtapas({
        empreendimentoId,
        pesquisa: '',
        mostrarDI: true,
        insumoId: insumoId ?? undefined,
        emprdCod: emprdCod ?? undefined
      })
      .subscribe({
        next: (response: any) => {
          const ok = aplicarListaEtapas(response);
          onDone(ok);
        },
        error: () => {
          onDone(false);
        }
      });
  };

  const empreendimentoId = String(this.empreendimentoSelecionado);
  const insumoId = this.insumoSelecionado;
  const empreendimentoCod = this.emprdCod !== null && typeof this.emprdCod !== 'undefined'
    ? this.emprdCod
    : null;

  // Tentativa 1: Apenas GUID do empreendimento
  consultarEtapas(empreendimentoId, null, null, '1 (só GUID)', (okBase) => {
    if (okBase) return;

    // Tentativa 2: GUID + insumoId
    consultarEtapas(empreendimentoId, insumoId, null, '2 (GUID + insumo)', (okComInsumo) => {
      if (okComInsumo) return;

      if (empreendimentoCod === null) {
        if (this.etapaSelecionada && !this.etapas.some(e => String(e.id) === String(this.etapaSelecionada))) {
          this.etapas = [
            ...this.etapas,
            { id: String(this.etapaSelecionada), descricao: 'Etapa (seleção salva)' }
          ];
        }
        return;
      }

      // Tentativa 3: GUID + insumoId + código numérico (fallback para APIs legadas)
      consultarEtapas(empreendimentoId, insumoId, empreendimentoCod, '3 (GUID + insumo + COD)', (okComCod) => {
        if (!okComCod) {
          if (this.etapaSelecionada && !this.etapas.some(e => String(e.id) === String(this.etapaSelecionada))) {
            this.etapas = [
              ...this.etapas,
              { id: String(this.etapaSelecionada), descricao: 'Etapa (seleção salva)' }
            ];
          }
        }
      });
    });
  });
}
private carregarAplicacoes() {

  this.aplicacoes = [];
  this.aplicacaoHabilitada = false;

  if (!this.equipamentoSelecionado || !this.insumoSelecionado) {
    this.aplicacaoSelecionada = null;
    this.tipoPrevAbast = null;
    return;
  }

  this.abastecimentoService
    .consultarAplicacaoPrev(
      this.equipamentoSelecionado,
      this.insumoSelecionado
    )
    .subscribe({
      next: (res: any) => {
        const lista = this.extrairLista<any>(res);

        this.aplicacoes = lista
          .map((a: any) => {
            const idRaw = a.aplicacaoId ?? a.AplicacaoId ?? a.aplicacaoID ?? a.idAplicacao ?? a.aplicacaoCdg ?? a.codigo ?? a.cod ?? a.id ?? a.value ?? a.valor;
            const descricao = a.aplicacaoDescr ?? a.aplicacaoDesc ?? a.AplicacaoDescr ?? a.descricao ?? a.nome ?? a.label ?? '';
            return {
              id: idRaw !== null && typeof idRaw !== 'undefined' ? String(idRaw) : '',
              descricao
            };
          })
          .filter((a: any) => !!a.id && !!String(a.descricao ?? '').trim());

        this.aplicacaoHabilitada = this.aplicacoes.length > 0;

        if (!this.aplicacaoHabilitada) {
          this.aplicacaoSelecionada = null;
          this.tipoPrevAbast = null;
        }
      },
      error: () => {
        this.aplicacoes = [];
        this.aplicacaoHabilitada = false;
        this.aplicacaoSelecionada = null;
        this.tipoPrevAbast = null;
      }
    });
}


  onBack() {
    this.router.navigate(['/tabs/abastecimento-proprio-pesquisa']);
  }

  async openCalendar(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const popover = await this.popoverCtrl.create({
      component: CalendarPopoverComponent,
      event,
      backdropDismiss: true,
      translucent: true,
      cssClass: 'calendar-popover',
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data?.cleared) {
      this.data = null;
      this.logPayloadPreview();
      return;
    }

    if (data && data.date) {
      // Validar se a data não é futura
      const dataSelecionada = new Date(data.date);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);

      if (dataSelecionada > hoje) {
        this.toast('Data não pode ser futura.', 'warning');
        return;
      }

      this.data = data.date;
      //
      this.logPayloadPreview();
    }
  }

  onOdometroChange(event: Event) {
    const ce = event as CustomEvent<{ value?: unknown }>;
    const value = ce.detail?.value ?? (event.target as HTMLInputElement | null)?.value ?? null;
    this.odometro = value !== null && value !== '' ? Number(value) : null;
    //
    this.logPayloadPreview();
  }

  onHorimetroChange(event: Event) {
    const ce = event as CustomEvent<{ value?: unknown }>;
    const value = ce.detail?.value ?? (event.target as HTMLInputElement | null)?.value ?? null;
    this.horimetro = value !== null && value !== '' ? Number(value) : null;
    //
    this.logPayloadPreview();
  }

  logPayloadPreview() {
    //
  }

  formatDate(isoString: string | null): string {
    if (!isoString) return '';
    try {
      return format(parseISO(isoString), 'dd/MM/yyyy');
    } catch {
      return '';
    }
  }

// PADRONIZA LISTAS PARA O AUTOCOMPLETE
private padronizarLista(lista: any[], idField: string, descField: string) {
  return (lista || []).map(item => ({
    id: item?.[idField],
    descricao: item?.[descField]
  }));
}
  private carregarBombas() {
    this.abastecimentoService.listarBombas().subscribe({
      next: (bombas) => {
      this.bombas = this.padronizarLista(
        bombas,
        'bombaId',
        'bombaDescricao'
      );
      },
      error: () => {},
    });
  }

  private carregarBicos(bombaId: string) {

  if (!bombaId) {
    this.bicos = [];
    return;
  }

  this.abastecimentoService.listarBicos(bombaId).subscribe({
    next: (bicos: any[]) => {
      this.bicos = (bicos || []).map(b => ({
        id: b.bicoId,
        codigo: b.bicoCdg,
        descricao: b.bicoDescricao
      }));
    },
    error: () => {
      this.bicos = [];
    }
  });
}
private carregarEquipamentos() {
  this.abastecimentoService.listarEquipamentosMobile().subscribe({
    next: (eqps: any[]) => {
      this.equipamentos = eqps.map(e => ({
        id: e.id,
        descricao: e.descricao,
        tipoControle: e.tipoControle ?? e.TipoControle ?? e.tpControle
      }));
    },
    error: () => {},
  });

}

private isDestinoEquipamentoSelecionado(): boolean {
  const destinoObj = (this.destinos ?? []).find(
    d => String(d.id) === String(this.destinoSelecionado)
  );

  const tipoDestino = String(destinoObj?.destinoTipo ?? '')
    .trim()
    .toUpperCase();

  return tipoDestino === 'M';
}

private getTipoControleEquipamentoSelecionado(): string {
  const equipamento = (this.equipamentos ?? []).find(
    e => String(e.id) === String(this.equipamentoSelecionado)
  );

  return String(equipamento?.tipoControle ?? '')
    .trim()
    .toUpperCase();
}



onQuantidadeChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.quantidade = value ? Number(value) : null;
}

onNumBombaInicialChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.numBombaInicial = value ? Number(value) : null;
}

onNumBombaFinalChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.numBombaFinal = value ? Number(value) : null;
}
onHoraChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.horaAbastecimento = value || null;
}
onObservacaoChange(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value;
  this.observacao = value || '';
}

onAplicacaoChange(event: any) {
  this.aplicacaoSelecionada = event?.id ?? null;
}
  confirmar() {

  const isEdicao = !!this.abastecimentoId;

  if (isEdicao && !this.abastecimentoId) {
    this.toast('Erro interno: ID do abastecimento não encontrado para edição!', 'danger');
    return;
  }

  if (!this.data) {
    this.toast(' Data obrigatória', 'warning');
    return;
  }

  const dataSelecionada = new Date(this.data);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  if (dataSelecionada > hoje) {
    this.toast('Data não pode ser futura!', 'warning');
    return;
  }

  if (!this.bombaSelecionada) {
    this.toast('Origem/Tanque obrigatória', 'warning');
    return;
  }

  if (!this.bicoSelecionado) {
    this.toast('Bico obrigatório', 'warning');
    return;
  }

  if (!this.destinoSelecionado) {
    this.toast('Destino obrigatório', 'warning');
    return;
  }

  if (!this.insumoSelecionado) {
    this.toast('Insumo obrigatório', 'warning');
    return;
  }

  if (this.quantidade == null || this.quantidade <= 0) {
    this.toast('Quantidade inválida', 'warning');
    return;
  }

  // ------------------ DATA FORMATADA ------------------

 // ------------------ DATA FORMATADA ------------------

// ------------------ DATA FORMATADA (SEM UTC) ------------------

const dataBase = this.data.split('T')[0]; // yyyy-MM-dd
const dataFormatada = `${dataBase}T00:00:00`;

  // ------------------ OPERADOR ------------------

  let operadorId: string | undefined;

  if (this.motoristaOperadorSelecionado) {
    if (typeof this.motoristaOperadorSelecionado === 'string') {
      operadorId = this.motoristaOperadorSelecionado;
    } else if (
      typeof this.motoristaOperadorSelecionado === 'object' &&
      'fornId' in this.motoristaOperadorSelecionado
    ) {
      operadorId = (this.motoristaOperadorSelecionado as any).fornId;
    }
  }

  // ------------------ DESTINO ------------------

  const destinoObj = (this.destinos ?? []).find(
    d => d.id === this.destinoSelecionado
  );

  if (!destinoObj) {
    this.toast('Destino inválido', 'warning');
    return;
  }

  const destinoEhEquipamento = this.isDestinoEquipamentoSelecionado();
  const tipoControleEquipamento = this.getTipoControleEquipamentoSelecionado();

  if (destinoEhEquipamento && !this.equipamentoSelecionado) {
    this.toast('Equipamento obrigatório para destino Equipamento', 'warning');
    return;
  }

  if (destinoEhEquipamento && tipoControleEquipamento === 'V' && (this.odometro == null || this.odometro <= 0)) {
    this.toast('Odômetro obrigatório para equipamento com tipo de controle V', 'warning');
    return;
  }

  if (destinoEhEquipamento && tipoControleEquipamento === 'H' && (this.horimetro == null || this.horimetro <= 0)) {
    this.toast('Horímetro obrigatório para equipamento com tipo de controle H', 'warning');
    return;
  }

// ------------------ EMPREENDIMENTO ------------------

const guidZerado = '00000000-0000-0000-0000-000000000000';
const idEmprdFinal: string | undefined =
  (this.empreendimentoSelecionado && this.empreendimentoSelecionado !== guidZerado)
    ? this.empreendimentoSelecionado
    : (this.emprdId && this.emprdId !== guidZerado ? this.emprdId : undefined);

// ------------------ BLOCO ------------------

const idBlocoFinal: string | undefined =
  this.blocoSelecionado || undefined;

if (!idEmprdFinal) {
  this.toast('Empreendimento obrigatório', 'warning');
  return;
}

/*

if (!this.blocoSelecionado) {
  this.toast('Bloco é obrigatório para aplicação do insumo', 'warning');
  return;
}

*/
// ---------------- PARAMS ----------------

const params: Record<string, unknown> = {
  TpAbastecimento: 0,
  DataAbastecimento: dataFormatada,
  TpDestino: this.destinoSelecionado ?? undefined,
  IdTanqueOrigem: this.bombaSelecionada,
  IdBico: this.bicoSelecionado,
  IdInsumo: this.insumoSelecionado,
  QtdInsumo: Number(this.quantidade),
  Origem: 3,
  IdEmprd: idEmprdFinal,
  IdEtapa: this.etapaSelecionada ?? undefined,
  IdBloco: idBlocoFinal,
  Odometro: this.odometro ?? undefined,
  OdometroAtual: this.odometroAtual ?? undefined,
  Horimetro: this.horimetro ?? undefined,
  HorimetroAtual: this.horimetroAtual ?? undefined,
  horaAbastecimento: this.horaAbastecimento ?? undefined,
  NumBicoInicial: this.numBombaInicial ?? undefined,
  NumBicoFinal: this.numBombaFinal ?? undefined,
  Observacao: (this.observacao ?? '').trim() || undefined,
  OperadorSolicitanteId: operadorId ?? undefined,
  FrentistaId: this.colaboradorFrentistaSelecionado ?? undefined,
  TipoPrevAbast: this.obterTipoPrevAbastPayload(),
  IdAplicacaoPrev: this.aplicacaoHabilitada ? (this.aplicacaoSelecionada ?? undefined) : undefined,
  // Se for edição, inclui IdAbastecimento
  ...(this.abastecimentoId ? { IdAbastecimento: this.abastecimentoId } : {})
};


  // ------------------ REGRA DESTINO ------------------

  if (destinoObj.destinoTipo === 'M') {
    // Equipamento
    params.IdEquipamento = this.equipamentoSelecionado;
  } else {
    // Tanque / Comboio / etc
    params.IdTanqueDestino = destinoObj.destinoId;
  }

  // Remove undefined
  Object.keys(params).forEach(
    key => params[key] === undefined && delete params[key]
  );

  // ------------------ ENVIO ------------------

  this.carregando = true;

  this.abastecimentoService.gravarAbastecimento(params)
  .subscribe({
    next: (res) => {
      this.carregando = false;

      const idParaCache = this.abastecimentoId || (typeof res === 'string' ? String(res) : null);
      if (idParaCache) {
        this.salvarCacheCampos(idParaCache);
      }

      this.toast(
        'Abastecimento gravado! ID: ' +
        (typeof res === 'string' ? res.substring(0, 8) : 'OK'),
        'success'
      );

      setTimeout(() => {
        this.router.navigate(['/tabs/abastecimento-proprio-pesquisa']);
      }, 1500);
    },
    error: () => {
      this.carregando = false;
      this.toast(
        'Erro ao salvar abastecimento. Veja o console para detalhes.',
        'danger'
      );
    },
  });
}
}
