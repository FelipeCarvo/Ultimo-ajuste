import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { RouterTokenValidation } from './auth/validationToken';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('../page/login/login.module').then(m => m.LoginPagePageModule),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'home',
        loadChildren: () =>
          import('../page/home/home.module').then(m => m.homePageModule),
        data: { noHeader: false },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'new-home',
        loadChildren: () =>
          import('../page/newhome/new-home.module').then(m => m.newHomePageModule),
        data: { noHeader: false },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'ordem-servico',
        loadChildren: () =>
          import('../page/ordem-servico/ordem-servico.module').then(
            m => m.OrdemServicoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'ordem-servico-pesquisa',
        loadChildren: () =>
          import('../page/ordem-servico-pesquisa/ordem-servico-pesquisa.module').then(
            m => m.OrdemServicoPesquisaPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'ordem-servico-edicao',
        loadChildren: () =>
          import('../page/ordem-servico-edicao/ordem-servico-edicao.module').then(
            m => m.OrdemServicoEdicaoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'ordem-servico-edicao/:id',
        loadChildren: () =>
          import('../page/ordem-servico-edicao/ordem-servico-edicao.module').then(
            m => m.OrdemServicoEdicaoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      /*IGN
      {
        path: 'ordem-servico-defeitos',
        loadChildren: () =>
          import('../page/ordem-servico-defeitos/ordem-servico-defeitos.module').then(
            m => m.OrdemServicoDefeitosPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      */
      {
        path: 'ordem-servico-nova-foto',
        loadChildren: () =>
          import('../page/ordem-servico-nova-foto/ordem-servico-nova-foto.module').then(
            m => m.OrdemServicoNovaFotoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento',
        loadChildren: () =>
          import('../page/abastecimento/abastecimento.module').then(
            m => m.AbastecimentoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-proprio',
        loadChildren: () =>
          import('../page/abastecimento-proprio/abastecimento-proprio.module').then(
            m => m.AbastecimentoProprioPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-proprio-pesquisa',
        loadChildren: () =>
          import('../page/abastecimento-proprio-pesquisa/abastecimento-proprio-pesquisa.module').then(
            m => m.AbastecimentoProprioPesquisaPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-proprio-edicao',
        loadChildren: () =>
          import('../page/abastecimento-proprio-edicao/abastecimento-proprio-edicao.module')
            .then(m => m.AbastecimentoProprioEdicaoPageModule),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-proprio-edicao/:id',
        loadChildren: () =>
          import('../page/abastecimento-proprio-edicao/abastecimento-proprio-edicao.module')
            .then(m => m.AbastecimentoProprioEdicaoPageModule),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-postos',
        loadChildren: () =>
          import('../page/abastecimento-postos/abastecimento-postos.module').then(
            m => m.AbastecimentoPostosPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-postos-pesquisa',
        loadChildren: () =>
          import('../page/abastecimento-postos-pesquisa/abastecimento-postos-pesquisa.module').then(
            m => m.AbastecimentoPostosPesquisaPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-postos-edicao',
        loadChildren: () =>
          import('../page/abastecimento-postos-edicao/abastecimento-postos-edicao.module').then(
            m => m.AbastecimentoPostosEdicaoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'abastecimento-postos-edicao/:id',
        loadChildren: () =>
          import('../page/abastecimento-postos-edicao/abastecimento-postos-edicao.module').then(
            m => m.AbastecimentoPostosEdicaoPageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'home-estoque',
        loadChildren: () =>
          import('../page/home-estoque/home-estoque.module').then(
            m => m.HomeEstoquePageRoutingModule
          ),
        data: { noHeader: false },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../page/profile/profile.module').then(m => m.ProfilePageModule),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'all-request',
        loadChildren: () =>
          import('../page/allRequest/allRequest.module').then(m => m.AllRequestPageModule),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'central-req',
        loadChildren: () =>
          import('../page/central-request/central-module/centeal-estoque.module').then(
            m => m.CentealEstoquePageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'central-req-frota',
        loadChildren: () =>
          import('../page/central-request/central-module/centeal-estoque.module').then(
            m => m.CentealEstoquePageModule
          ),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },
      {
        path: 'detail-request/:requisicaoId',
        loadChildren: () =>
          import('../page/detail-request/detail-request.module').then(
            m => m.DetailRequestPageModule
          ),
        data: { noHeader: true },
      },
      {
        path: 'entrega-req-frota/:termoResponsabilidadeId/:termoResponsabilidadeItemId',
        loadChildren: () =>
          import('../page/central-request/entrega-item-estoque/entrega-frota.module').then(
            m => m.EntregaRequestPageModule
          ),
        data: { noHeader: true },
      },
      {
        path: 'request-dev-frota/:requisicaoId/:empreendimentoId',
        loadChildren: () =>
          import('../page/central-request/request-dev-frota/request-dev-frota.module').then(
            m => m.DetailRequestPageModule
          ),
        data: { noHeader: true },
      },
      {
        path: 'detail-request-frota/:requisicaoId/:empreendimentoId',
        loadChildren: () =>
          import('../page/central-request/request-ft-details/detail-frota.module').then(
            m => m.DetailRequestPageModule
          ),
        data: { noHeader: true },
      },
      {
        path: 'list-in-frota/:requisicaoId/:empreendimentoId',
        loadChildren: () =>
          import('../page/central-request/list-in-frota/list-in-frota.module').then(
            m => m.ListInsumosFrotaPageModule
          ),
        data: { noHeader: true },
      },
      {
        path: 'add-insumo-baixa/:requisicaoId/:empreendimentoId',
        loadChildren: () =>
          import('../page/central-request/add-insumo-baixa/add-insumo-baixa.module').then(
            m => m.AddInsumoBaixaPageModule
          ),
        data: { noHeader: true },
      },
      {
        path: 'frotas-home',
        loadChildren: () =>
          import('../page/frotas-home/frotas-home.module')
            .then(m => m.FrotasHomePageModule),
        data: { noHeader: true },
        canActivate: [RouterTokenValidation],
      },

      { path: '', redirectTo: '/tabs/home-principal', pathMatch: 'full' },
      { path: '**', redirectTo: '/tabs/home-principal', pathMatch: 'full' },
    ],
  },

  { path: '', redirectTo: '/tabs/home-principal', pathMatch: 'full' },
  { path: '**', redirectTo: '/tabs/home-principal', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
