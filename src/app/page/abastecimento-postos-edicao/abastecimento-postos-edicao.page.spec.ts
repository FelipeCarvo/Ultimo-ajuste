import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbastecimentoPostosEdicaoPage } from './abastecimento-postos-edicao.page';

describe('AbastecimentoPostosEdicaoPage', () => {
  let component: AbastecimentoPostosEdicaoPage;
  let fixture: ComponentFixture<AbastecimentoPostosEdicaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastecimentoPostosEdicaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
