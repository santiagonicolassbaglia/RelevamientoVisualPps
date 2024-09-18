import { Component, OnInit ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Firestore, collectionData, collection, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/Service/auth.service';


@Component({
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.page.html',
  styleUrls: ['./cosas-lindas.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonList, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, CommonModule, 
 
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CosasLindasPage  {

  fotos$: Observable<any[]>;

  constructor(private firestore: Firestore, private storage: Storage, private authService: AuthService) {
    const fotosCollection = collection(this.firestore, 'fotos-lindas');
    this.fotos$ = collectionData(fotosCollection, { idField: 'id' });
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
    });

    const filePath = `fotos-lindas/${Date.now()}_${this.authService.getCurrentUser()?.uid}.jpg`;
    const storageRef = ref(this.storage, filePath);
    await uploadString(storageRef, image.base64String || '', 'base64');

    const downloadURL = await getDownloadURL(storageRef);
    const fotosCollection = collection(this.firestore, 'fotos-lindas');
    
    // Guardar información de la foto en Firestore
    await addDoc(fotosCollection, {
      url: downloadURL,
      fecha: new Date(),
      usuario: this.authService.getCurrentUser()?.email,  // Obtener el email del usuario actual
    });
  }

}
