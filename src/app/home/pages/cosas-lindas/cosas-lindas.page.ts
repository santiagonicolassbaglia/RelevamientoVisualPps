import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Solo necesitamos importar IonicModule
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from 'src/app/Service/auth.service';
import { Observable } from 'rxjs';
import { addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { PieChartComponent } from '../../../componentes/pie-chart/pie-chart.component';  // Asegúrate de tener este componente
import { NavController } from '@ionic/angular'; 


@Component({
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.page.html',
  styleUrls: ['./cosas-lindas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,NgIf],  // Usar solo IonicModule para los componentes de Ionic
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CosasLindasPage implements OnInit {
  fotos: Array<{ id: string, imageSrc: string, usuario: string, fecha: Date, votos: number, votantes: string[] }> = [];
  imageBase64: string | null = null;
  imageSrc: string | null = null;
  currentUser: any;
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  mostrarMisFotos: boolean = false;  // Nueva propiedad para manejar la visibilidad

  constructor(
    private firestore: Firestore, 
    private storage: Storage, 
    private authService: AuthService, 
    private modalController: ModalController, 
    private navCtrl: NavController
  ) {} 

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();  // Obtener el usuario actual
    this.cargarFotos();
  }

  // Método para mostrar solo las fotos que subió el usuario actual
  cargarFotosDelUsuario() {
    // Asegúrate de que this.currentUser tenga el email del usuario autenticado
    const usuarioEmail = this.currentUser?.email || 'Desconocido';
  
    // Filtrar las fotos que pertenezcan al usuario actual
    const fotosDelUsuario = this.fotos.filter(foto => foto.usuario === usuarioEmail);
  
    return fotosDelUsuario;
  }
  

  // Cambiar la visibilidad de la sección con las fotos del usuario
  toggleMostrarMisFotos() {
    this.mostrarMisFotos = !this.mostrarMisFotos;
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
    const fotosPorUsuario = new Map<string, number>();
  
    // Contar cuántas fotos ha subido cada usuario
    this.fotos.forEach(foto => {
      const usuario = foto.usuario;
      if (fotosPorUsuario.has(usuario)) {
        fotosPorUsuario.set(usuario, fotosPorUsuario.get(usuario)! + 1);
      } else {
        fotosPorUsuario.set(usuario, 1);
      }
    });
  
    // Preparar las etiquetas y los datos para el gráfico
    this.pieChartLabels = Array.from(fotosPorUsuario.keys()).map(usuario => `Fotos de ${usuario}`);
    this.pieChartData = Array.from(fotosPorUsuario.values());
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

   

  abrirGraficoVotos(foto: any) {
    // Array para almacenar los nombres o correos de los votantes
    const labels: string[] = [];
  
    // Iteramos sobre los UIDs de los votantes y obtenemos sus correos electrónicos o nombres
    Promise.all(foto.votantes.map((votanteUid: string) => {
      return this.obtenerNombreVotante(votanteUid);
    })).then((nombresVotantes) => {
      // Asignamos los nombres obtenidos a las etiquetas
      const votosData = Array(foto.votantes.length).fill(1);
      const labels = nombresVotantes.map(nombre => `Voto de: ${nombre}`);
      
      // Navegamos a la página del gráfico de barras
      this.navCtrl.navigateForward('/grafico-torta', {
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
  abrirImagenEnPantallaGrande(fotoSeleccionada: any) {
    const selectedIndex = this.fotos.findIndex(foto => foto.id === fotoSeleccionada.id);
  
    this.navCtrl.navigateForward('/image-gallery', {
      queryParams: {
        images: JSON.stringify(this.fotos.map(f => f.imageSrc)),  // Pasar todas las imágenes
        index: selectedIndex  // Índice de la imagen seleccionada
      }
    });
  }
  
}
  
 