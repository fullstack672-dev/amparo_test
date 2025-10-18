import { Routes } from '@angular/router';
import { AuthGuard } from './gifs/guards/auth.guard';
import { SuperAdminGuard } from './gifs/guards/super-admin.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./gifs/pages/login-page/login-page.component')
  },
  {
    path: 'register',
    loadComponent: () => import('./gifs/pages/register-page/register-page.component')
  },
  // Dashboard routes
  {
    path: 'dashboard',
    loadComponent: () => import('./gifs/pages/dashboard-page/dashboard-page.component'),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'usuario',
        loadComponent: () => import('./gifs/pages/usuario-page/usuario-page.component'),
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'usuario-admin',
        loadComponent: () => import('./gifs/pages/usuario-admin-page/usuario-admin-page.component'),
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'notificacion',
        loadComponent: () => import('./gifs/pages/notificacion-page/notificacion-page.component'),
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'notificacion-registro',
        loadComponent: () => import('./gifs/pages/notificacion-registro-page/notificacion-registro-page.component'),
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'juzgados',
        loadComponent: () => import('./gifs/pages/juzgados-page/juzgados-page.component'),
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'perfiles',
        loadComponent: () => import('./gifs/pages/perfiles-page/perfiles-page.component'),
        canActivate: [SuperAdminGuard]
      },
      {
        path: '**',
        redirectTo: 'usuario'
      }
    ]
  },
  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];