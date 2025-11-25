import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjetService, AuthService, UserService, Projet, User } from '../../core/api.services';

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './projets.html',
  styleUrl: './projets.scss'
})
export class Projets implements OnInit {
  projetService = inject(ProjetService);
  authService = inject(AuthService);
  userService = inject(UserService);

  projets = signal<Projet[]>([]);
  availableEncadrants = signal<User[]>([]);
  loading = signal(false);
  submitting = signal(false);
  filterMode = signal<'ALL' | 'MINE'>('ALL');
  showModal = signal(false);
  isEditMode = signal(false);
  currentProjetId: number | null = null;

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  isEncadrant = computed(() => this.authService.currentUser()?.role === 'ENCADRANT');
  
  displayedProjets = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    const all = this.projets();

    // 1. ADMIN : Voit tout par défaut
    if (user.role === 'ADMIN') {
      return this.filterMode() === 'ALL' ? all : [];
    }

    // 2. ENCADRANT : Ne voit que SES projets (comparaison Email pour robustesse)
    if (user.role === 'ENCADRANT') {
      return all.filter(p => p.encadrant?.email === user.email);
    }

    // 3. ETUDIANT : Ne voit que SES projets
    if (user.role === 'ETUDIANT') {
      return all.filter(p => p.etudiants?.some(e => e.email === user.email));
    }

    return [];
  });

  formData: any = { titre: '', description: '', dateDebut: '', duree: 12, etat: 'EN_COURS' };
  selectedEncadrantId: number | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.projetService.getAll().subscribe(data => {
      this.projets.set(data);
      this.loading.set(false);
    });
    
    if (this.isAdmin() || this.isEncadrant()) {
      this.userService.getEncadrants().subscribe(data => this.availableEncadrants.set(data));
    }
  }

  canEdit(projet: Projet): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'ENCADRANT') return projet.encadrant?.email === user.email;
    return false;
  }

  canEditFields(): boolean {
    return this.isAdmin() || this.isEncadrant();
  }

  openModal() {
    this.isEditMode.set(false);
    this.currentProjetId = null;
    this.formData = { titre: '', description: '', dateDebut: new Date().toISOString().split('T')[0], duree: 12, etat: 'EN_COURS' };
    this.selectedEncadrantId = null;
    this.showModal.set(true);
  }

  openEditModal(projet: Projet) {
    this.isEditMode.set(true);
    this.currentProjetId = projet.id!;
    this.formData = { 
      titre: projet.titre, 
      description: projet.description, 
      dateDebut: projet.dateDebut, 
      duree: projet.duree, 
      etat: projet.etat 
    };
    this.selectedEncadrantId = projet.encadrant?.id || null;
    this.showModal.set(true);
  }
  
  closeModal() {
    this.showModal.set(false);
  }

  deleteProjet(projet: Projet) {
    if(!confirm(`Voulez-vous vraiment supprimer le projet "${projet.titre}" ?`)) return;

    this.projetService.delete(projet.id!).subscribe({
      next: () => {
        this.projets.update(list => list.filter(p => p.id !== projet.id));
      },
      error: (err: any) => {
        console.error("Erreur suppression:", err);
        alert(`Erreur suppression (Code ${err.status})`);
      }
    });
  }

  onSubmit() {
    if (!this.selectedEncadrantId) {
      alert("Veuillez sélectionner un encadrant !");
      return;
    }
    
    this.submitting.set(true);
    const projetData: Projet = { ...this.formData };
    
    if (this.isEditMode() && this.currentProjetId) {
       const updatedProjet = { ...projetData, id: this.currentProjetId };
       this.projetService.update(updatedProjet, this.selectedEncadrantId).subscribe({
         next: (proj: Projet) => {
           this.projets.update(list => list.map(p => p.id === proj.id ? proj : p));
           this.submitting.set(false);
           this.closeModal();
         },
         error: (err: any) => {
           console.error(err);
           this.submitting.set(false);
           alert("Erreur modification");
         }
       });
    } else {
      this.projetService.create(projetData, this.selectedEncadrantId).subscribe({
        next: (proj) => {
          this.projets.update(list => [...list, proj]);
          this.submitting.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.submitting.set(false);
          alert("Erreur création projet");
        }
      });
    }
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