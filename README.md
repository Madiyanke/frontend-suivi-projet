# SuiviProjet - Frontend

Ce dépôt contient l'interface utilisateur (Frontend) de l'application de gestion de projets universitaires.

C'est une Single Page Application (SPA) moderne développée avec Angular 19, offrant une expérience utilisateur fluide, réactive et adaptée aux différents profils (Admin, Encadrant, Étudiant).

## Stack Technique

Framework : Angular 19

Architecture : Standalone Components (Pas de NgModules)

State Management : Angular Signals (Réactivité fine)

Design : Tailwind CSS v3.4

HTTP Client : Fetch avec Intercepteurs fonctionnels

# Fonctionnalités Clés

Tableau de Bord (Dashboard) :

Calcul automatique des KPIs (Projets en cours, terminés, étudiants...).

Visualisation réservée aux Administrateurs.

Gestion des Projets (Canvas) :

Vue en grille avec cartes interactives.

Filtrage automatique : Un encadrant ne voit que ses projets.

Modales pour la création et l'édition (pas de rechargement de page).

Expérience Utilisateur (UX) :

Toasts : Système de notifications en temps réel (Succès/Erreur).

Guards : Redirection intelligente après login et protection des routes.

Responsive : Interface adaptée aux mobiles et desktops.

# Installation et Démarrage

Prérequis

Node.js (v18 ou supérieur)

npm

## 1. Cloner le projet

git clone https://github.com/Madiyanke/frontend-suivi-projet.git

cd suiviprojet-frontend


## 2. Installer les dépendances

npm install


### 3. Lancer le serveur de développement

`
ng serve
`


Ouvrez votre navigateur sur http://localhost:4200.

Note : Assurez-vous que le Backend (Spring Boot) est lancé sur le port 8080 pour que la connexion fonctionne.

# Structure du Projet

src/app/

├── auth/           # Page de connexion

├── core/           # Services API, Guards, Intercepteurs, Modèles

├── dashboard/      # Vue statistiques (Admin)

├── projets/        # Liste et Détails des projets

├── users/          # Gestion des étudiants/encadrants

├── shared/         # Composants partagés (Toast...)

└── app.component   # Layout principal (Sidebar)


# Configuration

L'URL de l'API Backend est définie dans src/app/core/api.services.ts :

const API_URL = 'http://localhost:8080/api';


Modifiez cette constante si vous déployez le backend sur une autre adresse.
