import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

// --- TYPES ---
export interface User {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';
  token?: string;
  specialite?: string;
  filiere?: string;
  mdp?: string;
}

export interface Projet {
  id?: number;
  titre: string;
  description: string;
  etat: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE';
  dateDebut: string;
  duree: number;
  encadrant?: User;
  etudiants?: User[];
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const API_URL = 'http://localhost:8080/api';

// --- TOAST SERVICE ---
@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Date.now();
    this.toasts.update(current => [...current, { id, message, type }]);
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}

// --- INTERCEPTORS ---
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(cloned);
  }
  return next(req);
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'Une erreur inattendue est survenue';
      if (err.status === 0) message = 'Serveur inaccessible. Vérifiez votre connexion.';
      else if (err.status === 401 && !req.url.includes('/auth/login')) message = 'Session expirée.';
      else if (err.status === 403) message = 'Accès refusé.';
      else if (err.status === 404) message = 'Ressource introuvable.';
      else if (err.status >= 500) message = 'Erreur serveur interne.';

      if (!req.url.includes('/auth/login') || err.status !== 401) {
        toastService.show(message, 'error');
      }
      return throwError(() => err);
    })
  );
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
      password: creds.mdp 
    }).pipe(
      tap(res => {
        const decodedToken = this.parseJwt(res.token);
        let role: 'ADMIN' | 'ENCADRANT' | 'ETUDIANT' = 'ETUDIANT';
        
        let tokenRole = decodedToken?.role || decodedToken?.roles || decodedToken?.authorities;
        if (Array.isArray(tokenRole)) {
            if (tokenRole.length > 0 && typeof tokenRole[0] === 'object' && tokenRole[0].authority) {
                tokenRole = tokenRole[0].authority;
            } else if (tokenRole.length > 0) {
                tokenRole = tokenRole[0];
            }
        }

        if (tokenRole && typeof tokenRole === 'string') {
            role = tokenRole.replace('ROLE_', '') as any;
        } else {
            const emailLower = (decodedToken?.sub || creds.email).toLowerCase();
            if (emailLower.includes('admin')) role = 'ADMIN';
            else if (['turing', 'hopper', 'dupont', 'martin'].some(n => emailLower.includes(n))) role = 'ENCADRANT';
        }

        const email = decodedToken?.sub || creds.email;
        const parts = email.split('@')[0].split('.');
        const prenom = this.capitalize(parts[0]);
        const nom = parts.length > 1 ? this.capitalize(parts[1]) : 'Utilisateur';

        this.currentUser.set({ email, nom, prenom, role, token: res.token });
      })
    );
  }

  logout() { this.currentUser.set(null); }
  
  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('app_user');
    return stored ? JSON.parse(stored) : null;
  }

  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) { return null; }
  }

  private capitalize(s: string) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
}

// --- USER SERVICE ---
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

  getOne(id: number): Observable<Projet | undefined> {
    return this.getAll().pipe(map(projets => projets.find(p => p.id === id)));
  }

  create(projet: Projet, encadrantId: number): Observable<Projet> {
    return this.http.post<Projet>(`${API_URL}/projets?encadrantId=${encadrantId}`, projet);
  }

  update(projet: Projet, encadrantId: number): Observable<Projet> {
    return this.http.put<Projet>(`${API_URL}/projets/${projet.id}?encadrantId=${encadrantId}`, projet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/projets/${id}`);
  }

  addEtudiant(projetId: number, etudiantId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/projets/${projetId}/etudiants/${etudiantId}`, {});
  }

  // NOUVELLE MÉTHODE
  removeEtudiant(projetId: number, etudiantId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/projets/${projetId}/etudiants/${etudiantId}`);
  }
}