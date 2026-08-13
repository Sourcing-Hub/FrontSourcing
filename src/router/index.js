import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'

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
  ],
})

/**
 * Garde de navigation globale : contrôle l'authentification et force la complétion du profil.
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (authStore.isAuthenticated && to.meta.requiresAuth) {
    // Si l'utilisateur est authentifié et que la route nécessite l'auth
    if (!authStore.user?.profilComplet && to.name !== 'profil') {
      // Rediriger de force vers /profil si le profil n'est pas complet
      next({ name: 'profil' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

// Gardes de navigation mis a jour
