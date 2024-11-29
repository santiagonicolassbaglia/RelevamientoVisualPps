import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
 
import { Motion } from '@capacitor/motion';
import { NavController } from '@ionic/angular'
@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.page.html',
  styleUrls: ['./image-gallery.page.scss'],
  standalone: true,
  imports: [IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ImageGalleryPage implements OnInit {
  images: string[] = [];
  currentIndex = 0;
  currentImage: string = '';
  lastMoveTime = 0;  // Timestamp para evitar cambios rápidos

  // Ajusta el umbral de sensibilidad al movimiento
  readonly THRESHOLD_X = 4;  // Mayor valor para movimientos horizontales (izquierda, derecha)
  readonly SHAKE_THRESHOLD = 15;  // Umbral para detectar agitado del dispositivo
  readonly DEBOUNCE_TIME = 500;  // Tiempo en milisegundos entre cambios de fotos

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    // Obtener las imágenes y el índice desde los queryParams
    const imagesParam = this.route.snapshot.queryParams['images'];
    this.currentIndex = +this.route.snapshot.queryParams['index'] || 0;

    if (imagesParam) {
      this.images = JSON.parse(imagesParam);
    }

    this.currentImage = this.images[this.currentIndex];
    this.startListeningForDeviceMovement();
  }

  // Escuchar los movimientos del dispositivo
  startListeningForDeviceMovement() {
    Motion.addListener('accel', (event) => {
      const { x, y, z } = event.accelerationIncludingGravity;

      // Obtenemos el tiempo actual
      const currentTime = new Date().getTime();

      // Si el tiempo desde el último cambio es menor al debounce, no hacer nada
      if (currentTime - this.lastMoveTime < this.DEBOUNCE_TIME) {
        return;
      }

      // Movimiento hacia la derecha (pasa a la siguiente imagen)
      if (x > this.THRESHOLD_X) {
        this.nextImage();
        this.lastMoveTime = currentTime;
      }
      // Movimiento hacia la izquierda (pasa a la imagen anterior)
      else if (x < -this.THRESHOLD_X) {
        this.previousImage();
        this.lastMoveTime = currentTime;
      }
      // Detectar agitado (shake)
      else if (this.isShakeDetected(x, y, z)) {
        this.firstImage();
        this.lastMoveTime = currentTime;
      }
    });
  }

  // Método para detectar un agitado (shake) basado en los valores de aceleración
  isShakeDetected(x: number, y: number, z: number): boolean {
    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);
    return accelerationMagnitude > this.SHAKE_THRESHOLD;
  }

  // Siguiente imagen
  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentImage = this.images[this.currentIndex];
  }

  // Imagen anterior
  previousImage() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.currentImage = this.images[this.currentIndex];
  }

  // Volver a la primera imagen
  firstImage() {
    this.currentIndex = 0;
    this.currentImage = this.images[0];
  }

  goBack() {
    this.navCtrl.back();
  }
}