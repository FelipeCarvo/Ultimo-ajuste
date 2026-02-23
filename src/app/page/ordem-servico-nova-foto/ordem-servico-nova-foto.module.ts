import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrdemServicoNovaFotoPageRoutingModule } from './ordem-servico-nova-foto-routing.module';
import { OrdemServicoNovaFotoPage } from './ordem-servico-nova-foto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdemServicoNovaFotoPageRoutingModule
  ],
  declarations: [OrdemServicoNovaFotoPage]
})
export class OrdemServicoNovaFotoPageModule {}
