<script setup>
/**
 * Tableau de bord principal de SourcingHub.
 * Présente une synthèse claire et opérationnelle des campagnes, candidatures et sessions.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCampagnesStore } from '../stores/campagnes'
import { useCandidaturesStore } from '../stores/candidatures'
import { usePlanningsStore } from '../stores/plannings'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import api from '../services/api'
import {
  Layers,
  Users,
  Calendar,
  GraduationCap,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  CalendarClock,
  QrCode,
  FileText,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const campagnesStore = useCampagnesStore()
const candidaturesStore = useCandidaturesStore()
const planningsStore = usePlanningsStore()

const isLoading = ref(true)
const isRefreshing = ref(false)

// Statistiques retournées par l'API backend
const stats = ref({
  campagnes_actives: 0,
  candidatures_en_cours: 0,
  entretiens_prevus: 0,
})

// Listes chargées
const campagnes = ref([])
const formations = ref([])
const candidatures = ref([])
const plannings = ref([])

// Nom d'affichage de l'utilisateur
const userName = computed(() => {
  const user = authStore.user
  if (!user) return 'Utilisateur'
  if (user.prenom || user.nom) {
    return `${user.prenom || ''} ${user.nom || ''}`.trim()
  }
  return user.name || 'Utilisateur'
})

// Date du jour formatée
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
})

// Chargement des données du tableau de bord
const fetchData = async (isManual = false) => {
  if (isManual) {
    isRefreshing.value = true
  } else {
    isLoading.value = true
  }

  try {
    const statsReq = api.get('/dashboard/stats/')
      .then(res => {
        stats.value = res.data
      })
      .catch(err => {
        console.error('Erreur chargement stats dashboard:', err)
      })

    const campagnesReq = campagnesStore.fetchCampagnes()
      .then(() => {
        campagnes.value = campagnesStore.campagnes || []
      })
      .catch(err => console.error('Erreur chargement campagnes:', err))

    const formationsReq = campagnesStore.fetchFormations()
      .then(() => {
        formations.value = campagnesStore.formations || []
      })
      .catch(err => console.error('Erreur chargement formations:', err))

    const candidaturesReq = candidaturesStore.fetchCandidatures()
      .then(() => {
        candidatures.value = candidaturesStore.candidatures || []
      })
      .catch(err => console.error('Erreur chargement candidatures:', err))

    const planningsReq = planningsStore.fetchPlannings()
      .then(() => {
        plannings.value = planningsStore.plannings || []
      })
      .catch(err => console.error('Erreur chargement plannings:', err))

    await Promise.allSettled([
      statsReq,
      campagnesReq,
      formationsReq,
      candidaturesReq,
      planningsReq
    ])
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Totaux calculés
const totalCampagnesCount = computed(() => campagnes.value.length)
const totalCandidaturesCount = computed(() => candidatures.value.length)
const totalFormationsCount = computed(() => formations.value.length)

// Campagnes actives (max 5)
const activeCampagnes = computed(() => {
  return campagnes.value
    .filter(c => c.statut === 'OUVERTE' || c.statut === 'PUBLIEE')
    .slice(0, 5)
})

// Candidatures récentes (max 6)
const recentCandidatures = computed(() => {
  return [...candidatures.value]
    .sort((a, b) => {
      const dateA = new Date(a.date_soumission || a.created_at || 0)
      const dateB = new Date(b.date_soumission || b.created_at || 0)
      return dateB - dateA
    })
    .slice(0, 6)
})

// Prochains créneaux de planning (max 4)
const upcomingPlannings = computed(() => {
  return [...plannings.value]
    .sort((a, b) => {
      const dateA = new Date(a.date_debut || a.date || 0)
      const dateB = new Date(b.date_debut || b.date || 0)
      return dateA - dateB
    })
    .slice(0, 4)
})

// Utilitaires de formatage
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d)
  } catch {
    return dateStr
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  } catch {
    return dateStr
  }
}

const getStatutBadge = (statut) => {
  const s = (statut || '').toUpperCase()
  switch (s) {
    case 'OUVERTE':
    case 'PUBLIEE':
      return { label: 'Ouverte', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'BROUILLON':
      return { label: 'Brouillon', class: 'bg-gray-100 text-gray-700 border-gray-200' }
    case 'FERMEE':
    case 'CLOTUREE':
      return { label: 'Clôturée', class: 'bg-rose-50 text-rose-700 border-rose-200' }
    case 'VALIDE':
    case 'ADMIS':
    case 'ACCEPTE':
      return { label: 'Admis', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'EN_COURS':
      return { label: 'En cours', class: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'EN_ATTENTE':
    case 'SOUMIS':
      return { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'REFUSE':
    case 'REJETE':
      return { label: 'Refusé', class: 'bg-rose-50 text-rose-700 border-rose-200' }
    default:
      return { label: statut || 'Inconnu', class: 'bg-gray-50 text-gray-600 border-gray-200' }
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Entête de page -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-xl font-bold text-gray-900 tracking-tight">Tableau de bord</h2>
          <p class="text-xs text-gray-500 hidden sm:block">
            Bienvenue, {{ userName }} &bull; <span class="capitalize">{{ formattedDate }}</span>
          </p>
        </div>
      </div>
    </template>

    <template #header-actions>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-secondary !py-2 !px-3 text-xs gap-1.5"
          :class="{ 'opacity-60 pointer-events-none': isRefreshing }"
          title="Actualiser les données"
          @click="fetchData(true)"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
          <span class="hidden sm:inline">Actualiser</span>
        </button>

        <button
          type="button"
          class="btn-primary !py-2 !px-3.5 text-xs gap-1.5"
          @click="router.push('/campagnes')"
        >
          <Plus class="w-4 h-4" />
          <span>Nouvelle campagne</span>
        </button>
      </div>
    </template>

    <div class="space-y-6">

      <!-- ========================================================================= -->
      <!-- 1. CARTES D'INDICATEURS CLÉS (KPIS)                                       -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Campagnes actives -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campagnes Actives</p>
            <h3 class="text-2xl font-extrabold text-gray-900">{{ stats.campagnes_actives }}</h3>
            <p class="text-xs text-gray-500">
              Sur <span class="font-medium text-gray-700">{{ totalCampagnesCount }}</span> campagne(s)
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-primary-600">
            <Layers class="w-6 h-6" />
          </div>
        </div>

        <!-- Candidatures en cours -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Candidatures en cours</p>
            <h3 class="text-2xl font-extrabold text-amber-700">{{ stats.candidatures_en_cours }}</h3>
            <p class="text-xs text-gray-500">
              Sur <span class="font-medium text-gray-700">{{ totalCandidaturesCount }}</span> dossier(s)
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Users class="w-6 h-6" />
          </div>
        </div>

        <!-- Entretiens prévus -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider">Entretiens Prévus</p>
            <h3 class="text-2xl font-extrabold text-blue-700">{{ stats.entretiens_prevus }}</h3>
            <p class="text-xs text-gray-500">
              Sessions planifiées
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calendar class="w-6 h-6" />
          </div>
        </div>

        <!-- Formations -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Formations</p>
            <h3 class="text-2xl font-extrabold text-emerald-700">{{ totalFormationsCount }}</h3>
            <p class="text-xs text-gray-500">
              Filières enregistrées
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <GraduationCap class="w-6 h-6" />
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- 2. CAMPAGNES ACTIVES                                                      -->
      <!-- ========================================================================= -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div class="p-5 flex items-center justify-between border-b border-gray-200/70">
          <div>
            <h3 class="text-base font-bold text-gray-900">Campagnes de recrutement en cours</h3>
            <p class="text-xs text-gray-500 mt-0.5">Sessions de candidature actuellement ouvertes au public</p>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
            @click="router.push('/campagnes')"
          >
            Toutes les campagnes
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Table des campagnes -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200/60 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-5">Intitulé de la campagne</th>
                <th class="py-3 px-5">Formation associée</th>
                <th class="py-3 px-5">Date d'ouverture</th>
                <th class="py-3 px-5">Date de clôture</th>
                <th class="py-3 px-5">Statut</th>
                <th class="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-700">
              <tr v-if="activeCampagnes.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-400">
                  Aucune campagne active actuellement.
                </td>
              </tr>
              <tr
                v-for="c in activeCampagnes"
                :key="c.id"
                class="hover:bg-gray-50/70 transition-colors"
              >
                <td class="py-3.5 px-5 font-semibold text-gray-900">
                  {{ c.nom }}
                </td>
                <td class="py-3.5 px-5 text-gray-600">
                  {{ c.formation_nom || c.formation?.nom || c.formation || '-' }}
                </td>
                <td class="py-3.5 px-5 text-gray-600">
                  {{ formatDate(c.dateOuverture || c.date_debut) }}
                </td>
                <td class="py-3.5 px-5 text-gray-600">
                  {{ formatDate(c.dateCloture || c.date_fin) }}
                </td>
                <td class="py-3.5 px-5">
                  <span
                    class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                    :class="getStatutBadge(c.statut).class"
                  >
                    {{ getStatutBadge(c.statut).label }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-right">
                  <button
                    type="button"
                    class="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                    @click="router.push('/campagnes')"
                  >
                    Gérer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 3. GRILLE DEUX COLONNES: CANDIDATURES RÉCENTES & PROCHAINS PLANNINGS      -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Colonne Gauche: Dernières Candidatures (7/12) -->
        <div class="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div class="p-5 flex items-center justify-between border-b border-gray-200/70">
              <div>
                <h3 class="text-base font-bold text-gray-900">Dernières candidatures reçues</h3>
                <p class="text-xs text-gray-500 mt-0.5">Dossiers déposés récemment sur la plateforme</p>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                @click="router.push('/candidatures')"
              >
                Voir tout
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>

            <!-- Liste des candidatures -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200/60 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th class="py-3 px-5">Candidat</th>
                    <th class="py-3 px-5">Campagne</th>
                    <th class="py-3 px-5">Date</th>
                    <th class="py-3 px-5">Statut</th>
                    <th class="py-3 px-5 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-gray-700">
                  <tr v-if="recentCandidatures.length === 0">
                    <td colspan="5" class="py-8 text-center text-gray-400">
                      Aucune candidature enregistrée.
                    </td>
                  </tr>
                  <tr
                    v-for="cand in recentCandidatures"
                    :key="cand.id"
                    class="hover:bg-gray-50/70 transition-colors"
                  >
                    <td class="py-3.5 px-5 font-semibold text-gray-900">
                      <div>{{ cand.prenom }} {{ cand.nom }}</div>
                      <div class="text-[11px] text-gray-400 font-normal">{{ cand.email }}</div>
                    </td>
                    <td class="py-3.5 px-5 text-gray-600 max-w-[150px] truncate">
                      {{ cand.campagne_nom || cand.campagne?.nom || '-' }}
                    </td>
                    <td class="py-3.5 px-5 text-gray-500">
                      {{ formatDate(cand.date_soumission || cand.created_at) }}
                    </td>
                    <td class="py-3.5 px-5">
                      <span
                        class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                        :class="getStatutBadge(cand.statut).class"
                      >
                        {{ getStatutBadge(cand.statut).label }}
                      </span>
                    </td>
                    <td class="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Consulter le dossier"
                        @click="router.push(cand.id ? `/candidatures/${cand.id}` : '/candidatures')"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              type="button"
              class="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1"
              @click="router.push('/candidatures')"
            >
              Consulter la liste complète des candidatures
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Colonne Droite: Prochaines Sessions & Entretiens (5/12) -->
        <div class="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div class="p-5 flex items-center justify-between border-b border-gray-200/70">
              <div>
                <h3 class="text-base font-bold text-gray-900">Prochains Entretiens & Jurys</h3>
                <p class="text-xs text-gray-500 mt-0.5">Sessions de passage planifiées</p>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                @click="router.push('/planification')"
              >
                Planning
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>

            <!-- Liste des sessions -->
            <div class="p-5 space-y-3">
              <div
                v-if="upcomingPlannings.length === 0"
                class="py-8 text-center text-gray-400 text-xs space-y-2"
              >
                <Calendar class="w-8 h-8 mx-auto text-gray-300" />
                <p>Aucune session d'entretien planifiée à venir.</p>
              </div>

              <div
                v-for="session in upcomingPlannings"
                :key="session.id"
                class="p-3.5 rounded-xl border border-gray-200/70 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                @click="router.push('/planification')"
              >
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-gray-900">
                    {{ session.nom || session.titre || 'Session d\'évaluation' }}
                  </h4>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {{ session.etape || 'Entretien' }}
                  </span>
                </div>

                <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5 text-gray-400" />
                    {{ formatDateTime(session.date_debut || session.date) }}
                  </span>
                  <span>
                    {{ session.candidats_count || session.candidatures?.length || 0 }} candidat(s)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
            <button
              type="button"
              class="btn-secondary !py-2 !px-3 text-xs w-full justify-center"
              @click="router.push('/emargement')"
            >
              <QrCode class="w-3.5 h-3.5 mr-1.5" />
              Émargement
            </button>
            <button
              type="button"
              class="btn-secondary !py-2 !px-3 text-xs w-full justify-center"
              @click="router.push('/planification')"
            >
              <Calendar class="w-3.5 h-3.5 mr-1.5" />
              Gérer planning
            </button>
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- 4. RACCOURCIS OPÉRATIONNELS                                               -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          class="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          @click="router.push('/campagnes')"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-50 text-[#00313C] group-hover:text-primary-600 flex items-center justify-center transition-colors">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Campagnes
              </h4>
              <p class="text-[11px] text-gray-500">Création & dates de clôture</p>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          @click="router.push('/formulaires')"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-50 text-[#00313C] group-hover:text-primary-600 flex items-center justify-center transition-colors">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Formulaires
              </h4>
              <p class="text-[11px] text-gray-500">Champs dynamiques & questions</p>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          @click="router.push('/convocations')"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-50 text-[#00313C] group-hover:text-primary-600 flex items-center justify-center transition-colors">
              <CalendarClock class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Convocations
              </h4>
              <p class="text-[11px] text-gray-500">Envoi d'invitations & QR code</p>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          @click="router.push('/emargement')"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-50 text-[#00313C] group-hover:text-primary-600 flex items-center justify-center transition-colors">
              <QrCode class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Émargement
              </h4>
              <p class="text-[11px] text-gray-500">Scanner & suivi de présence</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </DashboardLayout>
</template>
