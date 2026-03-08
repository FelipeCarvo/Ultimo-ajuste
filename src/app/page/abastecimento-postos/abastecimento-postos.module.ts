import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AbastecimentoPostosPageRoutingModule } from './abastecimento-postos-routing.module';
import { AbastecimentoPostosPage } from './abastecimento-postos.page';
import { CalendarPopoverComponentModule } from '../../components/calendar-popover/calendar-popover.module';
import { AutocompleteComponent } from '../../components/autocomplete/autocomplete.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AbastecimentoPostosPageRoutingModule,
    CalendarPopoverComponentModule,
    AutocompleteComponent
  ],
  declarations: [AbastecimentoPostosPage]
})
export class AbastecimentoPostosPageModule {}