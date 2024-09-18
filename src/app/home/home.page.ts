import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonIcon, IonFab } from '@ionic/angular/standalone';
import { AuthService } from '../Service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonFab, IonIcon, IonButton, IonImg, IonImg, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HomePage {constructor(private authService: AuthService, private router: Router) {}

logout() {
  this.authService.logout().then(() => {
    this.router.navigate(['/login']);  // Redirigir al login después de cerrar sesión
  }).catch(error => {
    console.error('Error al cerrar sesión', error);
  });
}
}
