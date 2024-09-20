import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Solo necesitamos importar IonicModule
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from 'src/app/Service/auth.service';
import { Observable } from 'rxjs';
import { addDoc, doc, updateDoc } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { PieChartComponent } from '../../../componentes/pie-chart/pie-chart.component';  // Asegúrate de tener este componente
import { NavController } from '@ionic/angular'; 


@Component({
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.page.html',
  styleUrls: ['./cosas-lindas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],  // Usar solo IonicModule para los componentes de Ionic
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CosasLindasPage implements OnInit {
  fotos: Array<{ id: string, imageSrc: string, usuario: string, fecha: Date, votos: number, votantes: string[] }> = [];
  imageBase64: string | null = null;
  imageSrc: string | null = null;
  currentUser: any;
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];

  constructor(private firestore: Firestore, private storage: Storage, private authService: AuthService, private modalController: ModalController, private navCtrl: NavController) {}  // Incluir ModalController en el constructor

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();  // Obtener el usuario actual
    this.cargarFotos();
  }

  // Método para cargar fotos desde Firestore
  cargarFotos() {
    const fotosCollection = collection(this.firestore, 'fotos-lindas');
    const fotosQuery = query(fotosCollection, orderBy('fecha', 'desc'));  // Ordenar por fecha en orden descendente
    collectionData(fotosQuery, { idField: 'id' }).subscribe((fotos: any[]) => {
      this.fotos = fotos.map(foto => ({
        id: foto.id,
        imageSrc: foto.url,
        usuario: foto.usuario,
        fecha: foto.fecha.toDate(),
        votos: foto.votos || 0,  // Inicializamos los votos si no existen
        votantes: foto.votantes || []  // Lista de UIDs de los usuarios que han votado
      }));

      this.prepararDatosGrafico();  // Prepara los datos para el gráfico de torta
    });
  }

  // Método para tomar o seleccionar una foto
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

  // Método para subir la foto a Firebase Storage
  async subirFoto() {
    if (!this.imageBase64) {
      console.error('No hay imagen para subir');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const filePath = `fotos-lindas/${Date.now()}_${currentUser?.uid}.jpg`;
    const storageRef = ref(this.storage, filePath);

    await uploadString(storageRef, this.imageBase64, 'base64');
    const downloadURL = await getDownloadURL(storageRef);

    const fotosCollection = collection(this.firestore, 'fotos-lindas');
    await addDoc(fotosCollection, {
      url: downloadURL,
      fecha: new Date(),
      usuario: currentUser?.email || 'Desconocido',
      votos: 0,
      votantes: []  // Inicializamos la lista de votantes vacía
    });

    this.imageSrc = null;
    this.imageBase64 = null;
  }

  // Método para votar o quitar el voto
  async votar(foto: any) {
    const currentUserUid = this.currentUser?.uid;  // Obtener el UID del usuario actual

    if (!currentUserUid) {
      console.error('Usuario no autenticado');
      return;
    }

    const fotoDocRef = doc(this.firestore, `fotos-lindas/${foto.id}`);

    // Verificamos si el usuario ya ha votado por esta foto
    const yaVotado = foto.votantes.includes(currentUserUid);

    if (yaVotado) {
      // Si ya ha votado, retirar el voto
      const nuevoNumeroDeVotos = foto.votos - 1;
      const nuevosVotantes = foto.votantes.filter(votante => votante !== currentUserUid);

      await updateDoc(fotoDocRef, {
        votos: nuevoNumeroDeVotos,
        votantes: nuevosVotantes
      });

      // Actualizamos localmente la lista de fotos
      foto.votos = nuevoNumeroDeVotos;
      foto.votantes = nuevosVotantes;

    } else {
      // Si no ha votado, agregar el voto
      const nuevoNumeroDeVotos = foto.votos + 1;
      const nuevosVotantes = [...foto.votantes, currentUserUid];

      await updateDoc(fotoDocRef, {
        votos: nuevoNumeroDeVotos,
        votantes: nuevosVotantes
      });

      // Actualizamos localmente la lista de fotos
      foto.votos = nuevoNumeroDeVotos;
      foto.votantes = nuevosVotantes;
    }
  }

  prepararDatosGrafico() {
    this.pieChartLabels = this.fotos.map(foto => `Foto de ${foto.usuario}`);
    this.pieChartData = this.fotos.map(foto => foto.votos);
  }

  abrirGrafico() {
    this.prepararDatosGrafico();

    // Navegar a la página del gráfico pasando los datos
    this.navCtrl.navigateForward('/grafico-torta', {
      queryParams: {
        labels: JSON.stringify(this.pieChartLabels),
        data: JSON.stringify(this.pieChartData)
      }
    });
  }
}
