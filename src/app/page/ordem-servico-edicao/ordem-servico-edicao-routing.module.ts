import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdemServicoEdicaoPage } from './ordem-servico-edicao.page';

const routes: Routes = [
  {
    path: '',
    component: OrdemServicoEdicaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdemServicoEdicaoPageRoutingModule {}
