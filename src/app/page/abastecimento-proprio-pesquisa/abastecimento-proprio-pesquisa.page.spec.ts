import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbastecimentoProprioPesquisaPage } from './abastecimento-proprio-pesquisa.page';

describe('AbastecimentoProprioPesquisaPage', () => {
  let component: AbastecimentoProprioPesquisaPage;
  let fixture: ComponentFixture<AbastecimentoProprioPesquisaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastecimentoProprioPesquisaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
