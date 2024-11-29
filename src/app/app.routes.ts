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
  {
    path: 'cosas-lindas',
    loadComponent: () => import('./home/pages/cosas-lindas/cosas-lindas.page').then( m => m.CosasLindasPage)
  },
  {
    path: 'cosas-feas',
    loadComponent: () => import('./home/pages/cosas-feas/cosas-feas.page').then( m => m.CosasFeasPage)
  },
  {
    path: 'grafico-bar',
    loadComponent: () => import('./home/pages/grafico-bar/grafico-bar.page').then( m => m.GraficoBarPage)
  },
  {
    path: 'grafico-torta',
    loadComponent: () => import('./grafico-torta/grafico-torta.page').then( m => m.GraficoTortaPage)
  },
  {
    path: 'image-gallery',
    loadComponent: () => import('./home/pages/image-gallery/image-gallery.page').then( m => m.ImageGalleryPage)
  },
  


];
