import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/api.services';
import { ToastComponent } from './toast-component/toast-component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <!-- GLOBAL TOAST CONTAINER -->
    <app-toast></app-toast> 

    @if (!authService.currentUser()) {
      <router-outlet></router-outlet>
    } 
    @else {
      <div class="flex h-screen bg-slate-50 font-sans text-slate-800">
        
        <!-- SIDEBAR -->
        <aside class="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 shadow-sm transition-all">
          
          <div class="h-20 flex items-center px-8 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mr-3 shadow-md shadow-indigo-200">SP</div>
            <span class="font-bold text-lg tracking-tight text-slate-800">SuiviProjet</span>
          </div>

          <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div class="px-4 mb-2 text-xs font-bold uppercase text-slate-400 tracking-wider">Menu</div>
            
            <!-- DASHBOARD : Visible SEULEMENT pour les Admins -->
            @if (isAdmin()) {
              <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" 
                 class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all group">
                 <span class="group-hover:scale-110 transition-transform"></span> 
                 Tableau de bord
              </a>
            }

            <!-- PROJETS : Texte dynamique selon le rôle -->
            <a routerLink="/projets" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" 
               class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all group">
               <span class="group-hover:scale-110 transition-transform">📁</span> 
               {{ isAdmin() ? 'Tous les Projets' : 'Mes Projets' }}
            </a>

            @if (isAdmin()) {
              <div class="px-4 mt-8 mb-2 text-xs font-bold uppercase text-slate-400 tracking-wider">Administration</div>
              <a routerLink="/users" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" 
                 class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all group">
                 <span class="group-hover:scale-110 transition-transform">👥</span> 
                 Utilisateurs
              </a>
            }
          </nav>

          <div class="p-4 border-t border-slate-100">
            <div class="bg-slate-50 rounded-xl p-4 flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {{ authService.currentUser()?.prenom?.charAt(0) }}
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-bold text-slate-900 truncate">{{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</p>
                <p class="text-xs text-slate-500 truncate">{{ authService.currentUser()?.role }}</p>
              </div>
            </div>
            <button (click)="logout()" class="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </aside>

        <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header class="h-16 bg-white border-b border-slate-200 md:hidden flex items-center justify-between px-4 z-10">
             <span class="font-bold text-lg">SuiviProjet</span>
             <button (click)="logout()" class="text-sm text-slate-500">Sortir</button>
          </header>
          <div class="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
            <div class="max-w-7xl mx-auto animate-fade-in">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>
    }
  `
})
export class App {
  authService = inject(AuthService);
  private router = inject(Router);
  
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}