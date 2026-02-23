import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-frotas-home',
  templateUrl: './frotas-home.page.html',
  styleUrls: ['./frotas-home.page.scss'],
})
export class FrotasHomePage {
  constructor(private router: Router) {}

  goOrdemServico() {
    this.router.navigate(['/tabs/ordem-servico']);
  }

  goAbastecimento() {
    this.router.navigate(['/tabs/abastecimento']);
  }

  goEstoque() {
    this.router.navigate(['/tabs/home-estoque']);
  }
}
