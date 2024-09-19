import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from 'src/app/Service/auth.service';
import { Observable } from 'rxjs';
import { addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.page.html',
  styleUrls: ['./cosas-lindas.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonList, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CosasLindasPage implements OnInit {
  fotos: Array<{ imageSrc: string, usuario: string, fecha: Date }> = [];  // Array para almacenar las fotos
  imageBase64: string | null = null;  // Base64 de la imagen seleccionada o tomada
  imageSrc: string | null = null;  // Imagen seleccionada o tomada para mostrarla en la vista

  constructor(private firestore: Firestore, private storage: Storage, private authService: AuthService) {}

  // Cargar las fotos desde Firestore al iniciar la pantalla
  ngOnInit() {
    this.cargarFotos();
  }

  // Método para cargar fotos desde Firestore
  cargarFotos() {
    const fotosCollection = collection(this.firestore, 'fotos-lindas');
    collectionData(fotosCollection, { idField: 'id' }).subscribe((fotos: any[]) => {
      this.fotos = fotos.map(foto => ({
        imageSrc: foto.url,  // La URL de la imagen subida a Firebase Storage
        usuario: foto.usuario,  // El usuario que subió la foto
        fecha: foto.fecha.toDate()  // Convertir el timestamp de Firestore a un objeto Date
      }));
    });
  }

  // Método para tomar o seleccionar una foto
  async tomarFoto() {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      promptLabelHeader: 'Selecciona una opción',  // Texto del encabezado
      promptLabelPhoto: 'Seleccionar imagen de la galería',  // Texto para seleccionar imagen
      promptLabelPicture: 'Tomar foto',  // Texto para tomar foto
      promptLabelCancel: 'Cancelar',  // Texto del botón de cancelar
    });


    // Guardar la imagen seleccionada en base64
    this.imageBase64 = image.base64String || null;

    // Mostrar la imagen en la interfaz
    this.imageSrc = `data:image/jpeg;base64,${this.imageBase64}`;
  }

  // Método para subir la foto a Firebase Storage
  async subirFoto() {
    if (!this.imageBase64) {
      console.error('No hay imagen para subir');
      return;
    }

    const currentUser = this.authService.getCurrentUser();  // Obtener usuario actual
    const filePath = `fotos-lindas/${Date.now()}_${currentUser?.uid}.jpg`;  // Definir la ruta en Storage
    const storageRef = ref(this.storage, filePath);  // Crear referencia al archivo en Firebase Storage

    // Subir la imagen a Firebase Storage
    await uploadString(storageRef, this.imageBase64, 'base64');

    // Obtener la URL de la imagen subida
    const downloadURL = await getDownloadURL(storageRef);

    // Guardar la URL de la imagen en Firestore junto con el usuario y la fecha
    const fotosCollection = collection(this.firestore, 'fotos-lindas');
    await addDoc(fotosCollection, {
      url: downloadURL,
      fecha: new Date(),
      usuario: currentUser?.email || 'Desconocido',  // Guardar el nombre del usuario relacionado con la foto
    });

    // Limpiar la imagen seleccionada después de subirla
    this.imageSrc = null;
    this.imageBase64 = null;
  }
}
