import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { FrotasHomePage } from './frotas-home.page';

// 1. ESTA É A LINHA DE IMPORTAÇÃO CORRIGIDA:
import { MenuComponentComponentModule } from '../../shared/components/menu-cp/menu.module';

const routes: Routes = [
  { path: '', component: FrotasHomePage }
];

@NgModule({
  declarations: [FrotasHomePage],
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    RouterModule.forChild(routes),
    
    // 2. ADICIONANDO O MÓDULO DO MENU AQUI:
    MenuComponentComponentModule 
  ],
})
export class FrotasHomePageModule {}