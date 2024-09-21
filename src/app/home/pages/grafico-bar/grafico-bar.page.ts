import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js'; 
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-grafico-bar',
  templateUrl: './grafico-bar.page.html',
  styleUrls: ['./grafico-bar.page.scss'],
  standalone: true,
  imports: [IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GraficoBarPage implements OnInit {
  barChartLabels: string[] = [];
  barChartData: number[] = [];

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    // Obtener los datos de las votaciones desde el router
    this.barChartLabels = this.route.snapshot.queryParams['labels'] ? JSON.parse(this.route.snapshot.queryParams['labels']) : [];
    this.barChartData = this.route.snapshot.queryParams['data'] ? JSON.parse(this.route.snapshot.queryParams['data']) : [];

    Chart.register(...registerables);  // Registrar los componentes de Chart.js
    this.crearGrafico();
  }

  crearGrafico() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.barChartLabels,
          datasets: [{
            data: this.barChartData,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF'],
          }]
        },
        options: {
          responsive: true, // Asegurar que sea responsive
          maintainAspectRatio: false, // Mantener relación de aspecto
          scales: {
            y: {
              beginAtZero: true  // Asegúrate de que el eje Y comience en cero
            }
          }
        }
      });
    } else {
      console.error('No se pudo obtener el contexto del canvas.');
    }
  }

  goBack() {
    this.navCtrl.back();  // Navegar hacia atrás
  }
}
