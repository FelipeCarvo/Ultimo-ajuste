import { Component} from '@angular/core';
import { Router} from '@angular/router';
import { Injectable } from '@angular/core';
import {RequestService} from '@services/request/request.service';
import {translateAnimation,rotateAnimation} from '@services/animation/custom-animation';
import { Store } from '@ngxs/store';
import {ReqState} from '@core/store/state/req.state';
import {ResetStateReq} from '@core/store/actions/req.actions';
import { ResetStateInsumos } from '@core/store/actions/insumos.actions';
import { setHours, setMinutes, setSeconds, formatISO } from 'date-fns';


@Injectable({
  providedIn: 'root'
})
@Component({
    selector: 'app-home',
    templateUrl: 'new-home.page.html',
    styleUrls: ['new-home.page.scss'],
    animations: [translateAnimation(), rotateAnimation()],
    standalone: false
})
export class newHomePage {
  listReq: Array<any> = [];
  load = false;
  showFIlters  = false;
  statusRequisicao  = 2;
  empreendimentoDescricao: any = '';
  dataInicial = new Date(Date.now()  - 10 * 24 * 60 * 60 * 1000);
  dataFinal = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  constructor(
    private router: Router,
    private rquestService: RequestService,
    private store: Store,
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
  ngOnInit(): void {
  }


  newRequest(){
    this.router.navigate(['tabs/home']);
  }
  newRequestFrota(){
    if(this.validReqId){
      this.store.dispatch(new ResetStateInsumos());
      this.store.dispatch(new ResetStateReq());
    }
    this.router.navigate(['tabs/home-estoque']);

  }
  newRequestFrotaBt(){
    if(this.validReqId){
      this.store.dispatch(new ResetStateInsumos());
      this.store.dispatch(new ResetStateReq());
    }
    this.router.navigate(['tabs/home-estoque']);
  }
  ordemServico() {
    console.log('Botão Ordem Serviço clicado, navegando para tabs/ordem-servico');
    this.router.navigate(['tabs/ordem-servico']);
  }

  abastecimento() {
    console.log('Botão Abastecimento clicado');
    this.router.navigate(['/tabs/abastecimento']);
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
    },250)

  }
  convertNumber(element){
    if(!this.empreendimentoDescricao){
      return;
    }
    return parseInt(element.replace(/[^0-9]/g,''), 10);
  }
  getReq(){
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
      comTodosOsItensCancelados:true,
      statusRequisicao:this.statusRequisicao,
      filtrarComprador: false,
      exportadoConstruCompras: 'Todos'

    };

    this.rquestService.getReq(params).subscribe((res: any) =>{

      setTimeout(()=>{
        this.load = true;
        this.dataInicial = new Date(this.dataInicial);
        this.dataFinal = new Date(this.dataFinal);

        if(!!this.empreendimentoDescricao){
          this.listReq = res.filter(el => el.empreendimento === this.convertNumber(this.empreendimentoDescricao));
        }else{
          this.listReq = res;
        }
      },200);
    },async (error)=>{
      console.log(error);
      this.load = true;
    });
  }
}