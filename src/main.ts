import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { App } from './app/app';
import { Login } from './app/auth/login/login';
import { authInterceptor, errorInterceptor } from './app/core/api.services'; 
import { authGuard, adminGuard } from './app/core/guards/auth.guard';
import { Projets } from './app/projets/projets/projets';
import { Users } from './app/users/users';
import { ProjetDetail } from './app/projets/projet-detail/projet-detail';
import { Dashboard } from './app/dashboard/dashboard/dashboard';
import { from } from 'rxjs';

const routes: Routes = [
  { path: 'login', component: Login},
  { 
    path: '', 
    canActivate: [authGuard], 
    children: [
      // La redirection par défaut dépendra du composant Login, 
      // mais ici on peut laisser dashboard par défaut pour l'admin
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [adminGuard] // SÉCURITÉ ADMIN
      },
      { path: 'users', component: Users },
      { path: 'projets', component: Projets },
      { path: 'projets/:id', component: ProjetDetail }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));