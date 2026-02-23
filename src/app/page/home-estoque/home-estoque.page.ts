import { Component,OnInit} from '@angular/core';
import { Router} from '@angular/router';
import { Injectable } from '@angular/core';
import {RequestService} from '@services/request/request.service';
import {translateAnimation,rotateAnimation} from '@services/animation/custom-animation';
import { Store } from '@ngxs/store';
import {ReqState} from '@core/store/state/req.state';
import {ResetStateReq} from '@core/store/actions/req.actions';
import { ResetStateInsumos } from '@core/store/actions/insumos.actions';


@Injectable({
  providedIn: 'root'
})
@Component({
    selector: 'app-home-estoque',
    templateUrl: 'home-estoque.page.html',
    styleUrls: ['home-estoque.page.scss'],
    animations: [translateAnimation(), rotateAnimation()],
    standalone: false
})
export class HomeEstoquePage {
  listReq: Array<any> = [];
  load = false;
  showFIlters: Boolean = false;
  statusRequisicao: Number = 2;
  empreendimentoDescricao:any = '';
  dataInicial = new Date(Date.now()  - 10 * 24 * 60 * 60 * 1000);
  dataFinal = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  constructor(
    private router:Router,
    private rquestService:RequestService,
    private store:Store,

   ) {
   }
   get validReqId(){
    return this.store.selectSnapshot(ReqState.validReqId);
  }
  ionViewDidEnter(){
    console.log('ionViewDidEnter');
    this.getReq();
  }
  ionViewWillEnter(){
    console.log('ionViewWillEnter');

  }
  ngOnInit() {
    console.log('ngOnInit');
    // this.getReq()
  }

  newRequest(rota){
    this.store.dispatch(new ResetStateInsumos());
    this.store.dispatch(new ResetStateReq());
    this.router.navigate([`tabs/central-req/nova-req-frota/${rota}`]);
  }
  newRequestFrota(){
    this.store.dispatch(new ResetStateInsumos());
    this.store.dispatch(new ResetStateReq());
    this.router.navigate(['tabs/central-req/nova-req']);

  }
  newRequestFrotaBt(){
    this.store.dispatch(new ResetStateInsumos());
    this.store.dispatch(new ResetStateReq());
    this.router.navigate(['tabs/central-req/nova-req-frota/dev']);
  }
  viewAllRequest(){
    this.router.navigate(['tabs/all-request']);
  }
  setParams(params){
    this.showFIlters = false;
    const {dataFim ,dataInicio , status,empreendimento} = params;
    this.dataInicial = dataInicio;
    this.dataFinal = dataFim;
    this.statusRequisicao = status;
    this.empreendimentoDescricao = empreendimento;
  
    setTimeout(() =>{
      this.getReq();
    },250);

  }
  convertNumber(element){
    if(!this.empreendimentoDescricao){
      return;
    }
    return parseInt(element.replace(/[^0-9]/g,''), 10);
  }
  getReq(){}
}
