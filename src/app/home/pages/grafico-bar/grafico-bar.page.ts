import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonImg } from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js'; 
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-grafico-bar',
  templateUrl: './grafico-bar.page.html',
  styleUrls: ['./grafico-bar.page.scss'],
  standalone: true,
  imports: [IonImg, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GraficoBarPage implements OnInit {
  barChartLabels: string[] = [];
  barChartData: number[] = [];
  imageSrc: string = '';

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    this.barChartLabels = this.route.snapshot.queryParams['labels'] ? JSON.parse(this.route.snapshot.queryParams['labels']) : [];
    this.barChartData = this.route.snapshot.queryParams['data'] ? JSON.parse(this.route.snapshot.queryParams['data']) : [];
    this.imageSrc = this.route.snapshot.queryParams['imageSrc'];

    Chart.register(...registerables);
    this.crearGrafico();
  }

  crearGrafico() {
    const ctx = (document.getElementById('barChart') as HTMLCanvasElement).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.barChartLabels,
        datasets: [{
          label: 'Votos',
          data: this.barChartData,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF'],
        }]
      },
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}