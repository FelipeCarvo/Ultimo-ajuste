import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbastecimentoService } from '../../services/abastecimento.service';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-abastecimento-postos-pesquisa',
  templateUrl: './abastecimento-postos-pesquisa.page.html',
  styleUrls: ['./abastecimento-postos-pesquisa.page.scss'],
  standalone: false
})
export class AbastecimentoPostosPesquisaPage implements OnInit {
  resultados: any[] = [];
  carregando = false;
  private idHighlight: string | null = null;
  private somenteRecente = false;
  private filtrosAtuais: {
    fornecedor?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
    numVoucher?: string;
  } = {};

  formatarData(value?: string | null): string {
    if (!value) return '';
    try {
      return format(parseISO(value), 'dd/MM/yyyy');
    } catch {
      return String(value);
    }
  }

  fornecedorLabel(item: any): string {
    return (
      item?.fornecedorRazao ??
      item?.fornecedor ??
      item?.Fornecedor ??
      item?.fornecedorNome ??
      item?.fornNome ??
      ''
    );
  }

  equipamentoLabel(item: any): string {
    if (!item) return '';
    const ident = item.codequipamento ?? item.codEquipamento ?? item.identificador ?? item.placa ?? item.equipamento;
    const modelo = item.modelo ?? item.Modelo;
    if (ident && modelo) return `${ident} - ${modelo}`;
    return String(ident ?? modelo ?? '');
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private abastecimentoService: AbastecimentoService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.idHighlight = (params['highlight'] ?? params['idAbastecimento'] ?? '')?.toString() || null;
      this.somenteRecente = String(params['somenteRecente'] ?? '').trim() === '1';

this.filtrosAtuais = {
  fornecedor: (params['fornecedorId'] ?? '')?.toString(),
  equipamento: (params['equipamentoId'] ?? '')?.toString(),
  dataInicial: (params['dataInicial'] ?? null) as string | null,
  dataFinal: (params['dataFinal'] ?? null) as string | null,
  numVoucher: (params['numVoucher'] ?? '')?.toString(),
};

      const possuiFiltroInformado = !!this.idHighlight || Object.values(this.filtrosAtuais).some(
        (value) => String(value || '').trim() !== ''
      );
/*
      if (!possuiFiltroInformado) {
        this.resultados = [];
        this.carregando = false;
        this.router.navigate(['/tabs/abastecimento-postos'], { replaceUrl: true });
        return;
      }
*/
if (!possuiFiltroInformado) {
  this.resultados = [];
  this.carregando = false;
  return; // NÃO redireciona mais
}

      if (this.idHighlight) {
        this.buscarAbastecimentoPorId(this.idHighlight, this.filtrosAtuais);
        return;
      }

      this.buscarAbastecimentos(this.filtrosAtuais);
    });
  }

  private isGuid(value: string): boolean {
    const v = (value || '').trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  }

  private parseDateOnly(value?: string | null): number | null {
    if (!value) return null;
    try {
      const d = parseISO(value);
      if (Number.isNaN(d.getTime())) return null;
      // normaliza para meia-noite
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    } catch {
      return null;
    }
  }

  private isVoucherCompativelComServidor(value?: string): boolean {
    const voucher = (value || '').trim();
    if (!voucher || !/^\d+$/.test(voucher)) return false;

    const normalized = voucher.replace(/^0+(?=\d)/, '');
    const maxInt64 = '9223372036854775807';

    if (normalized.length < maxInt64.length) return true;
    if (normalized.length > maxInt64.length) return false;
    return normalized <= maxInt64;
  }

  private voltarParaPesquisaComSemResultado(filtros: {
    fornecedor?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
    numVoucher?: string;
  }) {
    this.router.navigate(['/tabs/abastecimento-postos'], {
      queryParams: {
        fornecedorId: filtros.fornecedor || '',
        equipamentoId: filtros.equipamento || '',
        dataInicial: filtros.dataInicial || '',
        dataFinal: filtros.dataFinal || '',
        numVoucher: filtros.numVoucher || '',
        semResultado: '1',
      },
      replaceUrl: true,
    });
  }

  private aplicarFiltrosLocal(dados: any[], filtros: {
    fornecedor?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
    numVoucher?: string;
  }): any[] {
    let lista = Array.isArray(dados) ? [...dados] : [];

    const fornecedorTxt = (filtros.fornecedor || '').trim().toLowerCase();
    if (fornecedorTxt && !this.isGuid(fornecedorTxt)) {
      lista = lista.filter(item => this.fornecedorLabel(item).toLowerCase().includes(fornecedorTxt));
    }

    const equipamentoTxt = (filtros.equipamento || '').trim().toLowerCase();
    if (equipamentoTxt && !this.isGuid(equipamentoTxt)) {
      lista = lista.filter(item => this.equipamentoLabel(item).toLowerCase().includes(equipamentoTxt));
    }

    const voucherTxt = (filtros.numVoucher || '').trim();
    if (voucherTxt) {
      lista = lista.filter(item => {
        const v = item?.numVoucher ?? item?.NumVoucher ?? item?.numeroVoucher ?? item?.NumeroVoucher ?? item?.voucher ?? item?.Voucher;
        return String(v ?? '').includes(voucherTxt);
      });
    }

    const di = this.parseDateOnly(filtros.dataInicial);
    const df = this.parseDateOnly(filtros.dataFinal);
    if (di !== null || df !== null) {
      lista = lista.filter(item => {
        const raw = item?.dataAbastecimento ?? item?.DataAbastecimento ?? item?.dataabastecimento ?? item?.data ?? item?.Data;
        const itemDate = this.parseDateOnly(raw ? String(raw) : null);
        if (itemDate === null) return true;
        if (di !== null && itemDate < di) return false;
        if (df !== null && itemDate > df) return false;
        return true;
      });
    }

    return lista;
  }

  private ordenarResultadosPorMaisRecente(lista: any[]): any[] {
    const obterTimestamp = (item: any): number => {
      const dataBruta = String(
        item?.dataCadastro ??
        item?.DataCadastro ??
        item?.dataAbastecimento ??
        item?.DataAbastecimento ??
        item?.data ??
        item?.Data ??
        ''
      ).trim();

      if (!dataBruta) return 0;

      const data = new Date(dataBruta);
      return Number.isNaN(data.getTime()) ? 0 : data.getTime();
    };

    const obterNumeroVoucher = (item: any): number => {
      const valor = item?.numVoucher ?? item?.NumVoucher ?? item?.voucher ?? item?.Voucher ?? 0;
      const numero = Number(String(valor ?? '').replace(',', '.'));
      return Number.isNaN(numero) ? 0 : numero;
    };

    return [...(Array.isArray(lista) ? lista : [])].sort((a, b) => {
      const timestampB = obterTimestamp(b);
      const timestampA = obterTimestamp(a);

      if (timestampB !== timestampA) {
        return timestampB - timestampA;
      }

      const voucherB = obterNumeroVoucher(b);
      const voucherA = obterNumeroVoucher(a);

      if (voucherB !== voucherA) {
        return voucherB - voucherA;
      }

      return this.obterIdAbastecimento(b).localeCompare(this.obterIdAbastecimento(a));
    });
  }

  buscarAbastecimentos(filtros: {
    fornecedor?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
    numVoucher?: string;
  }) {
    // Backend filtra por IDs (GUID). Para inputs livres (nome/código), aplicamos filtro local como fallback.
    const fornecedor = (filtros.fornecedor || '').trim();
    const equipamento = (filtros.equipamento || '').trim();
    const serverFiltros: any = {
      dataInicial: filtros.dataInicial || null,
      dataFinal: filtros.dataFinal || null,
    };
    const numVoucher = (filtros.numVoucher || '').trim();

    if (fornecedor && this.isGuid(fornecedor)) serverFiltros.fornecedorId = fornecedor;
    if (equipamento && this.isGuid(equipamento)) serverFiltros.equipamentoId = equipamento;
    if (this.isVoucherCompativelComServidor(numVoucher)) {
      serverFiltros.numVoucher = numVoucher;
    }

    this.carregando = true;
    this.abastecimentoService.consultarAbastecimentoPosto(serverFiltros)
      .subscribe({
        next: (dados) => {
          const lista = Array.isArray(dados) ? dados : [];
          this.resultados = this.ordenarResultadosPorMaisRecente(
            this.aplicarFiltrosLocal(lista, filtros)
          );

          if (this.somenteRecente && this.resultados.length > 1) {
            this.resultados = [this.resultados[0]];
          }

          this.carregando = false;
          if (this.resultados.length === 0) {
            this.voltarParaPesquisaComSemResultado(filtros);
          }
        },
        error: (erro) => {
          this.carregando = false;
          if ((erro?.status === 400 && numVoucher) || erro?.status === 404) {
            this.voltarParaPesquisaComSemResultado(filtros);
          }
        }
      });
  }

  private obterIdAbastecimento(item?: any): string {
    const abastecimentoId =
      item?.abastecimentoId ??
      item?.AbastecimentoId ??
      item?.idAbastecimento ??
      item?.IdAbastecimento ??
      item?.id ??
      item?.Id ??
      null;

    return abastecimentoId !== null && typeof abastecimentoId !== 'undefined'
      ? String(abastecimentoId).trim()
      : '';
  }

  private buscarAbastecimentoPorId(
    abastecimentoId: string,
    filtrosFallback?: {
      fornecedor?: string;
      equipamento?: string;
      dataInicial?: string | null;
      dataFinal?: string | null;
      numVoucher?: string;
    }
  ) {
    const id = String(abastecimentoId || '').trim();
    if (!id) {
      if (filtrosFallback) {
        this.buscarAbastecimentos(filtrosFallback);
      }
      return;
    }

    this.carregando = true;
    this.abastecimentoService.consultarAbastecimentoPostoPorId(id).subscribe({
      next: (dados: any) => {
        const lista = Array.isArray(dados) ? dados : (dados ? [dados] : []);
        const item = lista.find((registro) => this.obterIdAbastecimento(registro) === id) || lista[0] || null;

        this.resultados = item ? [item] : [];
        this.carregando = false;

        if (!item && filtrosFallback) {
          this.buscarAbastecimentos(filtrosFallback);
        }
      },
      error: () => {
        this.carregando = false;
        if (filtrosFallback) {
          this.buscarAbastecimentos(filtrosFallback);
        }
      }
    });
  }

  onBack() {
    this.router.navigate(['/tabs/abastecimento-postos']);
  }

  verDetalhes(item?: any) {
    const idStr = this.obterIdAbastecimento(item) || null;

    this.router.navigate(
      idStr ? ['/tabs/abastecimento-postos-edicao', idStr] : ['/tabs/abastecimento-postos-edicao'],
      {
        state: { item, abastecimentoId: idStr }
      }
    );
  }
}
