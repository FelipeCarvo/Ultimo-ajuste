import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AbastecimentoPostosPesquisaPageRoutingModule } from './abastecimento-postos-pesquisa-routing.module';
import { AbastecimentoPostosPesquisaPage } from './abastecimento-postos-pesquisa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbastecimentoPostosPesquisaPageRoutingModule
  ],
  declarations: [AbastecimentoPostosPesquisaPage]
})
export class AbastecimentoPostosPesquisaPageModule {}  