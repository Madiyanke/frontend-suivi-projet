import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetService, AuthService, Projet } from '../../core/api.services';
import { RouterLink } from '@angular/router';
import { Projets } from '../../projets/projets/projets';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  projetService = inject(ProjetService);

  today = new Date();
  loading = signal(true);
  
  // State Data
  allProjets = signal<Projet[]>([]);

  // Computed Stats (Calculés automatiquement quand allProjets change)
  stats = computed(() => {
    const projets = this.allProjets();
    return {
      total: projets.length,
      enCours: projets.filter(p => p.etat === 'EN_COURS').length,
      termines: projets.filter(p => p.etat === 'TERMINE').length,
      etudiants: projets.reduce((acc, p) => acc + (p.etudiants?.length || 0), 0)
    };
  });

  recentProjets = computed(() => {
    // On prend les 4 derniers projets
    return [...this.allProjets()].slice(-4).reverse();
  });

  ngOnInit() {
    this.projetService.getAll().subscribe({
      next: (data) => {
        this.allProjets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Erreur chargement dashboard", err);
        this.loading.set(false);
      }
    });
  }

  getStatusClass(etat: string) {
    switch(etat) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-700';
      case 'TERMINE': return 'bg-emerald-100 text-emerald-700';
      case 'EN_ATTENTE': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

}