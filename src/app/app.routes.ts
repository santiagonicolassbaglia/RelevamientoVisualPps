import { Routes } from '@angular/router';

export const routes: Routes = [

  
  {
    path: '',
    redirectTo: 'splash',
     pathMatch: 'full'
  },
  { path: 'home',loadComponent: () => import('./home/home.page').then((m) => m.HomePage),},
  
  {path: 'login',loadComponent: () => import('./home/pages/login/login.page').then((m) => m.LoginPage),},
  {
    path: 'register',
    loadComponent: () => import('./home/pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'splash',
    loadComponent: () => import('./home/pages/splash/splash.page').then( m => m.SplashPage)
  },
  


];
