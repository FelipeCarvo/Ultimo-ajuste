import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoProprioPage } from './abastecimento-proprio.page';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoProprioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbastecimentoProprioPageRoutingModule {}
