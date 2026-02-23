import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CalendarPopoverComponent } from '../../components/calendar-popover/calendar-popover.component';

@Component({
  standalone: false,
  selector: 'app-abastecimento-proprio',
  templateUrl: './abastecimento-proprio.page.html',
  styleUrls: ['./abastecimento-proprio.page.scss'],
})
export class AbastecimentoProprioPage implements OnInit {

  // filtros da tela
  origemTanque = '';
  equipamento = '';
  dataInicial: string | null = null;
  dataFinal: string | null = null;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {}

  // casinha
  onBack() {
    this.router.navigate(['/tabs/abastecimento']);
  }

  // botão NOVO
  goNovo() {
    // Adiciona timestamp para forçar nova instância limpa do componente
    this.router.navigate(['/tabs/abastecimento-proprio-edicao'], {
      queryParams: { t: Date.now() }
    });
  }

  // abre o calendário para o campo informado
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

    if (data && data.date) {
      if (campo === 'dataInicial') {
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

  // botão PESQUISAR
  pesquisar() {
    const filtros = {
      origemTanque: this.origemTanque,
      equipamento: this.equipamento,
      dataInicial: this.dataInicial,
      dataFinal: this.dataFinal,
    };

    this.router.navigate(
      ['/tabs/abastecimento-proprio-pesquisa'],
      { queryParams: filtros }
    );
  }
}
