import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

// --- TYPES ---
export interface User {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';
  token?: string;
  // Champs spécifiques
  specialite?: string; // Encadrant
  filiere?: string;    // Etudiant
  mdp?: string;        // Pour la création (ne jamais stocker en lecture)
}

export interface Projet {
  id: number;
  titre: string;
  description: string;
  etat: string;
  dateDebut: string;
  duree: number;
  encadrant?: User;
  etudiants?: User[];
}

const API_URL = 'http://localhost:8080/api';

// --- INTERCEPTOR ---
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(cloned);
  }
  return next(req);
};

// --- AUTH SERVICE ---
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user?.token) localStorage.setItem('jwt_token', user.token);
      if (user) localStorage.setItem('app_user', JSON.stringify(user));
      else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('app_user');
      }
    });
  }

  login(creds: {email: string, mdp: string}): Observable<{token: string}> {
    return this.http.post<{token: string}>(`${API_URL}/auth/login`, { 
      email: creds.email, 
      password: creds.mdp // Mapping 'mdp' vers 'password' attendu par le DTO Java
    }).pipe(
      tap(res => {
        // Simulation décodage user (En prod: décoder le JWT)
        const role = creds.email.includes('admin') ? 'ADMIN' : (creds.email.includes('etudiant') ? 'ETUDIANT' : 'ENCADRANT');
        this.currentUser.set({ 
          email: creds.email, 
          nom: 'Utilisateur', 
          prenom: creds.email.split('@')[0], 
          role: role as any, 
          token: res.token 
        });
      })
    );
  }

  logout() { this.currentUser.set(null); }
  
  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('app_user');
    return stored ? JSON.parse(stored) : null;
  }
}

// --- USER MANAGEMENT SERVICE ---
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getEtudiants(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/comptes/etudiants`);
  }

  getEncadrants(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/comptes/encadrants`);
  }

  createEtudiant(user: User): Observable<User> {
    return this.http.post<User>(`${API_URL}/comptes/etudiants`, user);
  }

  createEncadrant(user: User): Observable<User> {
    return this.http.post<User>(`${API_URL}/comptes/encadrants`, user);
  }
}

// --- PROJET SERVICE ---
@Injectable({ providedIn: 'root' })
export class ProjetService {
  private http = inject(HttpClient);

  getAll(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${API_URL}/projets`);
  }
  
  getMyProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${API_URL}/projets/mes-projets`);
  }
}