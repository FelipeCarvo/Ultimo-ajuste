import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AbastecimentoProprioPesquisaPageRoutingModule } from './abastecimento-proprio-pesquisa-routing.module';
import { AbastecimentoProprioPesquisaPage } from './abastecimento-proprio-pesquisa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbastecimentoProprioPesquisaPageRoutingModule
  ],
  declarations: [AbastecimentoProprioPesquisaPage]
})
export class AbastecimentoProprioPesquisaPageModule {}