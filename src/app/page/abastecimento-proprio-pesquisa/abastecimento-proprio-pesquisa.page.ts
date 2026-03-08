import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbastecimentoService,
  AbastecimentoConsulta,
} from '../../services/abastecimento.service';

@Component({
  standalone: false,
  selector: 'app-abastecimento-proprio-pesquisa',
  templateUrl: './abastecimento-proprio-pesquisa.page.html',
  styleUrls: ['./abastecimento-proprio-pesquisa.page.scss'],
})
export class AbastecimentoProprioPesquisaPage implements OnInit {
  // lista que será exibida na tela (vinda da API)
  lista: AbastecimentoConsulta[] = [];

  // só pra você saber se está carregando
  carregando = false;

  private ignorarPrimeiroIonViewWillEnter = true;

  // Armazena os filtros atuais
  private filtrosAtuais: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private abastecimentoService: AbastecimentoService
  ) {}

  ngOnInit() {
    // pega os filtros enviados pela tela anterior
    this.route.queryParams.subscribe((params) => {
      this.filtrosAtuais = {
        origemTanque: params['origemTanqueId'] || params['origemTanque'] || undefined,
        equipamento: params['equipamentoId'] || params['equipamento'] || undefined,
        dataInicial: params['dataInicial'] || undefined,
        dataFinal: params['dataFinal'] || undefined,
      };

      const possuiFiltroInformado = Object.values(this.filtrosAtuais).some(
        (value) => String(value || '').trim() !== ''
      );

      if (!possuiFiltroInformado) {
        this.lista = [];
        this.carregando = false;
        this.router.navigate(['/tabs/abastecimento-proprio'], { replaceUrl: true });
        return;
      }

      this.buscarAbastecimentos(this.filtrosAtuais);
    });
  }

  // Executa sempre que a página fica visível (ao voltar da edição)
  ionViewWillEnter() {
    if (this.ignorarPrimeiroIonViewWillEnter) {
      this.ignorarPrimeiroIonViewWillEnter = false;
      return;
    }

    const possuiFiltroInformado = Object.values(this.filtrosAtuais || {}).some(
      (value) => String(value || '').trim() !== ''
    );

    if (possuiFiltroInformado) {
      this.buscarAbastecimentos(this.filtrosAtuais);
    }
  }

  formatarOrigemTanque(item: AbastecimentoConsulta): string {
    const codigo = String(item?.comboioBombaCdg ?? '').trim();
    const descricao = String(item?.comboioBombaDescr ?? '').trim();

    if (codigo && descricao) return `${codigo} - ${descricao}`;
    return codigo || descricao || '-';
  }

  formatarEmpreendimento(item: AbastecimentoConsulta): string {
    const codigo = item?.emprdCod !== null && typeof item?.emprdCod !== 'undefined'
      ? String(item.emprdCod).trim()
      : '';
    const descricao = String(item?.emprDesc ?? '').trim();

    if (codigo && descricao) return `${codigo} - ${descricao}`;
    return codigo || descricao || '';
  }

  formatarDestino(item: AbastecimentoConsulta): string {
    const codigo = String(item?.destino ?? item?.destinoTipo ?? '').trim();
    const descricao = String(item?.destinoDesc ?? '').trim();

    if (codigo && descricao) return `${codigo} - ${descricao}`;
    return codigo || descricao || '-';
  }

  deveExibirBlocoEquipamento(item: AbastecimentoConsulta): boolean {
    const destino = String(item?.destino ?? '').trim().toUpperCase();
    const destinoTipo = String(item?.destinoTipo ?? '').trim().toUpperCase();
    const destinoDescricao = String(item?.destinoDesc ?? '').trim().toLowerCase();

    return destino === 'EQ' || destinoTipo === 'M' || destinoDescricao === 'equipamento';
  }

  obterCodigoEquipamento(item: AbastecimentoConsulta): string {
    return String(item?.codEquipamento ?? item?.identificador ?? '').trim();
  }

  obterDescricaoEquipamento(item: AbastecimentoConsulta): string {
    return String(item?.modelo ?? '').trim();
  }

  obterPlaca(item: AbastecimentoConsulta): string {
    const placa = String(item?.placa ?? '').trim();
    if (!placa || placa.toLowerCase() === 'sem placa') return '';
    return placa;
  }

  obterDataAbastecimento(item: AbastecimentoConsulta): string {
    return String(
      item?.dataAbastecimento ??
      (item as any)?.data ??
      (item as any)?.dataHora ??
      ''
    ).trim();
  }

  formatarData(value?: string | null): string {
    const dataNormalizada = this.parseDateOnly(value);
    if (dataNormalizada === null) return '';

    const data = new Date(dataNormalizada);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = String(data.getFullYear());

    return `${dia}/${mes}/${ano}`;
  }

  private parseDateOnly(value?: string | null): number | null {
    if (!value) return null;

    const texto = String(value).trim();
    const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (matchIso) {
      const ano = Number(matchIso[1]);
      const mes = Number(matchIso[2]) - 1;
      const dia = Number(matchIso[3]);
      return new Date(ano, mes, dia).getTime();
    }

    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) return null;

    return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
  }

  private formatLocalDateIso(date: Date): string {
    const ano = String(date.getFullYear());
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  private resolverIntervaloDatas(filtros: {
    origemTanque?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
  }) {
    const dataInicial = filtros.dataInicial || null;
    const dataFinal = filtros.dataFinal || null;

    if (dataInicial && !dataFinal) {
      return {
        dataInicial,
        dataFinal: this.formatLocalDateIso(new Date()),
      };
    }

    return {
      dataInicial,
      dataFinal,
    };
  }

  private aplicarFiltrosLocal(lista: AbastecimentoConsulta[], filtros: {
    origemTanque?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
  }): AbastecimentoConsulta[] {
    let resultado = Array.isArray(lista) ? [...lista] : [];

    const origemTanque = String(filtros.origemTanque || '').trim();
    if (origemTanque) {
      resultado = resultado.filter((item) => {
        const candidatos = [
          item?.comboioBombaId,
          (item as any)?.bombaId,
          (item as any)?.idTanqueOrigem,
          (item as any)?.IdTanqueOrigem,
        ]
          .filter((value) => value !== null && value !== undefined)
          .map((value) => String(value).trim());

        return candidatos.includes(origemTanque);
      });
    }

    const equipamento = String(filtros.equipamento || '').trim();
    if (equipamento) {
      resultado = resultado.filter((item) => {
        const candidatos = [
          item?.equipamentoId,
          (item as any)?.idEquipamento,
          (item as any)?.IdEquipamento,
        ]
          .filter((value) => value !== null && value !== undefined)
          .map((value) => String(value).trim());

        return candidatos.includes(equipamento);
      });
    }

    if (filtros.dataInicial || filtros.dataFinal) {
      const dataInicial = this.parseDateOnly(filtros.dataInicial || null);
      const dataFinal = this.parseDateOnly(filtros.dataFinal || null);

      resultado = resultado.filter(item => {
        const dataItem = item.dataAbastecimento || (item as any).data || (item as any).dataHora || '';
        const dataItemNormalizada = this.parseDateOnly(dataItem ? String(dataItem) : null);
        if (dataItemNormalizada === null) return false;
        if (dataInicial !== null && dataItemNormalizada < dataInicial) return false;
        if (dataFinal !== null && dataItemNormalizada > dataFinal) return false;
        return true;
      });
    }

    return resultado;
  }

  private buscarAbastecimentos(filtros: {
    origemTanque?: string;
    equipamento?: string;
    dataInicial?: string | null;
    dataFinal?: string | null;
  }) {
    this.carregando = true;

    const intervalo = this.resolverIntervaloDatas(filtros);

    // Padronização dos filtros
    const origemTanqueTrim = (filtros.origemTanque || '').trim();
    const equipamentoTrim = (filtros.equipamento || '').trim();
    const filtrosApi: any = {
      origemTanque: origemTanqueTrim || null,
      equipamento: equipamentoTrim || null,
      dataInicial: intervalo.dataInicial,
      dataFinal: intervalo.dataFinal,
    };

    this.abastecimentoService
      .consultarAbastecimentoProprio(filtrosApi)
      .subscribe({
        next: (dados) => {
          const listaApi = Array.isArray(dados) ? dados : [];
          const lista = this.aplicarFiltrosLocal(listaApi, {
            ...filtros,
            dataInicial: intervalo.dataInicial,
            dataFinal: intervalo.dataFinal,
          });

          if (lista.length === 0) {
            this.carregando = false;
            this.router.navigate(['/tabs/abastecimento-proprio'], {
              queryParams: {
                origemTanqueId: filtros.origemTanque || '',
                equipamentoId: filtros.equipamento || '',
                dataInicial: filtros.dataInicial || '',
                dataFinal: filtros.dataFinal || '',
                semResultado: '1',
              },
              replaceUrl: true,
            });
            return;
          }

          this.lista = lista;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
        },
      });
  }

  onBack() {
    this.router.navigate(['/tabs/abastecimento']);
  }

  verDetalhes(item: any) {
    this.router.navigate(['/tabs/abastecimento-proprio-edicao', item.abastecimentoId]);
  }
}



