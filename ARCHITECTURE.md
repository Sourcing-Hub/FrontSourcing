# Architecture du Frontend SourcingHub

Ce document décrit l'architecture, les conventions et la stack technique du portail web SourcingHub.

## 1. Stack Technique Principale
- **Framework Réactivité** : Vue.js 3 (Composition API avec la syntaxe `<script setup>`)
- **Outil de Build** : Vite (Rapide et optimisé pour Vue 3)
- **Gestionnaire d'état** : Pinia (Pour l'état global)
- **Routage** : Vue Router
- **Style et Design System** : Tailwind CSS (v3)
- **Requêtes HTTP** : Axios
- **Icônes** : Lucide Vue Next

## 2. Design System & UX
- **Couleur Primaire** : `#CE0033` (Le rouge identitaire SourcingHub, configuré pour remplacer le violet dans l'ensemble des écrans, boutons et composants du Form Builder).
- **Composants Premium** : Utilisation du style *Glassmorphism* (fonds semi-transparents, flous d'arrière-plan avec `backdrop-blur`), ombres douces et coins arrondis (`rounded-xl` et `rounded-2xl`).
- **Animations** : Transitions fluides, animations de *Fade-in* et *Slide-up* pour un ressenti dynamique et réactif.

## 3. Structure du Projet

```text
src/
├── assets/          # Fichiers statiques (CSS globaux comme base.css et main.css)
├── components/      # Composants réutilisables du projet
│   ├── layouts/     # Mises en pages globales (DashboardLayout.vue, Sidebar.vue)
│   ├── formulaires/ # Composants du générateur (FieldCard.vue pour l'édition de questions)
│   └── ui/          # (Futur) Boutons, modales et inputs standards de base
├── router/          # Configuration des routes (index.js) et Gardes de navigation
├── services/        # Logique de communication avec l'API
│   └── api.js       # Instance Axios configurée avec les intercepteurs JWT
├── stores/          # Gestion de l'état global (Pinia)
│   ├── auth.js          # Authentification, JWT, utilisateur connecté et profil
│   ├── campagnes.js     # Formations, cohortes et campagnes de recrutement
│   ├── formulaires.js   # État complet de l'éditeur de formulaire
│   └── utilisateurs.js  # Liste et invitations du personnel
└── views/           # Pages complètes rattachées au routeur
    ├── LoginView.vue           # Écran de connexion (avec fond visuel premium)
    ├── DashboardView.vue       # Tableau de bord principal (vue d'ensemble)
    ├── CampagnesView.vue       # Gestion des campagnes de recrutement
    ├── FormationsView.vue      # Gestion des formations et cohortes associées
    ├── FormulairesView.vue     # Liste des formulaires
    ├── FormBuilderView.vue     # Éditeur dynamique de formulaire (type Google Form)
    ├── FormPreviewView.vue     # Aperçu en temps réel d'un formulaire
    ├── UtilisateursView.vue    # Administration des membres de l'équipe (par l'Admin)
    ├── ActivationView.vue      # Écran d'activation de compte et mot de passe
    └── ProfilView.vue          # Page de gestion et de complétion de profil
```

## 4. Communication Backend & Authentification
L'application communique avec le backend Django via `http://localhost:8000/api/`.

### Le Flux d'Authentification :
1. L'utilisateur se connecte via `auth.js`.
2. Le token JWT retourné par le backend est stocké dans le `localStorage`.
3. Le fichier `services/api.js` utilise un **intercepteur Axios** pour injecter le header `Authorization: Bearer <token>` sur chaque requête.
4. Si le token expire (Erreur 401), l'utilisateur est automatiquement déconnecté et redirigé vers le login.

## 5. Flux d'Activation de Compte & Profil
Pour assurer que chaque compte dispose d'informations à jour, un flux strict est mis en œuvre :
1. **Invitation** : L'administrateur crée un compte d'équipe depuis `UtilisateursView`. Un email contenant un token d'activation unique (valide 48h) est envoyé par le backend.
2. **Définition du mot de passe** : L'utilisateur clique sur le lien et est dirigé vers `/auth/activer/:token` (`ActivationView`) pour choisir son mot de passe.
3. **Profil obligatoire** : Lors de sa première connexion, le garde de navigation (`router.beforeEach`) détecte que `profilComplet` est à `false` et le redirige de force vers la page `/profil` (`ProfilView.vue`). L'accès au reste de la plateforme lui est bloqué tant qu'il n'a pas renseigné son prénom, nom, et numéro de téléphone.

## 6. Architecture Modulaire : La Sidebar
Pour éviter d'alourdir le layout principal (`DashboardLayout.vue`), la barre de navigation latérale a été découpée dans un composant indépendant `Sidebar.vue`. Elle centralise :
- L'affichage dynamique des infos de l'utilisateur connecté (ses initiales, son prénom/nom et son email, ou à défaut son rôle).
- La liste des modules de navigation généraux.
- La zone d'administration sécurisée (visible uniquement pour le rôle `Administrateur`).
- Le lien vers la page de profil et l'action de déconnexion.

