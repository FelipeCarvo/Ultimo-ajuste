import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AbastecimentoProprioEdicaoPageRoutingModule } from './abastecimento-proprio-edicao-routing.module';
import { AbastecimentoProprioEdicaoPage } from './abastecimento-proprio-edicao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbastecimentoProprioEdicaoPageRoutingModule,
  ],
  declarations: [AbastecimentoProprioEdicaoPage],
})
export class AbastecimentoProprioEdicaoPageModule {}
