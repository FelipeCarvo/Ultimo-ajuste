import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrdemServicoPageRoutingModule } from './ordem-servico-routing.module';
import { OrdemServicoPage } from './ordem-servico.page';

import { AutocompleteComponent } from '../../components/autocomplete/autocomplete.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdemServicoPageRoutingModule,
    AutocompleteComponent // ✅ standalone entra aqui
  ],
  declarations: [OrdemServicoPage]
})
export class OrdemServicoPageModule {}
