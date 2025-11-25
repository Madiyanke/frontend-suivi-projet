import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjetService, UserService, AuthService, Projet, User } from '../../core/api.services';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projet-detail.html',
  styleUrl: './projet-detail.scss',

})
export class ProjetDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private projetService = inject(ProjetService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  projet = signal<Projet | undefined>(undefined);
  allStudents = signal<User[]>([]);
  loading = signal(true);
  showModal = signal(false);

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  
  availableStudents = computed(() => {
    const currentIds = this.projet()?.etudiants?.map(e => e.id) || [];
    return this.allStudents().filter(s => !currentIds.includes(s.id));
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.refreshData(id);
    }
  }

  refreshData(id: number) {
    this.loading.set(true);
    this.projetService.getOne(id).subscribe({
      next: (p) => {
        this.projet.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goBack() {
    this.location.back();
  }

  openAddStudentModal() {
    if (this.allStudents().length === 0) {
      this.userService.getEtudiants().subscribe(data => this.allStudents.set(data));
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  assignStudent(etudiantId: number) {
    const projetId = this.projet()?.id;
    if (!projetId) return;

    this.projetService.addEtudiant(projetId, etudiantId).subscribe({
      next: () => {
        this.refreshData(projetId);
        this.closeModal();
      },
      error: (err) => alert("Erreur lors de l'assignation")
    });
  }

  // NOUVELLE FONCTION DE SUPPRESSION
  removeStudent(etudiantId: number) {
    if(!confirm("Voulez-vous retirer cet étudiant du projet ?")) return;
    
    const projetId = this.projet()?.id;
    if (!projetId) return;

    this.projetService.removeEtudiant(projetId, etudiantId).subscribe({
      next: () => {
        this.refreshData(projetId); // Rafraîchir la liste
      },
      error: (err) => alert("Erreur lors du retrait de l'étudiant")
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