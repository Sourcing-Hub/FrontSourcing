# 🏛️ Architecture Technique Frontend — SourcingHub

Ce document décrit l'architecture logicielle, les choix de conception, le flux de données et l'organisation des composants du projet frontend **SourcingHub** (`FrontSourcing`).

---

## 📐 1. Vue d'Ensemble de l'Architecture

Le frontend SourcingHub est une application monopage (Single Page Application — SPA) construite avec **Vue 3**, **Vite**, **Pinia** et **Tailwind CSS**. Elle communique de manière asynchrone avec le backend Django REST Framework via un client HTTP Axios centralisé.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Navigateur Web (Client)                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │    Vue Router 4 (Routage)     │
                   │  - Gardes de navigation JWT   │
                   │  - Check profilComplet       │
                   └───────────────┬───────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
┌──────▼──────┐             ┌──────▼──────┐             ┌──────▼──────┐
│  Composants │             │   Stores    │             │  Client API │
│  & Vues Vue │◀───────────▶│    Pinia    │◀───────────▶│  (Axios)    │
└─────────────┘             └─────────────┘             └──────┬──────┘
                                                               │
                                                 HTTP / REST (JWT)
                                                               │
                                                        ┌──────▼──────┐
                                                        │ Backend DRF │
                                                        └─────────────┘
```

---

## 🗂️ 2. Gestion de l'État Global (Pinia Stores)

L'état global de l'application est découpé de manière modulaire en 6 stores Pinia distincts situés dans `src/stores/` :

### 1. `auth.js` — Authentification & Session
- **State** : `user`, `token`, `error`, `loading`.
- **Getters** :
  - `isAuthenticated` : Vérifie la présence du token JWT et de l'utilisateur.
  - `isAdmin` : `user.role === 'Administrateur'`.
  - `isPedagogie` : `user.role === 'Équipe Pédagogique'`.
  - `isGestion` : `user.role === 'Équipe Gestion de Projet'`.
  - `isCandidat` : `user.role === 'Candidat'`.
- **Actions** : `login()`, `logout()`, `activateAccount()`, `fetchProfile()`, `updateProfile()`.

### 2. `utilisateurs.js` — Administration du Personnel
- **State** : `utilisateurs`, `loading`, `error`.
- **Getters** :
  - `adminUsers` : Filtrage pour l'onglet Administrateurs.
  - `pedagogieUsers` : Filtrage pour l'Équipe Pédagogique.
  - `gestionUsers` : Filtrage pour l'Équipe Gestion de Projet.
- **Actions** : `fetchUtilisateurs()`, `createPersonnel()`, `toggleBlockUser()`, `deleteUser()`.

### 3. `campagnes.js` — Campagnes, Formations & Cohortes
- **State** : `campagnes`, `formations`, `cohortes`, `loading`, `error`.
- **Getters** : `getCampagneById`, `activeCampagnes`.
- **Actions** : `fetchCampagnes()`, `fetchFormations()`, `fetchCohortes()`, `createCampagne()`, `updateCampagneStatus()`, `deleteCampagne()`.

### 4. `candidatures.js` — Dossiers de Candidature
- **State** : `candidatures`, `candidatureActuelle`, `loading`, `error`.
- **Actions** : `fetchCandidatures()`, `fetchCandidatureById()`, `soumettreCandidature()`, `changerStatut()`.

### 5. `formulaires.js` — Formulaires Dynamiques
- **State** : `formulaires`, `formulaireActuel`, `loading`, `error`.
- **Actions** : `fetchFormulaires()`, `fetchFormulaireById()`, `saveFormulaire()`, `publierFormulaire()`, `ajouterChamp()`, `supprimerChamp()`.

### 6. `modal.js` — Service de Modales Globales
- **State** : `isOpen`, `title`, `message`, `type`, `resolvePromise`.
- **Actions** : `showAlert()`, `showConfirm()`, `closeModal()`.

---

## 🚦 3. Système de Routage & Sécurité (`src/router/index.js`)

Le routeur gère les accès selon des méta-données de sécurité (`meta: { requiresAuth: true }`) et une garde globale (`beforeEach`) :

```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirection vers le login si non authentifié
    next({ name: 'login' })
  } else if (authStore.isAuthenticated && to.meta.requiresAuth) {
    // Redirection de sécurité : profil incomplet => /profil obligatoire
    if (!authStore.user?.profilComplet && to.name !== 'profil') {
      next({ name: 'profil' })
    } else {
      next()
    }
  } else {
    next()
  }
})
```

---

## 🌐 4. Service HTTP & Intercepteurs Axios (`src/services/api.js`)

Toutes les requêtes vers l'API backend passent par l'instance Axios centralisée dans `src/services/api.js` :

- **Injection automatique du token Bearer** :
  ```javascript
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sourcing_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  ```
- **Gestion globale de l'expiration du Token (401 Unauthorized)** :
  En cas de retour `401`, la session locale est nettoyée et l'utilisateur est redirigé vers la page de connexion.

---

## 🧩 5. Modèle de Formulaires Dynamiques

L'application intègre un moteur complet d'édition et de rendu de formulaires dynamiques :

```text
  [ FormBuilderView.vue ] (Création / Édition)
            │
            ▼
┌─────────────────────────┐
│ ChampFormulaire Model   │
├─────────────────────────┤
│ - libelle (string)      │
│ - type (TEXTE, EMAIL...)│
│ - ordre (integer)       │
│ - obligatoire (bool)    │
│ - regleValidation (json)│
└───────────┬─────────────┘
            │
            ▼
  [ PostulerView.vue ] (Rendu dynamique & Soumission)
```

### Types de champs pris en charge :
- `TEXTE` : Champ texte court
- `ZONE_TEXTE` : Zone de texte multiligne
- `EMAIL` : Validation du format email
- `TELEPHONE` : Validation du numéro de téléphone
- `DATE` : Selecteur de date (format ISO `YYYY-MM-DD`)
- `NOMBRE` : Validation des bornes min/max
- `LISTE_DEROULANTE` & `CHOIX_MULTIPLES` : Options sélectionnables
- `CASE_A_COCHER` : Cases à cocher uniques/multiples
- `FICHIER` : Téléversement de pièces jointes avec contrôle de taille et d'extensions MIME

---

## 🎨 6. Charte Graphique & UI Design System

L'interface utilisateur suit les standards de design moderne :
- **Palette de couleurs principale** :
  - Primaire : `#00313C` (Bleu nuit profond pour les en-têtes et le menu latéral)
  - Accent / Marque : `#CE0033` (Rouge vibrant pour les boutons d'action principale et éléments mis en évidence)
- **Typographie** : Polices Google Fonts `'Inter', sans-serif`.
- **Iconographie** : Bibliothèque unifiée [Lucide Icons](https://lucide.dev/).
- **Micro-animations** : Transitions CSS douces au survol (`transition-colors duration-200`) et retours visuels interactifs (`spinners` pour les chargements).

---

## ⚙️ 7. Bonnes Pratiques de Développement

1. **Composition API** : Tous les composants Vue doivent utiliser la syntaxe `<script setup>`.
2. **Gestion d'erreur unifiée** : Utiliser `parseBackendError(err)` depuis `src/utils/errorHandler.js` pour traiter les retours d'API.
3. **Sécurisation des modales** : Utiliser `modalStore.showConfirm()` pour valider toute action destructive (suppression, blocage).
4. **Pas d'appels direct au DOM** : Utiliser la réactivité Vue (`ref`, `computed`, `reactive`).
