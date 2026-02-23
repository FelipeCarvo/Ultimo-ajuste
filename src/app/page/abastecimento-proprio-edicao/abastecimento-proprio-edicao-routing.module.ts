import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbastecimentoProprioEdicaoPage } from './abastecimento-proprio-edicao.page';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoProprioEdicaoPage,
  },
  {
    path: ':id',
    component: AbastecimentoProprioEdicaoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbastecimentoProprioEdicaoPageRoutingModule {}
