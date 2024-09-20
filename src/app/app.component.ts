import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { PieChartComponent } from './componentes/pie-chart/pie-chart.component';
import { BarChartComponent } from './componentes/bar-chart/bar-chart.component';
import { CosasFeasPage } from './home/pages/cosas-feas/cosas-feas.page';
import { CosasLindasPage } from './home/pages/cosas-lindas/cosas-lindas.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButton, IonContent, IonTitle, IonToolbar, IonHeader, IonApp, IonRouterOutlet,RouterOutlet,FormsModule,CommonModule,ReactiveFormsModule, PieChartComponent, BarChartComponent,CosasFeasPage,CosasLindasPage  ],
})
export class AppComponent {
  constructor() {}
}
