import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonIcon, IonFab } from '@ionic/angular/standalone';
import { AuthService } from '../Service/auth.service';
import { Router } from '@angular/router';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, orderBy, query } from 'firebase/firestore';
import { map } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonFab, IonIcon, IonButton, IonImg, IonImg, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HomePage implements OnInit {constructor(private authService: AuthService, private router: Router, private firestore: Firestore) {}
randomCosaLinda: string = '';
  randomCosaFea: string = '';



  ngOnInit() {
    this.getRandomImage('fotos-lindas').subscribe(imageUrl => {
      this.randomCosaLinda = imageUrl;
    });

    this.getRandomImage('fotos-feas').subscribe(imageUrl => {
      this.randomCosaFea = imageUrl;
    });
  }

  // Obtener una imagen aleatoria de una colección
  getRandomImage(collectionName: string) {
    const fotosCollection = collection(this.firestore, collectionName);
    const fotosQuery = query(fotosCollection, orderBy('fecha', 'desc'));
    return collectionData(fotosQuery, { idField: 'id' }).pipe(
      map((fotos: any[]) => {
        if (fotos.length > 0) {
          const randomIndex = Math.floor(Math.random() * fotos.length);
          return fotos[randomIndex].url;  // Devolver una URL aleatoria
        }
        return 'assets/img/default-image.png';  // Imagen predeterminada si no hay fotos
      })
    );
  }

logout() {
  this.authService.logout().then(() => {
    this.router.navigate(['/login']);  // Redirigir al login después de cerrar sesión
  }).catch(error => {
    console.error('Error al cerrar sesión', error);
  });
}

goToCosasLindas() {
  this.router.navigate(['/cosas-lindas']);  // Redirigir a la página de cosas lindas
}

goToCosasFeas() {
  this.router.navigate(['/cosas-feas']);  // Redirigir a la página de cosas feas
}


}
