import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdemServicoPesquisaPage } from './ordem-servico-pesquisa.page';

const routes: Routes = [
  {
    path: '',
    component: OrdemServicoPesquisaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdemServicoPesquisaPageRoutingModule {}