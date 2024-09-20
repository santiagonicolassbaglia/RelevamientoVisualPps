import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraficoBarPage } from './grafico-bar.page';

describe('GraficoBarPage', () => {
  let component: GraficoBarPage;
  let fixture: ComponentFixture<GraficoBarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficoBarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
