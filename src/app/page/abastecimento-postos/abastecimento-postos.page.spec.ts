import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbastecimentoPostosPage } from './abastecimento-postos.page';

describe('AbastecimentoPostosPage', () => {
  let component: AbastecimentoPostosPage;
  let fixture: ComponentFixture<AbastecimentoPostosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastecimentoPostosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
