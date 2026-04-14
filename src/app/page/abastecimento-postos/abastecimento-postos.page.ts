import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { format, parseISO } from 'date-fns';
import { CalendarPopoverComponent } from '../../components/calendar-popover/calendar-popover.component';
import { AbastecimentoService } from '../../services/abastecimento.service';

@Component({
  selector: 'app-abastecimento-postos',
  templateUrl: './abastecimento-postos.page.html',
  styleUrls: ['./abastecimento-postos.page.scss'],
  standalone: false
})
export class AbastecimentoPostosPage implements OnInit {
  fornecedoresLista: any[] = [];
  equipamentosLista: any[] = [];

  fornecedorId: string | null = null;
  equipamentoId: string | null = null;

  numeroVoucher = '';

  dataInicial: string | null = null;
  dataFinal: string | null = null;

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private abastecimentoService: AbastecimentoService
  ) {}

  ngOnInit() {
    this.carregarListas();
    this.restaurarFiltrosDaPesquisa();
  }

  private restaurarFiltrosDaPesquisa() {
    this.route.queryParamMap.subscribe((params) => {
      this.fornecedorId = params.get('fornecedorId') ?? '';
      this.equipamentoId = params.get('equipamentoId') ?? '';
      this.dataInicial = params.get('dataInicial');
      this.dataFinal = params.get('dataFinal');
      this.numeroVoucher = params.get('numVoucher') ?? '';

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
    this.abastecimentoService.listarFornecedores().subscribe({
      next: dados => {
        this.fornecedoresLista = dados ?? [];
      },
      error: () => {
        this.fornecedoresLista = [];
      }
    });

    this.abastecimentoService.listarEquipamentosMobile().subscribe({
      next: dados => {
        this.equipamentosLista = dados ?? [];
      },
      error: () => {
        this.equipamentosLista = [];
      }
    });
  }

  onFornecedorSelecionado(item: any) {
    this.fornecedorId = item?.id ?? null;
  }

  onEquipamentoSelecionado(item: any) {
    this.equipamentoId = item?.id ?? null;
  }

  onBack() {
    this.router.navigate(['/tabs/abastecimento']);
  }

  async openCalendar(event: any, fieldName: 'dataInicial' | 'dataFinal') {
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
      if (fieldName === 'dataInicial') {
        this.dataInicial = null;
      } else {
        this.dataFinal = null;
      }
      return;
    }

    if (data?.date) {
      if (fieldName === 'dataInicial') {
        this.dataInicial = data.date;
      } else {
        this.dataFinal = data.date;
      }
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
limparData(campo: 'dataInicial' | 'dataFinal', event?: Event) {
  event?.stopPropagation(); // 👈 evita abrir o calendário

  if (campo === 'dataInicial') {
    this.dataInicial = null;
  }

  if (campo === 'dataFinal') {
    this.dataFinal = null;
  }
}
  async pesquisar() {
    const possuiFiltro = [
      this.fornecedorId,
      this.equipamentoId,
      this.dataInicial,
      this.dataFinal,
      this.numeroVoucher,
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
      fornecedorId: this.fornecedorId,
      equipamentoId: this.equipamentoId,
      dataInicial: this.dataInicial,
      dataFinal: this.dataFinal,
      numVoucher: this.numeroVoucher,
    };

    this.router.navigate(
      ['/tabs/abastecimento-postos-pesquisa'],
      { queryParams: filtros }
    );
  }

  novo() {
    this.router.navigate(['/tabs/abastecimento-postos-edicao']);
  }
}
