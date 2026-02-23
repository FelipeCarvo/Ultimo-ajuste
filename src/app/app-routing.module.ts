import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'list-insumos',
    loadChildren: () => import('./page/central-request/list-insumos/list-insumos.module').then( m => m.ListInsumosPageModule)
  },
  {
    path: 'modal-altera-qtd-item',
    loadChildren: () => import('./page/central-request/request-ft-details/modal-altera-qtd-item/modal-altera-qtd-item.module').then( m => m.ModalAlteraQtdItemPageModule)
  },
  {
    path: 'ordem-servico',
    loadChildren: () => import('./page/ordem-servico/ordem-servico.module').then( m => m.OrdemServicoPageModule)
  },
  {
    path: 'ordem-servico-pesquisa',
    loadChildren: () => import('./page/ordem-servico-pesquisa/ordem-servico-pesquisa.module').then( m => m.OrdemServicoPesquisaPageModule)
  },
  {
    path: 'ordem-servico-edicao',
    loadChildren: () => import('./page/ordem-servico-edicao/ordem-servico-edicao.module').then( m => m.OrdemServicoEdicaoPageModule)
  },
  /*i
  {
    path: 'ordem-servico-defeitos',
    loadChildren: () => import('./page/ordem-servico-defeitos/ordem-servico-defeitos.module').then( m => m.OrdemServicoDefeitosPageModule)
  },
  */
  {
    path: 'ordem-servico-nova-foto',
    loadChildren: () => import('./page/ordem-servico-nova-foto/ordem-servico-nova-foto.module').then( m => m.OrdemServicoNovaFotoPageModule)
  },
  {
    path: 'abastecimento-proprio',
    loadChildren: () => import('./page/abastecimento-proprio/abastecimento-proprio.module').then( m => m.AbastecimentoProprioPageModule)
  },
  {
    path: 'abastecimento-proprio-pesquisa',
    loadChildren: () => import('./page/abastecimento-proprio-pesquisa/abastecimento-proprio-pesquisa.module').then( m => m.AbastecimentoProprioPesquisaPageModule)
  },
  {
    path: 'abastecimento-proprio-edicao',
    loadChildren: () => import('./page/abastecimento-proprio-edicao/abastecimento-proprio-edicao.module').then( m => m.AbastecimentoProprioEdicaoPageModule)
  },
  {
    path: 'abastecimento-postos',
    loadChildren: () => import('./page/abastecimento-postos/abastecimento-postos.module').then( m => m.AbastecimentoPostosPageModule)
  },
  {
    path: 'abastecimento-postos-pesquisa',
    loadChildren: () => import('./page/abastecimento-postos-pesquisa/abastecimento-postos-pesquisa.module').then( m => m.AbastecimentoPostosPesquisaPageModule)
  },
  {
    path: 'abastecimento-postos-edicao',
    loadChildren: () => import('./page/abastecimento-postos-edicao/abastecimento-postos-edicao.module').then( m => m.AbastecimentoPostosEdicaoPageModule)
  },



];
@NgModule({
  imports: [
    BrowserModule, CommonModule,RouterModule.forRoot(routes, {  onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}