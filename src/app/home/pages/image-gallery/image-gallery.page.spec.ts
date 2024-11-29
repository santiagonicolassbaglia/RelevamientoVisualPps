import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageGalleryPage } from './image-gallery.page';

describe('ImageGalleryPage', () => {
  let component: ImageGalleryPage;
  let fixture: ComponentFixture<ImageGalleryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGalleryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
