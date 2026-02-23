import { Component, Input,Output,EventEmitter, AfterViewInit,ChangeDetectorRef,HostListener } from '@angular/core';
import { ModalController, } from '@ionic/angular';
import { Router,ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetInsumosFileds } from '@core/store/actions/insumos.actions';
import { Subscription } from 'rxjs';
import {LoadingService} from '@services/loading/loading-service';
import {opacityAnimation} from '@services/animation/custom-animation';
import {InsumosRequest} from '@services/insumos/inusmo-req.service';
import {AlertServices} from '@services/utils/alerts-services/alerts-services';
@Component({
    selector: 'app-insumo',
    templateUrl: './insumo.component.html',
    styleUrls: ['./insumo.component.scss'],
    animations: [opacityAnimation()],
    standalone: false
})
export class InsumoComponent implements AfterViewInit {
  @Input() requisicaoId: string;
  @Input() versaoEsperada: number;
  @Input() validForm;
  subParams: Subscription;

  @Output() updateStep: EventEmitter<any> = new EventEmitter();
  @Output() updateButton: EventEmitter<any> = new EventEmitter();
  listInsumos: Array<any>;
  loading = false;
  constructor(
    public modalController: ModalController,
    public router: Router,
    private insumosRequest: InsumosRequest,
    public loadingService: LoadingService,
    private alertServices: AlertServices,
    private store: Store,
    public activatedroute: ActivatedRoute
  ){
  }
  ngAfterViewInit(){
    this.initApp();
  }
  ngOnInit(): void {
    this.initApp();
  }

  initApp(){
    if(!!this.validForm && !!this.requisicaoId){
      this.loading = false;
      this.getInsumos();
    }else{
      this.updateStep.emit(0);
    }

  }
  async excludeInsumo(id){
    const res = await this.alertServices.removerInsumo();
    if(res === 'confirm'){
      this.loadingService.present();
      const params = `RequisicaoId=${this.requisicaoId}&ItemId=${id}&VersaoEsperada=${this.versaoEsperada}`;
      this.insumosRequest.deleteById(params).then((res: any) =>{
        const index = this.listInsumos.findIndex((o) => o.id === id);
        if (index !== -1) { this.listInsumos.splice(index, 1); }
        if (this.listInsumos.length === 0) {
          this.updateButton.emit(false);
        }
        this.loadingService.dismiss();

      });
    }
  }
  editInsumo(id){
    this.loadingService.present();
    const params = `ItemId=${id}`;
    this.insumosRequest.getItemEdit(params).then((res: any) =>{
      this.loadingService.dismiss();
      const objResult = this.removeEmpty(res);
      this.store.dispatch(new SetInsumosFileds(objResult));
      this.router.navigate(['/tabs/central-req/insumos']);
    });
  }
  removeEmpty(obj) {
    return Object.entries(obj)
    .filter(([_, v]) => v != null)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
  }
  getInsumos(){
    this.insumosRequest.getInsumoById(this.requisicaoId).then((res: any) =>{
      this.listInsumos = res;
      setTimeout(() =>{
        if(res.length > 0){
          this.updateButton.emit(true);
        }
        this.loading = true;
      },200);
    });
  }

  presentModal(){
    if(this.validForm){
      this.router.navigate(['/tabs/central-req/insumos']);
    }
  }

}
