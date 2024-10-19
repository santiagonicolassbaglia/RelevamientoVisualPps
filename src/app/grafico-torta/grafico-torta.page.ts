import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonImg } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js'; 
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-grafico-torta',
  templateUrl: './grafico-torta.page.html',
  styleUrls: ['./grafico-torta.page.scss'],
  standalone: true,
  imports: [IonImg, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GraficoTortaPage implements OnInit {
 

    pieChartLabels: string[] = [];
    pieChartData: number[] = [];
    imageSrc: string = '';  // URL de la imagen de la foto
  
    constructor(private route: ActivatedRoute, private navCtrl: NavController) {}
  
    ngOnInit() {
      // Obtener los datos de las votaciones y la imagen desde el router
      this.pieChartLabels = this.route.snapshot.queryParams['labels'] ? JSON.parse(this.route.snapshot.queryParams['labels']) : [];
      this.pieChartData = this.route.snapshot.queryParams['data'] ? JSON.parse(this.route.snapshot.queryParams['data']) : [];
      this.imageSrc = this.route.snapshot.queryParams['imageSrc'];  // Obtenemos la URL de la imagen
  
      Chart.register(...registerables);  // Registrar los componentes de Chart.js
      this.crearGrafico();
    }
  
    crearGrafico() {
      const ctx = (document.getElementById('pieChart') as HTMLCanvasElement).getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.pieChartLabels,  // Usamos los votantes como etiquetas
          datasets: [{
            data: this.pieChartData,  // Cada votante representa 1 voto
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF', '#FF6384', '#36A2EB']
          }]
        }
      });
    }
  
    goBack() {
      this.navCtrl.back();  // Navegar hacia atrás
    }
  }
  