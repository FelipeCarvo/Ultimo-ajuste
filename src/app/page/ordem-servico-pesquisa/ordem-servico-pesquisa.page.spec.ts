import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoPesquisaPage } from './ordem-servico-pesquisa.page';

describe('OrdemServicoPesquisaPage', () => {
  let component: OrdemServicoPesquisaPage;
  let fixture: ComponentFixture<OrdemServicoPesquisaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoPesquisaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
