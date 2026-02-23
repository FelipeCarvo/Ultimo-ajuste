import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoProprioPesquisaPage } from './abastecimento-proprio-pesquisa.page';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoProprioPesquisaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbastecimentoProprioPesquisaPageRoutingModule {}
