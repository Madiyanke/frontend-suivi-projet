import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, ToastService } from '../core/api.services';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- HEADER & ACTIONS -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
          <p class="text-slate-500">Administrez les comptes étudiants et encadrants</p>
        </div>
        <button (click)="openModal()" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 font-medium">
          <span>+</span> Nouveau Compte
        </button>
      </div>

      <!-- TABS NAVIGATION (LISTE) -->
      <div class="border-b border-slate-200">
        <nav class="flex gap-4">
          <button (click)="activeTab.set('ETUDIANT')" 
             [class]="'pb-3 px-2 text-sm font-medium transition-colors border-b-2 ' + 
             (activeTab() === 'ETUDIANT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700')">
             Étudiants ({{ etudiants().length }})
          </button>
          <button (click)="activeTab.set('ENCADRANT')"
             [class]="'pb-3 px-2 text-sm font-medium transition-colors border-b-2 ' + 
             (activeTab() === 'ENCADRANT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700')">
             Encadrants ({{ encadrants().length }})
          </button>
        </nav>
      </div>

      <!-- TABLE LIST -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th class="px-6 py-4">Nom complet</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">{{ activeTab() === 'ETUDIANT' ? 'Filière' : 'Spécialité' }}</th>
              <th class="px-6 py-4 text-right">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (user of displayedUsers(); track user.id) {
              <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                  <div [class]="'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ' + 
                    (activeTab() === 'ETUDIANT' ? 'bg-indigo-400' : 'bg-emerald-400')">
                    {{ user.prenom.charAt(0) }}
                  </div>
                  {{ user.nom }} {{ user.prenom }}
                </td>
                <td class="px-6 py-4 text-slate-600 font-mono text-sm">{{ user.email }}</td>
                <td class="px-6 py-4 text-slate-600">
                  <span class="px-2 py-1 rounded bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                    {{ activeTab() === 'ETUDIANT' ? user.filiere : user.specialite }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">Actif</span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
                  Aucun utilisateur trouvé dans cette catégorie.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL CREATE USER -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            
            <div class="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 class="font-bold text-lg">Nouveau Compte</h3>
              <button (click)="closeModal()" class="hover:bg-indigo-500 rounded p-1 transition-colors">✕</button>
            </div>
            
            <form (submit)="onSubmit()" class="p-6 space-y-5">
              
              <!-- SÉLECTEUR DE TYPE (SWITCHER) -->
              <div class="bg-slate-100 p-1 rounded-lg flex text-sm font-medium mb-4">
                <button type="button" (click)="roleCreation.set('ETUDIANT')"
                  [class]="'flex-1 py-2 rounded-md transition-all shadow-sm ' + 
                  (roleCreation() === 'ETUDIANT' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-700')">
                   Étudiant
                </button>
                <button type="button" (click)="roleCreation.set('ENCADRANT')"
                  [class]="'flex-1 py-2 rounded-md transition-all shadow-sm ' + 
                  (roleCreation() === 'ENCADRANT' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-700')">
                   Encadrant
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase">Nom</label>
                  <input type="text" [(ngModel)]="formData.nom" name="nom" required
                    class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase">Prénom</label>
                  <input type="text" [(ngModel)]="formData.prenom" name="prenom" required
                    class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" [(ngModel)]="formData.email" name="email" required
                  class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase">Mot de passe</label>
                <input type="password" [(ngModel)]="formData.mdp" name="mdp" required
                  class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>

              <!-- CHAMP DYNAMIQUE : FILIERE OU SPECIALITE -->
              <div class="space-y-1 animate-fade-in">
                <label class="text-xs font-bold text-slate-500 uppercase transition-colors" 
                       [class.text-indigo-600]="roleCreation() === 'ENCADRANT'">
                  {{ roleCreation() === 'ETUDIANT' ? 'Filière' : 'Spécialité' }}
                </label>
                <input type="text" [(ngModel)]="formData.spec" name="spec" required
                  class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  [placeholder]="roleCreation() === 'ETUDIANT' ? 'Ex: Informatique, Gestion...' : 'Ex: IA, Réseaux, Web...'">
              </div>

              <div class="pt-4 flex justify-end gap-3">
                <button type="button" (click)="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Annuler</button>
                <button type="submit" [disabled]="loading()" 
                  class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md flex items-center gap-2">
                  @if(loading()) { <span class="animate-spin">⌛</span> }
                  Créer {{ roleCreation() === 'ETUDIANT' ? 'l\\'étudiant' : 'l\\'encadrant' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class Users implements OnInit {
  userService = inject(UserService);
  toastService = inject(ToastService);
  
  // State Liste
  activeTab = signal<'ETUDIANT' | 'ENCADRANT'>('ETUDIANT');
  etudiants = signal<User[]>([]);
  encadrants = signal<User[]>([]);
  
  // State Modal
  showModal = signal(false);
  loading = signal(false);
  roleCreation = signal<'ETUDIANT' | 'ENCADRANT'>('ETUDIANT'); // Switcher interne à la modale

  // Form
  formData = { nom: '', prenom: '', email: '', mdp: '', spec: '' };

  displayedUsers = computed(() => {
    return this.activeTab() === 'ETUDIANT' ? this.etudiants() : this.encadrants();
  });

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.userService.getEtudiants().subscribe(data => this.etudiants.set(data));
    this.userService.getEncadrants().subscribe(data => this.encadrants.set(data));
  }

  openModal() {
    this.formData = { nom: '', prenom: '', email: '', mdp: '', spec: '' };
    // Par défaut, on propose de créer le type correspondant à l'onglet actif
    this.roleCreation.set(this.activeTab());
    this.showModal.set(true);
  }
  
  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    this.loading.set(true);
    
    // Construction de l'objet User commun
    const userPayload: User = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      mdp: this.formData.mdp,
      role: this.roleCreation() // Important: On utilise le rôle sélectionné dans la modale
    };

    // Mapping du champ spécifique selon le choix de l'utilisateur
    if (this.roleCreation() === 'ETUDIANT') {
      userPayload.filiere = this.formData.spec;
    } else {
      userPayload.specialite = this.formData.spec;
    }

    // Appel du bon service
    const request$ = this.roleCreation() === 'ETUDIANT' 
      ? this.userService.createEtudiant(userPayload)
      : this.userService.createEncadrant(userPayload);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.show(`${this.roleCreation()} créé avec succès !`, 'success');
        this.closeModal();
        this.refreshData(); // Recharger les listes
        
        // Optionnel : Basculer l'onglet actif vers ce qu'on vient de créer pour voir le résultat
        this.activeTab.set(this.roleCreation());
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        // L'intercepteur global gère déjà le Toast d'erreur, mais on peut être spécifique si besoin
      }
    });
  }
}