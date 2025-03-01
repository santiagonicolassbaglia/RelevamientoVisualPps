import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, collectionData, query, orderBy, getDoc, DocumentSnapshot } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from 'src/app/Service/auth.service';
import { Observable } from 'rxjs';
import { addDoc, doc, DocumentData, DocumentReference, updateDoc } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { BarChartComponent } from '../../../componentes/bar-chart/bar-chart.component'; 
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cosas-feas',
  templateUrl: './cosas-feas.page.html',
  styleUrls: ['./cosas-feas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CosasFeasPage implements OnInit {
  fotos: Array<{ id: string, imageSrc: string, usuario: string, fecha: Date, votos: number, votantes: string[] }> = [];
  imageBase64: string | null = null;
  imageSrc: string | null = null;
  currentUser: any;
  barChartLabels: string[] = [];
  barChartData: number[] = [];
  mostrarMisFotos: boolean = false;  // Propiedad para controlar la visibilidad de "Mis Fotos"

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService,
    private modalController: ModalController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();  // Obtener el usuario actual
    this.cargarFotos();  // Cargar las fotos al inicializar
  }

  // Método para cargar fotos desde Firestore (fotos-feas)
  cargarFotos() {
    const fotosCollection = collection(this.firestore, 'fotos-feas');  // Cambiado a fotos-feas
    const fotosQuery = query(fotosCollection, orderBy('fecha', 'desc'));  // Ordenar por fecha
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
    const filePath = `fotos-feas/${Date.now()}_${currentUser?.uid}.jpg`;  // Cambiado a fotos-feas
    const storageRef = ref(this.storage, filePath);

    await uploadString(storageRef, this.imageBase64, 'base64');
    const downloadURL = await getDownloadURL(storageRef);

    const fotosCollection = collection(this.firestore, 'fotos-feas');  // Cambiado a fotos-feas
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
    const currentUserUid = this.currentUser?.uid;

    if (!currentUserUid) {
      console.error('Usuario no autenticado');
      return;
    }

    const fotoDocRef = doc(this.firestore, `fotos-feas/${foto.id}`);  // Cambiado a fotos-feas

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

  // Método para mostrar solo las fotos que subió el usuario actual
  cargarFotosDelUsuario() {
    const usuarioEmail = this.currentUser?.email || 'Desconocido';
    const fotosDelUsuario = this.fotos.filter(foto => foto.usuario === usuarioEmail);
    return fotosDelUsuario;
  }

  // Cambiar la visibilidad de "Mis Fotos"
  toggleMostrarMisFotos() {
    this.mostrarMisFotos = !this.mostrarMisFotos;
  }

  // Método para preparar los datos del gráfico de barras
  prepararDatosGrafico() {
    const fotosPorUsuario: { [usuario: string]: number } = {};

    this.fotos.forEach(foto => {
      const usuario = foto.usuario || 'Desconocido';
      if (fotosPorUsuario[usuario]) {
        fotosPorUsuario[usuario]++;
      } else {
        fotosPorUsuario[usuario] = 1;
      }
    });

    this.barChartLabels = Object.keys(fotosPorUsuario);
    this.barChartData = Object.values(fotosPorUsuario);
  }

  // Método para abrir el gráfico de barras
  abrirGrafico() {
    this.prepararDatosGrafico();
    this.navCtrl.navigateForward('/grafico-bar', {
      queryParams: {
        labels: JSON.stringify(this.barChartLabels),
        data: JSON.stringify(this.barChartData)
      }
    });
  }

  abrirGraficoVotos(foto: any) {
    const labels: string[] = [];
    Promise.all(foto.votantes.map((votanteUid: string) => {
      return this.obtenerNombreVotante(votanteUid);
    })).then((nombresVotantes) => {
      const votosData = Array(foto.votantes.length).fill(1);
      const labels = nombresVotantes.map(nombre => `Voto de: ${nombre}`);
      this.navCtrl.navigateForward('/grafico-bar', {
        queryParams: {
          labels: JSON.stringify(labels),
          data: JSON.stringify(votosData),
          imageSrc: foto.imageSrc,
        },
      });
    }).catch(error => {
      console.error('Error al obtener los nombres de los votantes', error);
    });
  }

  // Método para obtener el nombre o correo electrónico del votante por UID
  async obtenerNombreVotante(votanteUid: string): Promise<string> {
    const usuarioDoc = await doc(this.firestore, `usuarios/${votanteUid}`);
    const usuarioSnapshot = await getDoc(usuarioDoc);
  
    if (usuarioSnapshot.exists()) {
      const data = usuarioSnapshot.data();
      return data["email"] || 'Usuario desconocido';  // Puedes ajustar esto según tu estructura de usuarios
    } else {
      return 'Usuario desconocido';
    }
  }

  // Método para abrir la imagen en pantalla grande
  abrirImagenEnPantallaGrande(fotoSeleccionada: any) {
    const selectedIndex = this.fotos.findIndex(foto => foto.id === fotoSeleccionada.id);
    
    console.log("Imagen seleccionada:", fotoSeleccionada);  // Para verificar qué imagen se selecciona
    console.log("Índice seleccionado:", selectedIndex);
  
    this.navCtrl.navigateForward('/image-gallery', {
      queryParams: {
        images: JSON.stringify(this.fotos.map(f => f.imageSrc)),
        index: selectedIndex
      }
    });
  }
  
}