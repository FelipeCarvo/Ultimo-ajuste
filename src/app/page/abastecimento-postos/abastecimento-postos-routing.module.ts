import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoPostosPage } from './abastecimento-postos.page';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoPostosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbastecimentoPostosPageRoutingModule {}
