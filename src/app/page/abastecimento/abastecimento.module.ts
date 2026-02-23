
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { AbastecimentoPage } from './abastecimento.page';
import { AbastecimentoRoutingModule } from './abastecimento.routing';

@NgModule({
  imports: [IonicModule, AbastecimentoRoutingModule],
  declarations: [AbastecimentoPage]
})
export class AbastecimentoPageModule {}
