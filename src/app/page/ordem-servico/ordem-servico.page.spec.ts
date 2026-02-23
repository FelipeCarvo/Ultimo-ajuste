import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoPage } from './ordem-servico.page';

describe('OrdemServicoPage', () => {
  let component: OrdemServicoPage;
  let fixture: ComponentFixture<OrdemServicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
