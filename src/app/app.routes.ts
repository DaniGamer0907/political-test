import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'test',
    loadComponent: () => import('./pages/test/test.component').then((m) => m.TestComponent),
  },
  {
    path: 'result',
    loadComponent: () => import('./pages/result/result.component').then((m) => m.ResultComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
