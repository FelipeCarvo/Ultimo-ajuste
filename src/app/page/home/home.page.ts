import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { RequestService } from '@services/request/request.service';
import { translateAnimation, rotateAnimation } from '@services/animation/custom-animation';
import { Store } from '@ngxs/store';
import { ReqState } from '@core/store/state/req.state';
import { ResetStateReq } from '@core/store/actions/req.actions';
import { ResetStateInsumos } from '@core/store/actions/insumos.actions';

import { formatISO, setHours, setMinutes, setSeconds } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [translateAnimation(), rotateAnimation()],
  standalone: false
})
export class homePage {

  listReq: Array<any> = [];
  load = false;
  showFIlters = false;
  statusRequisicao = 2;
  empreendimento: '';
  dataInicial = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  dataFinal = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

  /** 
   * false = tela só com os dois botões (Requisição / Estoque)
   * true  = tela com "Nova Requisição" + lista
   */
  showReqList = false;

  constructor(
    private router: Router,
    private rquestService: RequestService,
    private store: Store,
  ) { }

  ngAfterViewInit() { }

  // Helper
  get validReqId() {
    return this.store.selectSnapshot(ReqState.validReqId);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    // Só carrega as requisições quando estiver na tela de lista
    if (this.showReqList) {
      this.getReq();
    }
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    // Ao entrar vindo do menu "Obras", garante que volte para os 2 botões
    this.showReqList = false;
  }

  ngOnInit() {
    console.log('ngOnInit');
  }

  // ========= Fluxo de navegação =========

  /** Botão "Requisição de Compra" (tela de Obras) */
  goToReqListFromMenu() {
    this.showReqList = true;
    this.getReq();
  }

  /** Botão "Nova Requisição" (já dentro da tela de lista) */
  newRequest() {
    if (this.validReqId) {
      this.store.dispatch(new ResetStateInsumos());
      this.store.dispatch(new ResetStateReq());
    }
    this.router.navigate(['tabs/central-req/nova-req']);
  }

  /** Botão "Estoque" (tela de Obras) */
  goEstoque() {
    this.router.navigate(['/tabs/home-estoque']);
  }

  // Mantive os métodos de frota, se ainda forem usados em outro lugar
  newRequestFrota() {
    if (this.validReqId) {
      this.store.dispatch(new ResetStateInsumos());
      this.store.dispatch(new ResetStateReq());
    }
    this.router.navigate(['tabs/central-req/nova-req']);
  }

  newRequestFrotaBt() {
    if (this.validReqId) {
      this.store.dispatch(new ResetStateInsumos());
      this.store.dispatch(new ResetStateReq());
    }
    this.router.navigate(['tabs/central-req/nova-req-frota']);
  }

  viewAllRequest() {
    this.router.navigate(['tabs/all-request']);
  }

  // ========= Filtros / busca de requisições =========

  setParams(params) {
    this.showFIlters = false;
    const { dataFim, dataInicio, status, empreendimento } = params;
    this.dataInicial = dataInicio;
    this.dataFinal = dataFim;
    this.statusRequisicao = status;
    this.empreendimento = empreendimento;
    setTimeout(() => {
      this.getReq();
    }, 250);
  }

  getReq() {
    this.load = false;

    let data = this.dataFinal;
    data = setHours(data, 23);
    data = setMinutes(data, 59);
    data = setSeconds(data, 59);

    const params = {
      dataInicial: formatISO(this.dataInicial, { representation: 'date' }),
      dataFinal: formatISO(data),
      retificada: 'Todos',
      vistada: 'Todos',
      situacao: 'Todas',
      comTodosOsItensCancelados: true,
      statusRequisicao: this.statusRequisicao,
      filtrarComprador: false,
      exportadoConstruCompras: 'Todos',
      empreendimentoId: this.empreendimento
    };

    this.rquestService.getReq(params).subscribe((res: any) => {
      this.load = true;
      this.listReq = res;
    }, async (error) => {
      console.log(error);
      this.load = true;
    });
  }
}
