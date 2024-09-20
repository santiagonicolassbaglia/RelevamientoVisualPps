import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from 'src/app/Service/auth.service';
import { Observable } from 'rxjs';
import { addDoc, doc, updateDoc } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { BarChartComponent } from '../../../componentes/bar-chart/bar-chart.component';  // Componente para gráfico de barras

@Component({
  selector: 'app-cosas-feas',
  templateUrl: './cosas-feas.page.html',
  styleUrls: ['./cosas-feas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CosasFeasPage implements OnInit {
  fotos: Array<{ id: string, imageSrc: string, usuario: string, fecha: Date, votos: number, votantes: string[] }> = [];
  imageBase64: string | null = null;
  imageSrc: string | null = null;
  currentUser: any;
  barChartLabels: string[] = [];
  barChartData: number[] = [];

  constructor(private firestore: Firestore, private storage: Storage, private authService: AuthService, private modalController: ModalController) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarFotos();
  }

  cargarFotos() {
    const fotosCollection = collection(this.firestore, 'fotos-feas');  // Cambiar a 'fotos-feas'
    const fotosQuery = query(fotosCollection, orderBy('fecha', 'desc'));
    collectionData(fotosQuery, { idField: 'id' }).subscribe((fotos: any[]) => {
      this.fotos = fotos.map(foto => ({
        id: foto.id,
        imageSrc: foto.url,
        usuario: foto.usuario,
        fecha: foto.fecha.toDate(),
        votos: foto.votos || 0,
        votantes: foto.votantes || []
      }));

      this.prepararDatosGrafico();  // Prepara los datos para el gráfico de barras
    });
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      promptLabelHeader: 'Selecciona una opción',
      promptLabelPhoto: 'Seleccionar imagen de la galería',
      promptLabelPicture: 'Tomar foto',
      promptLabelCancel: 'Cancelar',
    });

    this.imageBase64 = image.base64String || null;
    this.imageSrc = `data:image/jpeg;base64,${this.imageBase64}`;
  }

  async subirFoto() {
    if (!this.imageBase64) {
      console.error('No hay imagen para subir');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const filePath = `fotos-feas/${Date.now()}_${currentUser?.uid}.jpg`;
    const storageRef = ref(this.storage, filePath);

    await uploadString(storageRef, this.imageBase64, 'base64');
    const downloadURL = await getDownloadURL(storageRef);

    const fotosCollection = collection(this.firestore, 'fotos-feas');  // Cambiar a 'fotos-feas'
    await addDoc(fotosCollection, {
      url: downloadURL,
      fecha: new Date(),
      usuario: currentUser?.email || 'Desconocido',
      votos: 0,
      votantes: []
    });

    this.imageSrc = null;
    this.imageBase64 = null;
  }

  async votar(foto: any) {
    const currentUserUid = this.currentUser?.uid;

    if (!currentUserUid) {
      console.error('Usuario no autenticado');
      return;
    }

    const fotoDocRef = doc(this.firestore, `fotos-feas/${foto.id}`);  // Cambiar a 'fotos-feas'

    const yaVotado = foto.votantes.includes(currentUserUid);

    if (yaVotado) {
      const nuevoNumeroDeVotos = foto.votos - 1;
      const nuevosVotantes = foto.votantes.filter(votante => votante !== currentUserUid);

      await updateDoc(fotoDocRef, {
        votos: nuevoNumeroDeVotos,
        votantes: nuevosVotantes
      });

      foto.votos = nuevoNumeroDeVotos;
      foto.votantes = nuevosVotantes;

    } else {
      const nuevoNumeroDeVotos = foto.votos + 1;
      const nuevosVotantes = [...foto.votantes, currentUserUid];

      await updateDoc(fotoDocRef, {
        votos: nuevoNumeroDeVotos,
        votantes: nuevosVotantes
      });

      foto.votos = nuevoNumeroDeVotos;
      foto.votantes = nuevosVotantes;
    }
  }

  prepararDatosGrafico() {
    this.barChartLabels = this.fotos.map(foto => `Foto de ${foto.usuario}`);
    this.barChartData = this.fotos.map(foto => foto.votos);
  }

  async abrirGrafico() {
    const modal = await this.modalController.create({
      component: BarChartComponent,
      componentProps: {
        labels: this.barChartLabels,
        data: this.barChartData
      }
    });
    return await modal.present();
  }
}