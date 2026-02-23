import { Component, OnInit,Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {UpdateRequestStatus} from '@services/send-status/send-status.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators ,UntypedFormControl} from '@angular/forms';
import { ToastController } from '@ionic/angular';
import {translateAnimation,rotateAnimation} from '@services/animation/custom-animation'
import { Store } from '@ngxs/store';
import {ResetStateReq} from '@core/store/actions/req.actions'
import { ResetStateInsumos } from '@core/store/actions/insumos.actions';
import { ActivatedRoute, Params, Router } from '@angular/router';
@Component({
    selector: 'app-modal-finish-req',
    templateUrl: './modal-finish-req.component.html',
    styleUrls: ['./modal-finish-req.component.scss'],
    animations: [translateAnimation()],
    standalone: false
})
export class ModalFinishReqComponent implements OnInit {
  @Input() id: string;
  @Input() versaoEsperada:number;
  @Input() currentStatus:String
  hasFinish = false;
  public formStatus: UntypedFormGroup;
  sendLoading: boolean = false;
  optionsSelect = [
    {
      name:'Reprovada',
      id:1,
      url:'/Reprovar',
      enum:'Reprovada'
    },
    {
      name:"Não Concluída",
      id:2,
      url:'/{id}/NaoConcluida/{versaoEsperada}',
      enum:"NãoConcluída"
    },
    {
      name:"Em Aprovação",
      id:3,
      url:'/{id}/EmAprovacao/{versaoEsperada}',
      enum:"EmAprovação"
    },
    {
      name:'Aprovada para Cotação',
      id:4,
      url:'/{id}/AprovarParaCotacao/{versaoEsperada}',
      enum:'AprovadaParaCotação',
    },
    {
      name:'Aprovada para O.F',
      id:5,
      url:'/{id}/AprovarParaOF/{versaoEsperada}',
      enum:'AprovadaParaOF'
    },
    {
      name:'Aprovada para O.F de Tranferência',
      id:6,
      url:'/{id}/AprovarParaOFTransferencia/{versaoEsperada}',
      enum:'AprovadaParaOFTransferência'
    },
    {
      name:'Aprovada para B.T',
      id:7,
      url:'/{id}/AprovarParaBT/{versaoEsperada}',
      enum:'AprovadaParaBT'
    },
    {
      name:'Cancelada',
      id:8,
      url:'/{id}/Cancelar/{versaoEsperada}',
      enum:'Cancelada'
    }
  ]
  constructor(
    public modalController: ModalController,
    private updateRequestStatus: UpdateRequestStatus,
    private formBuilder: UntypedFormBuilder,
    private toastController:ToastController,
    private store:Store,
    private router:Router
  ){

  }
  get validForm(){
    return this.formStatus.valid;
  }
  get formValue(){
    return this.formStatus.getRawValue();
  }
  ngOnInit() {
    const currentStatusId = this.optionsSelect.find(o => o.enum === this.currentStatus).id
    this.formStatus = this.formBuilder.group({
      satusId:  new UntypedFormControl(currentStatusId, [Validators.required]),
    });
  }
  public dismiss(): void {
    this.modalController.dismiss({
      dismissed: true
    });
  }
  resetReq(){
    this.store.dispatch(new ResetStateInsumos());
    this.store.dispatch(new ResetStateReq());
    this.dismiss()
  }
  async openErrorToast(error: any){
    const toast = await this.toastController.create({
      message: error,
      duration: 4000
    });
    toast.present();
  }
  async submit():Promise<void>{
    this.sendLoading = true;
    const {satusId} = this.formValue;
    let {url} = this.optionsSelect.filter(el=> el.id === satusId)[0];
    let body = {}
    if(satusId != 1 && (url.includes('{id}')||url.includes('{versaoEsperada}'))){
      url = url.replace('{id}',this.id).replace('{versaoEsperada}',this.versaoEsperada.toString())
    }else if(satusId ===1){
      body = {id:this.id,versaoEsperada:this.versaoEsperada,}
    }
    this.updateRequestStatus.sendReq(url,body).then(async(res) =>{
    this.sendLoading = false;
    this.hasFinish = !this.hasFinish;
    this.resetReq();
    this.router.navigate(['tabs/home']);
    await this.openErrorToast('Requisição finalizada com sucesso')
    },async(err) =>{
      this.sendLoading = false;
      await this.openErrorToast(err.Mensagem)
    });
    //this.hasFinish = !this.hasFinish
  }
}
