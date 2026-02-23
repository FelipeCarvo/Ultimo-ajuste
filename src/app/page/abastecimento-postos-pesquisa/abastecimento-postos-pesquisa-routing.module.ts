import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoPostosPesquisaPage } from './abastecimento-postos-pesquisa.page';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoPostosPesquisaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbastecimentoPostosPesquisaPageRoutingModule {}
  