import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbastecimentoPostosPesquisaPage } from './abastecimento-postos-pesquisa.page';

describe('AbastecimentoPostosPesquisaPage', () => {
  let component: AbastecimentoPostosPesquisaPage;
  let fixture: ComponentFixture<AbastecimentoPostosPesquisaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastecimentoPostosPesquisaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
