import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraficoTortaPage } from './grafico-torta.page';

describe('GraficoTortaPage', () => {
  let component: GraficoTortaPage;
  let fixture: ComponentFixture<GraficoTortaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficoTortaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
