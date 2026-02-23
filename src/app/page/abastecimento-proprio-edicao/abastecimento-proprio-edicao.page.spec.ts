import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbastecimentoProprioEdicaoPage } from './abastecimento-proprio-edicao.page';

describe('AbastecimentoProprioEdicaoPage', () => {
  let component: AbastecimentoProprioEdicaoPage;
  let fixture: ComponentFixture<AbastecimentoProprioEdicaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastecimentoProprioEdicaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
