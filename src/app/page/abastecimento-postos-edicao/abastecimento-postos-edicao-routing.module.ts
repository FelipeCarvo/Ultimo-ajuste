import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AbastecimentoPostosEdicaoPage } from './abastecimento-postos-edicao.page';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoPostosEdicaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbastecimentoPostosEdicaoPageRoutingModule {}
