import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';  // Importar Chart.js

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
 
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PieChartComponent implements OnInit {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    Chart.register(...registerables);  // Registrar los componentes de Chart.js
    this.crearGrafico();
  }

  // Crear el gráfico de torta
   crearGrafico() {
    const ctx = (document.getElementById('pieChart') as HTMLCanvasElement).getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF'
          ]
        }]
      }
    });
  }

  // Cerrar el modal
  cerrarModal() {
    this.modalController.dismiss();
  }
}