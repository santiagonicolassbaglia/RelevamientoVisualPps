import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';  // Importar Chart.js
 

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BarChartComponent implements OnInit {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    Chart.register(...registerables); // Registrar los componentes de Chart.js
    this.crearGrafico();
  }

  // Crear el gráfico de barras
  crearGrafico() {
    const ctx = (document.getElementById('barChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) { // Verificación de que el contexto esté disponible
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [{
            data: this.data,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF'],
          }]
        },
        options: {
          responsive: true, // Asegurar que sea responsive
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true, // Asegurar que el eje Y comience en cero
            }
          }
        }
      });
    } else {
      console.error("Contexto no encontrado para 'barChart'");
    }
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}