import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbastecimentoProprioPage } from './abastecimento-proprio.page';

describe('AbastecimentoProprioPage', () => {
  let component: AbastecimentoProprioPage;
  let fixture: ComponentFixture<AbastecimentoProprioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbastecimentoProprioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
