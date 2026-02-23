import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdemServicoNovaFotoPage } from './ordem-servico-nova-foto.page';

const routes: Routes = [
  {
    path: '',
    component: OrdemServicoNovaFotoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdemServicoNovaFotoPageRoutingModule {}