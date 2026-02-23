import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoNovaFotoPage } from './ordem-servico-nova-foto.page';

describe('OrdemServicoNovaFotoPage', () => {
  let component: OrdemServicoNovaFotoPage;
  let fixture: ComponentFixture<OrdemServicoNovaFotoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoNovaFotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
