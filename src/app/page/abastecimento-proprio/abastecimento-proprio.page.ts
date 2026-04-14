import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CalendarPopoverComponent } from '../../components/calendar-popover/calendar-popover.component';
import { AbastecimentoService } from '../../services/abastecimento.service';

@Component({
  selector: 'app-abastecimento-proprio',
  templateUrl: './abastecimento-proprio.page.html',
  styleUrls: ['./abastecimento-proprio.page.scss'],
  standalone: false
})
export class AbastecimentoProprioPage implements OnInit {

  // LISTAS
  origensLista: any[] = [];
  equipamentosLista: any[] = [];

  // IDS SELECIONADOS
  origemTanqueId: string | null = null;
  equipamentoId: string | null = null;

  // DATAS
  dataInicial: string | null = null;
  dataFinal: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private abastecimentoService: AbastecimentoService
  ) {}

  ngOnInit() {
    this.carregarListas();
    this.restaurarFiltrosDaPesquisa();
  }

  private restaurarFiltrosDaPesquisa() {
    this.route.queryParamMap.subscribe((params) => {
      this.origemTanqueId = params.get('origemTanqueId') ?? '';
      this.equipamentoId = params.get('equipamentoId') ?? '';
      this.dataInicial = params.get('dataInicial');
      this.dataFinal = params.get('dataFinal');

      if (params.get('semResultado') === '1') {
        void this.exibirAlertaSemResultado();

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { semResultado: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  private async exibirAlertaSemResultado() {
   const alert = await this.alertCtrl.create({
        header: 'Atenção!',
        message: 'A pesquisa não retornou resultados. Ajuste os filtros e tente novamente.',
        buttons: ['OK'],
        backdropDismiss: true,
        cssClass: ['custom-alert']
      });

      await alert.present();
      
    }

carregarListas() {

  // ORIGEM / TANQUE (BOMBAS)
  this.abastecimentoService.listarBombas().subscribe({
    next: dados => {
      this.origensLista = (dados ?? []).map(b => ({
        id: b.bombaId,
        descricao: b.bombaDescricao || b.bombaCod || ''
      }));
    },
    error: () => this.origensLista = []
  });

  // EQUIPAMENTOS
  this.abastecimentoService.listarEquipamentosMobile().subscribe({
    next: dados => this.equipamentosLista = dados ?? [],
    error: () => this.equipamentosLista = []
  });
}

  // AUTOCOMPLETE
  onOrigemSelecionado(item: any) {
    this.origemTanqueId = item?.id ?? null;
  }

  onEquipamentoSelecionado(item: any) {
    this.equipamentoId = item?.id ?? null;
  }
  // CALENDÁRIO
  async openCalendar(event: any, campo: 'dataInicial' | 'dataFinal') {

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
      this[campo] = null;
      return;
    }

    if (data?.date) {
      this[campo] = data.date;
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
  limparData(campo: 'dataInicial' | 'dataFinal', event: Event) {
  event.stopPropagation();
  this[campo] = null;
}

  // PESQUISAR
  async pesquisar() {

    const possuiFiltro = [
      this.origemTanqueId,
      this.equipamentoId,
      this.dataInicial,
      this.dataFinal,
    ].some((value) => String(value || '').trim() !== '');

    if (!possuiFiltro) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção!',
        message: 'E necessário preencher os campos antes de pesquisar os abastecimentos.',
        buttons: ['OK'],
        backdropDismiss: true,
        cssClass: ['custom-alert']
      });

      await alert.present();
      return;
    }

    const filtros = {
      origemTanqueId: this.origemTanqueId,
      equipamentoId: this.equipamentoId,
      dataInicial: this.dataInicial || '',
      dataFinal: this.dataFinal || '',
    };

    this.router.navigate(
      ['/tabs/abastecimento-proprio-pesquisa'],
      { queryParams: filtros }
    );
  }

  onBack() {
    this.router.navigate(['/tabs/abastecimento']);
  }

  goNovo() {
    this.router.navigate(['/tabs/abastecimento-proprio-edicao'], {
      queryParams: { t: Date.now() }
    });
  }
}
