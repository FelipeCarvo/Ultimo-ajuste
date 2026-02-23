import { Component, OnInit,OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import {FiltroItensDevolucao, RequestService} from '@services/request/request.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {translateAnimation} from '@services/animation/custom-animation';
import {LoadingService} from '@services/loading/loading-service';
import {Subject } from 'rxjs';
import { ToastController , ModalController} from '@ionic/angular';
import {FilterRequestFields} from '@services/utils/interfaces/request.interface';
import { formatISO } from 'date-fns';

@Component({
    selector: 'app-request-dev-frota',
    templateUrl: './itens-devolver-frotas.page.html',
    styleUrls: ['./itens-devolver-frotas.page.scss'],
    animations: [translateAnimation()],
    standalone: false
})
export class ItensDevolverFrotasPage implements OnInit,OnDestroy {

  itens = [];

  load = false;
  error = false;

  semItensParaDevolver = true;

  public unsubscribe$ = new Subject();
  listItemFilter: FilterRequestFields ={
    filteredOptionsEquipamento:null
  };
  paramsEntrada: Params;
  constructor(
    public navCtrl: NavController,
    private rquestService: RequestService,
    private router: Router,
    activatedRoute: ActivatedRoute,
    public loading: LoadingService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    ) {
      this.paramsEntrada = activatedRoute.snapshot.queryParams;
  }

  ngOnInit() {
    //this.getItens(); já chama no will enter, deixar aqui chama 2 vezes
  }

  ionViewWillEnter(){
    this.getItens();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.unsubscribe();
  }
  public dismiss(): void {
    this.navCtrl.back();
  }
  getItens(){
    const filtro = this.getParams();
    this.rquestService.getItensParaDevolver(filtro).subscribe((res: any) => {
      this.load = true;
      this.itens = res.map(item => {
        item.saldoQuantidadeEntregar = item.saldoQuantidadeDevolver;
        item.devolucaoObservacao = '';
        item.devolucaoComAvaria = false;
        return item;
      });
      this.semItensParaDevolver = (this.itens.length <= 0);
      this.error = false;
    }, async (error) => {
      this.load = true;
      this.error = true;
      const toast = await this.toastController.create({
        message: error.Mensagem,
        duration: 2000
      });
      toast.present();
    });
  }
  getParams(): FiltroItensDevolucao{
    const params = this.paramsEntrada;
    const retorno = new FiltroItensDevolucao();
    retorno.colaboradorId = params.colaboradorId;
    retorno.dataFim = params.dataFim;
    retorno.dataIni = params.dataIni;
    retorno.empreendimentoId = params.empreendimentoId;
    retorno.equipamentoId = params.equipamentoId;
    retorno.filtrarComSaldoDevolver = true;

    return retorno;
  }
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  goToEntregarTodos(){
    let lote = 0;
    this.rquestService.getNumeroLoteDevolucao().subscribe((res: any) => {
      lote = res[0].numeroLote;
      if (this.confirmaDevolucao(lote)) {
        this.router.navigate([`tabs/central-req/nova-req-frota/dev`]);
        this.loading.dismiss();
        return this.modalCtrl.dismiss(lote, 'confirm');
      } else {
        window.location.reload();
        return this.modalCtrl.dismiss(lote, 'confirm');
      }
    }, async (error) => {
      const toast = await this.toastController.create({
        message: error.Mensagem,
        duration: 2000
      });
      return;
    });
  }
  confirmaDevolucao(lote){
    let retorno = true;
    for (const element of this.itens) {
      if (element.saldoQuantidadeEntregar === '' || element.saldoQuantidadeEntregar === 0) {
        continue;
      }
      const paramsDev = {
        termoResponsabilidadeId: element.termoResponsabilidadeId,
        quantidadeBaixa: element.saldoQuantidadeEntregar,
        dataBaixa: formatISO(new Date()),
        equipamentoCodigo: element.equipamentoCod,
        loteDeBaixa: lote,
        devolucaoObservacao: element.devolucaoObservacao,
        devolucaoComAvaria: element.devolucaoComAvaria ? 1 : 0
      };
      console.log('confirmaDevolucao');
      console.log(paramsDev);
      this.rquestService.postConfirmarDevolucaoItemTermo(paramsDev)
        .subscribe((res: any) => {
          console.log('Retorno do postConfirmarDevolucaoItemTermo');
          console.log(res);
        },
          async (error) => {
            this.showMsg(error);
            retorno = false;
          });
    }
    return retorno;
  }
  async showMsg(msg){
    const toast = await this.toastController.create(
      {
        message: msg,
        duration: 4000
      }
    );
    toast.present();
  }

  zerarQuantidade(item: any) {
    item.saldoQuantidadeEntregar = 0;
  }

  atualizaQuantidadeEntregar(item: any, event: any) {
    item.saldoQuantidadeEntregar = parseFloat(event.detail.value) || 0;
  }

  atualizaComAvaria(item: any, event: any) {
    item.devolucaoComAvaria = event.detail.checked;
    if (!item.devolucaoComAvaria) {
      item.devolucaoObservacao = '';
    }
  }

  atualizaObservacao(item: any, event: any) {
    item.devolucaoObservacao = event.detail.value;
  }
}
