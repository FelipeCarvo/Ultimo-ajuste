import { Component, OnInit,Input } from '@angular/core';
import {RequestService} from '@services/request/request.service';
import {LoadingService} from '@services/loading/loading-service';
import {AlertServices} from '@services/utils/alerts-services/alerts-services';
import { ToastController } from '@ionic/angular';
@Component({
    selector: 'app-justificativa',
    templateUrl: './justificativa.component.html',
    styleUrls: ['./justificativa.component.scss'],
    standalone: false
})
export class JustificativaComponent implements OnInit {
  @Input() versaoEsperada:Number;
  @Input()requisicaoId:String;
  load:Boolean = false;
  justificativaList:Array<{}>;
  constructor(
    private requestService:RequestService,
    public loading: LoadingService,
    private alertServices: AlertServices,
    private toastController:ToastController,
  ) { 
    
  }
  ngAfterViewInit(){
    this.getJustifcativa()
  }
  ngOnInit() {
   this.getJustifcativa()
  }
  getJustifcativa(){
    this.loading.present();
    this.requestService.getJustifcativa(this.requisicaoId).subscribe((res:any) =>{
      this.load = true;
      this.justificativaList = res;
   
      this.loading.dismiss();
    },async(error)=>{
      this.loading.dismiss();
      const toast = await this.toastController.create({
        message: error,
        duration: 4000
      });
      toast.present();
    })
  }

}
