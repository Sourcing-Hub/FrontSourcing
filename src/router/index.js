import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'

import MyInterviewsView from '../views/evaluator/MyInterviewsView.vue'
import MyCandidatesView from '../views/evaluator/MyCandidatesView.vue'
import CandidateDetailView from '../views/evaluator/CandidateDetailView.vue'
import ConductInterviewView from '../views/evaluator/ConductInterviewView.vue'
import EvaluationView from '../views/evaluator/EvaluationView.vue'
import EvaluationValidationView from '../views/evaluator/EvaluationValidationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },

    {
      path: '/auth/activer/:token',
      name: 'activation',
      component: () => import('../views/ActivationView.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/confirmation-presence/:token',
      name: 'confirmation-presence',
      component: () => import('../views/ConfirmationPresenceView.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/auth/reinit-mdp/confirmer/:token',
      name: 'reinit-mdp-confirmer',
      component: () => import('../views/ReinitialisationPasswordView.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/campagnes',
      name: 'campagnes',
      component: () => import('../views/CampagnesView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/formations',
      name: 'formations',
      component: () => import('../views/FormationsView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/planification',
      name: 'planification',
      component: () => import('../views/PlanificationView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/convocations',
      name: 'convocations',
      component: () => import('../views/ConvocationsView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/emargement',
      name: 'emargement',
      component: () => import('../views/EmargementView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/formulaires',
      name: 'formulaires',
      component: () => import('../views/FormulairesView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/formulaires/:id/edit',
      name: 'formulaire-editor',
      component: () => import('../views/FormBuilderView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/formulaires/:id/preview',
      name: 'formulaire-preview',
      component: () => import('../views/FormPreviewView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/utilisateurs',
      name: 'utilisateurs',
      component: () => import('../views/UtilisateursView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/profil',
      name: 'profil',
      component: () => import('../views/ProfilView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/postuler',
      name: 'postuler-campagnes',
      component: () => import('../views/PublicCampagnesView.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/postuler/:campagneId',
      name: 'postuler-formulaire',
      component: () => import('../views/PostulerView.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/candidatures',
      name: 'candidatures-liste',
      component: () => import('../views/CandidaturesView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/candidatures/:id',
      name: 'candidature-detail',
      component: () => import('../views/CandidatureDetailView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/scan-candidat/:candidateId',
      name: 'scan-candidat',
      component: () => import('../views/ScanCandidatView.vue'),
      meta: { requiresAuth: true },
    },

    // ============================================================
    // ROUTES ÉVALUATEUR
    // ============================================================

    {
      path: '/evaluator/interviews',
      name: 'evaluator-interviews',
      component: MyInterviewsView,
      meta: { requiresAuth: true },
    },

    {
      path: '/evaluator/candidates',
      name: 'evaluator-candidates',
      component: MyCandidatesView,
      meta: { requiresAuth: true },
    },

    {
      path: '/evaluator/candidates/:candidateId',
      name: 'evaluator-candidate-detail',
      component: CandidateDetailView,
      meta: { requiresAuth: true },
    },

    {
      path: '/evaluator/interviews/:interviewId',
      name: 'evaluator-conduct-interview',
      component: ConductInterviewView,
      meta: { requiresAuth: true },
    },

    {
      path: '/evaluator/interviews/:interviewId/evaluation',
      name: 'evaluator-evaluation',
      component: EvaluationView,
      meta: { requiresAuth: true },
    },

    {
      path: '/evaluator/interviews/:interviewId/evaluation/validation',
      name: 'evaluator-evaluation-validation',
      component: EvaluationValidationView,
      meta: { requiresAuth: true },
    },

    // ============================================================
    // SCAN QR CODE ÉMARGEMENT
    // ============================================================

    {
      path: '/scan-emargement/:token',
      name: 'scan-emargement',
      component: () => import('../views/ScanEmargementView.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

/**
 * Garde de navigation globale :
 * contrôle l'authentification et la complétion du profil.
 */
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Utilisateur non authentifié
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Utilisateur déjà authentifié
  if (to.name === 'login' && authStore.isAuthenticated) {
    // Évaluateur → espace évaluateur
    if (authStore.user?.role === 'Evaluateur') {
      return { name: 'evaluator-interviews' }
    }

    // Autres rôles → dashboard
    return { name: 'dashboard' }
  }

  // Les routes Évaluateur ne sont pas bloquées par profilComplet
  const isEvaluatorRoute =
    typeof to.name === 'string' &&
    to.name.startsWith('evaluator-')

  if (
    authStore.isAuthenticated &&
    isEvaluatorRoute &&
    authStore.user?.role !== 'Evaluateur'
  ) {
    return { name: 'dashboard' }
  }

  // Vérification du profil pour les autres espaces
  if (
    authStore.isAuthenticated &&
    to.meta.requiresAuth &&
    !isEvaluatorRoute &&
    !authStore.user?.profilComplet &&
    to.name !== 'profil'
  ) {
    return { name: 'profil' }
  }

  return true
})

export default router
