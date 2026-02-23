import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoEdicaoPage } from './ordem-servico-edicao.page';

describe('OrdemServicoEdicaoPage', () => {
  let component: OrdemServicoEdicaoPage;
  let fixture: ComponentFixture<OrdemServicoEdicaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoEdicaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
