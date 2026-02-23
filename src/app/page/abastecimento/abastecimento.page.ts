import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-abastecimento',
  templateUrl: './abastecimento.page.html',
  styleUrls: ['./abastecimento.page.scss'],
})
export class AbastecimentoPage {

  constructor(private router: Router) {}

  // Abastecimento Próprio -> tela de pesquisa / filtro
  goAbastecimentoProprio() {
    this.router.navigate(['/tabs/abastecimento-proprio']);
  }

  // Abastecimento em Postos
  goAbastecimentoPostos() {
    this.router.navigate(['/tabs/abastecimento-postos']);
  }

  // Voltar para o menu de frotas (ajuste se quiser outro destino)
  voltar() {
    this.router.navigate(['/tabs/frotas-home']);
  }
}
