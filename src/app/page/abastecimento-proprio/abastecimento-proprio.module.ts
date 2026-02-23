import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AbastecimentoProprioPageRoutingModule } from './abastecimento-proprio-routing.module';
import { AbastecimentoProprioPage } from './abastecimento-proprio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbastecimentoProprioPageRoutingModule,
  ],
  declarations: [AbastecimentoProprioPage],
})
export class AbastecimentoProprioPageModule {}
