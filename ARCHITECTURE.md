# Architecture du Frontend SourcingHub

Ce document décrit l'architecture, les conventions et la stack technique du portail web SourcingHub.

## 1. Stack Technique Principale
- **Framework Reactivité** : Vue.js 3 (Composition API avec la syntaxe `<script setup>`)
- **Outil de Build** : Vite (Rapide et optimisé pour Vue 3)
- **Gestionnaire d'état** : Pinia
- **Routage** : Vue Router
- **Style et Design System** : Tailwind CSS (v3)
- **Requêtes HTTP** : Axios
- **Icônes** : Lucide Vue Next

## 2. Design System & UX
- **Couleur Primaire** : `#CE0033` (Un rouge framboise/carmin profond, défini de 50 à 900 dans `tailwind.config.js`).
- **Composants Premium** : Utilisation intensive du style *Glassmorphism* (fonds semi-transparents, flous d'arrière-plan avec `backdrop-blur`), ombres douces et coins arrondis (`rounded-xl` et `rounded-2xl`).
- **Animations** : Transitions fluides, animations de *Fade-in* et *Slide-up* pour un ressenti dynamique et réactif. L'interface est conçue pour l'effet "Wahou".

## 3. Structure du Projet

```text
src/
├── assets/          # Fichiers statiques (images, CSS globaux comme main.css)
├── components/      # Composants réutilisables
│   ├── layouts/     # Agencements globaux (DashboardLayout, etc.)
│   └── ui/          # (Futur) Boutons, modales, champs de formulaire standards
├── router/          # Configuration des routes (index.js) et de la protection (Navigation Guards)
├── services/        # Logique de communication externe
│   └── api.js       # Instance Axios configurée avec les intercepteurs JWT
├── stores/          # État global (Pinia)
│   ├── auth.js       # Gestion de la connexion, du JWT, et de l'utilisateur courant
│   ├── campagnes.js  # Liste et manipulation des campagnes de recrutement
│   └── formulaires.js# État et actions du constructeur dynamique de formulaire
├── views/           # Pages complètes associées aux routes
│   ├── LoginView.vue           # Écran de connexion (glassmorphism)
│   ├── DashboardView.vue       # Tableau de bord principal
│   ├── CampagnesView.vue       # Gestion des campagnes
│   ├── FormulairesView.vue     # Liste des modèles de formulaires
│   └── FormulaireBuilderView.vue # Interface avancée de création par Drag&Drop
├── App.vue          # Composant racine
└── main.js          # Point d'entrée de l'application (initialisation Pinia, Router, Tailwind)
```

## 4. Communication Backend (API & Authentification)
L'application communique avec le backend Django via `http://127.0.0.1:8000/api/`.

### Le Flux d'Authentification :
1. L'utilisateur se connecte via `auth.js`.
2. Le token JWT retourné par le backend est stocké dans le `localStorage`.
3. Le fichier `services/api.js` utilise un **intercepteur Axios**. Avant chaque requête, il ajoute automatiquement le header `Authorization: Bearer <token>`.
4. Si le token expire (Erreur 401), l'utilisateur est automatiquement redirigé vers la page de login par l'intercepteur.

## 5. Fonctionnalités Avancées : Le Form Builder
La page `FormulaireBuilderView.vue` propose un constructeur de formulaire sans code type "Google Forms".
- Il utilise `vue-draggable-next` pour permettre la réorganisation à la souris (Drag and Drop) des champs.
- Le panneau de paramétrage (à droite) est réactif : ses champs d'édition s'adaptent instantanément au type du composant cliqué (ex: affichage du gestionnaire d'extensions si le type est "Fichier").
- Les actions (ajout, modification, suppression, réorganisation) sont toutes synchronisées avec le backend en temps réel via des appels isolés pour une excellente performance (pas de rechargement complet de la page).


<!-- Finalisation de la documentation -->
