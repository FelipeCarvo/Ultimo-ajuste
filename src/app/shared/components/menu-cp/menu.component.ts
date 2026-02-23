// Caminho: src/app/shared/components/menu-cp/menu.component.ts

import { Component, Input } from '@angular/core'; // 1. Adicionar 'Input' aqui
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthUser } from '@core/store/state/auth.state';
import { Uteis } from '@core/Uteis';
@Component({
    selector: 'menu-root',
    templateUrl: 'menu.component.html',
    styleUrls: ['menu.component.scss'],
    standalone: false
})
export class MenuComponent {
   
   @Input() contentId: string = 'main'; // 2. ADICIONAR ESTA LINHA

   menuTitle = 'Menu';
   userName: String = null;
   constructor(private menu: MenuController,private router:Router,private store:Store) {}

   openFirst() {
     this.userName = this.store.selectSnapshot(AuthUser.getUserName)
     this.menu.enable(true, 'first');
     this.menu.open('first');
   }
    
    // ... (resto do seu código)
   redirect(route){
     this.router.navigate([ `/tabs/${route}`]);
     this.menu.close()
   }
   exit(){
     this.menu.close()
     setTimeout(() =>{
       Uteis.ZerarLogin(this.store);
       this.router.navigate([ `/tabs/login`]);
     },200)
   }
}