import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrdemServicoPesquisaPageRoutingModule } from './ordem-servico-pesquisa-routing.module';
import { OrdemServicoPesquisaPage } from './ordem-servico-pesquisa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdemServicoPesquisaPageRoutingModule
  ],
  declarations: [OrdemServicoPesquisaPage]
})
export class OrdemServicoPesquisaPageModule {}