import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButton, IonContent, IonTitle, IonToolbar, IonHeader, IonApp, IonRouterOutlet,RouterOutlet,FormsModule,CommonModule,ReactiveFormsModule  ],
})
export class AppComponent {
  constructor() {}
}
