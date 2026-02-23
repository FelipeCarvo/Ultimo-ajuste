import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ActivationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {

  hiddenMenu: boolean = false;

  constructor(private menu: MenuController, private router: Router) {

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof ActivationEnd &&
            event.snapshot.children.length === 0
        )
      )
      .subscribe((event: ActivationEnd) => {
        // URL completa da rota atual, ex: /tabs/frotas-home
        const url = event.snapshot['_routerState'].url as string;

        // TELAS PRINCIPAIS ONDE O MENU DEVE APARECER
        const telasComMenu = [
          '/tabs/new-home',
          '/tabs/home',
          '/tabs/home-estoque',
          '/tabs/frotas-home',
          '/tabs/abastecimento'
        ];

        // ⚠️ AGORA: só mostra menu se a URL for exatamente uma dessas
        const deveMostrarMenu = telasComMenu.some(path =>
          url === path || url === path + '/'
        );

        // hiddenMenu = true => menu escondido
        this.hiddenMenu = !deveMostrarMenu;
      });
  }

  async ngOnInit() {
    setTimeout(async () => {
      await SplashScreen.hide();
    }, 3000);
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openEnd() {
    this.menu.open('end');
  }

  
  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }
}
