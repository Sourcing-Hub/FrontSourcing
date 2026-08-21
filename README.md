# SourcingHub — Frontend Application (Vue 3 + Vite)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-State_Management-yellow?style=flat-square)](https://pinia.vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**SourcingHub Frontend** est l'interface utilisateur web moderne développée avec **Vue 3 (Composition API avec `<script setup>`)**, **Pinia** et **Tailwind CSS**. Elle assure le pilotage complet du recrutement, de la publication des campagnes, la création de formulaires dynamiques, la soumission et l'évaluation des candidatures, ainsi que la gestion du personnel par rôle.

---

## Table des Matières

1. [Fonctionnalités Principales](#fonctionnalités-principales)
2. [Stack Technique](#stack-technique)
3. [Architecture des Rôles et Permissions](#architecture-des-rôles-et-permissions)
4. [Structure du Projet](#structure-du-projet)
5. [Prérequis et Installation](#prérequis-et-installation)
6. [Commandes de Développement](#commandes-de-développement)
7. [Gestion des Formulaires Dynamiques](#gestion-des-formulaires-dynamiques)
8. [Sécurité et Navigation Guards](#sécurité-et-navigation-guards)
9. [Documentation de l'Architecture](#documentation-de-larchitecture)

---

## Fonctionnalités Principales

- **Authentification & Gestion des Accès** : Connexion JWT, activation sécurisée par lien unique, réinitialisation de mot de passe, déconnexion de sécurité.
- **Formulaires Dynamiques** : Éditeur Drag & Drop (FormBuilder), personnalisation des champs (texte, email, téléphone, date, liste, fichier avec limites MIME/taille), prévisualisation en temps réel.
- **Gestion des Campagnes** : Création, ouverture/fermeture/archivage de campagnes, association dynamique aux formations et cohortes.
- **Espace Candidat** : Candidature sans compte requis (création automatique), suivi de l'état d'avancement des candidatures.
- **Espace Personnel (Admin / Pédagogie / Gestion de Projet)** :
  - **Administrateur** : Gestion globale, création et invitation du personnel (Équipe Pédagogique, Gestion de Projet), blocage/déblocage/suppression de comptes.
  - **Équipe Pédagogique** : Pilotage du parcours de sélection, gestion des évaluateurs, notation et suivi des étapes de recrutement.
  - **Équipe Gestion de Projet** : Suivi des campagnes, cohortes, formations et consultation des candidatures.
- **Émargement par QR Code** : Scan et contrôle d'accès en direct pour les sessions d'évaluation.

---

## Stack Technique

- **Framework JavaScript** : [Vue 3](https://vuejs.org/) (SFC, `<script setup>`, Composition API)
- **Tooling & Bundler** : [Vite](https://vite.dev/)
- **Gestionnaire d'État (State Management)** : [Pinia](https://pinia.vuejs.org/)
- **Routage** : [Vue Router 4](https://router.vuejs.org/)
- **Client HTTP** : [Axios](https://axios-http.com/) avec intercepteurs de token JWT
- **Design & Styles** : [Tailwind CSS](https://tailwindcss.com/)
- **Icônes** : [Lucide Vue Next](https://lucide.dev/)

---

## Architecture des Rôles et Permissions

L'interface adapte dynamiquement le menu latéral (Sidebar), les boutons d'action et les routes selon le rôle de l'utilisateur connecté :

| Rôle | Vues Accessibles | Actions Clés |
|---|---|---|
| **Administrateur** | Tableau de bord, Formations, Campagnes, Formulaires, Candidatures, Utilisateurs | Gestion globale, invitation du personnel, blocage/suppression de comptes. |
| **Équipe Pédagogique** | Tableau de bord, Formations, Campagnes, Formulaires, Candidatures | Pilotage du recrutement, gestion des évaluateurs et notation. |
| **Équipe Gestion de Projet** | Tableau de bord, Formations, Campagnes, Formulaires, Candidatures | Suivi opérationnel des formations, cohortes et campagnes. |
| **Candidat** | Mes Candidatures, Profil | Soumission de candidature, suivi de statut, complétion du profil. |

---

## Structure du Projet

```text
FrontSourcing/
├── src/
│   ├── assets/              # Styles globaux (base.css, main.css) et images
│   ├── components/          # Composants réutilisables
│   │   ├── common/          # Modales globales (GlobalModal.vue)
│   │   ├── formulaires/     # Éléments d'édition et rendu de formulaires
│   │   └── layouts/         # Layouts de page (DashboardLayout.vue, Sidebar.vue)
│   ├── router/              # Configuration Vue Router (index.js, guards)
│   ├── services/            # Client HTTP Axios (api.js)
│   ├── stores/              # Stores Pinia (auth, utilisateurs, campagnes, candidatures, formulaires, modal)
│   ├── utils/               # Formateurs d'erreurs et utilitaires (errorHandler.js)
│   ├── views/               # Vues principales de l'application
│   │   ├── ActivationView.vue        # Page d'activation par lien unique
│   │   ├── CampagnesView.vue         # Gestion des campagnes
│   │   ├── CandidatureDetailView.vue # Détail et notation d'une candidature
│   │   ├── CandidaturesView.vue      # Liste et suivi des candidatures
│   │   ├── DashboardView.vue         # Tableau de bord principal
│   │   ├── FormBuilderView.vue       # Éditeur de formulaires
│   │   ├── FormationsView.vue        # Gestion des formations et cohortes
│   │   ├── FormulairesView.vue       # Liste des formulaires
│   │   ├── LoginView.vue             # Page de connexion
│   │   ├── PostulerView.vue          # Formulaire public de candidature
│   │   ├── ProfilView.vue            # Édition du profil utilisateur
│   │   ├── ScanCandidatView.vue      # Émargement via QR Code
│   │   └── UtilisateursView.vue      # Administration du personnel
│   ├── App.vue              # Composant racine Vue
│   └── main.js              # Point d'entrée JavaScript Vue 3
├── index.html               # Fichier HTML principal
├── package.json             # Dépendances et scripts npm
├── tailwind.config.js       # Configuration Tailwind CSS
└── vite.config.js           # Configuration du bundler Vite
```

---

## Prérequis et Installation

### Prérequis
- **Node.js** v18+ ou v20+
- **npm** v9+ ou **yarn** / **pnpm**

### Installation

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/Sourcing-Hub/FrontSourcing.git
   cd FrontSourcing
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

---

## Commandes de Développement

### Lancer le serveur de développement
```bash
npm run dev
```
> L'application sera accessible sur `http://localhost:5173`.

### Construire pour la production
```bash
npm run build
```
> Les fichiers optimisés sont générés dans le dossier `dist/`.

### Prévisualiser le build de production
```bash
npm run preview
```

### Vérification du code (Linter)
```bash
npm run lint
```

---

## Sécurité et Navigation Guards

Le routeur (`src/router/index.js`) intègre une protection stricte des accès via `router.beforeEach` :

1. **Vérification d'Authentification** : Redirige vers `/login` pour toutes les routes nécessitant `meta: { requiresAuth: true }`.
2. **Complétion Obligatoire du Profil** : Si le profil de l'utilisateur connecté est incomplet (`profilComplet === false`), l'accès aux dashboards est bloqué et l'utilisateur est automatiquement redirigé vers `/profil`.
3. **Activation Sécurisée** : L'accès à `/auth/activer/:token` déconnecte automatiquement toute session active préalable pour éviter les collisions entre comptes d'administrateurs et d'invités.

---

## Documentation de l'Architecture

Pour une description détaillée du flux de données, des stores Pinia, du système de formulaires dynamiques et des intercepteurs Axios, consultez le document complet :
[ARCHITECTURE.md](file:///C:/Users/dell/Documents/SourcingHub/FrontSourcing/ARCHITECTURE.md)
