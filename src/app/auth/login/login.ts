import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/api.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: 'admin@univ-pau.fr', mdp: 'admin123' };
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        
        // REDIRECTION INTELLIGENTE
        const user = this.authService.currentUser();
        if (user?.role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/projets']);
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.errorMessage.set("Identifiants incorrects ou serveur indisponible.");
      }
    });
  }
}