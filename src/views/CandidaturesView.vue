<script setup>
/**
 * Vue principale des candidatures : interface adaptative pour candidats et membres du personnel.
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCandidaturesStore } from '../stores/candidatures'
import { useCampagnesStore } from '../stores/campagnes'
import api from '../services/api'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { 
  ClipboardList, 
  Search, 
  Loader2, 
  Eye, 
  User, 
  QrCode, 
  Download, 
  ShieldCheck, 
  ShieldAlert,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  GraduationCap,
  Layers,
  ArrowUpRight
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const store = useCandidaturesStore()
const campagnesStore = useCampagnesStore()

const search = ref('')
const filterCampagne = ref('')
const filterStatut = ref('')
const filterAnnee = ref('')
const filterFormation = ref('')
const filterPromotion = ref('')
const filterEtape = ref('')
const qrCodeDataUrl = ref('')

onMounted(async () => {
  // Load campaigns, formations, and cohortes for filters (staff only)
  if (!authStore.user?.role || authStore.user.role !== 'Candidat') {
    await campagnesStore.fetchCampagnes()
    await campagnesStore.fetchFormations()
    await campagnesStore.fetchCohortes()
  }
  await fetchCandidaturesList()
  await fetchQrCode()
})

const fetchQrCode = async () => {
  if (authStore.user?.role === 'Candidat') {
    try {
      const response = await api.get(`utilisateurs/${authStore.user.id}/qr-code/`, {
        responseType: 'blob'
      })
      qrCodeDataUrl.value = URL.createObjectURL(response.data)
    } catch (err) {
      console.error('Erreur lors du chargement du QR Code', err)
    }
  }
}

const downloadQrCode = () => {
  if (!qrCodeDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrCodeDataUrl.value
  link.download = `qrcode_${authStore.user?.nom || 'badge'}.png`
  link.click()
}

// Compute available years (from current year down to 2024)
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= 2024; y--) {
    years.push(y)
  }
  return years
})

// Filter promotions based on selected formation
const filteredCohortesList = computed(() => {
  if (!filterFormation.value) {
    return campagnesStore.cohortes
  }
  return campagnesStore.cohortes.filter(
    (c) => c.formation === filterFormation.value
  )
})

// Reset promotion and step filter when formation filter changes
const handleFormationChange = () => {
  filterPromotion.value = ''
  filterEtape.value = ''
  fetchCandidaturesList()
}

// Reset step filter when promotion filter changes
const handlePromotionChange = () => {
  filterEtape.value = ''
  fetchCandidaturesList()
}

// Compute available steps based on selected promotion or formation
const availableSteps = computed(() => {
  const steps = new Set()
  steps.add("Dossier") // Toujours présent
  
  const cohortesToUse = filterPromotion.value
    ? campagnesStore.cohortes.filter((c) => c.id === filterPromotion.value)
    : filteredCohortesList.value
    
  cohortesToUse.forEach((cohorte) => {
    if (cohorte.etapes) {
      cohorte.etapes.forEach((etape) => {
        if (etape.nom) {
          steps.add(etape.nom)
        }
      })
    }
  })
  
  return Array.from(steps)
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (filterCampagne.value) count++
  if (filterStatut.value) count++
  if (filterAnnee.value) count++
  if (filterFormation.value) count++
  if (filterPromotion.value) count++
  if (filterEtape.value) count++
  return count
})

const resetFilters = () => {
  search.value = ''
  filterCampagne.value = ''
  filterStatut.value = ''
  filterAnnee.value = ''
  filterFormation.value = ''
  filterPromotion.value = ''
  filterEtape.value = ''
  fetchCandidaturesList()
}

// Compute KPI statistics
const totalCandidatures = computed(() => store.candidatures.length)
const countEnAttente = computed(() => store.candidatures.filter(c => c.statut === 'EN_ATTENTE').length)
const countEnCours = computed(() => store.candidatures.filter(c => c.statut === 'EN_COURS').length)
const countTerminee = computed(() => store.candidatures.filter(c => c.statut === 'TERMINEE').length)

const fetchCandidaturesList = async () => {
  const params = {}
  if (search.value) params.search = search.value
  if (filterCampagne.value) params.campagne = filterCampagne.value
  if (filterStatut.value) params.statut = filterStatut.value
  if (filterAnnee.value) params.annee = filterAnnee.value
  if (filterFormation.value) params.formation = filterFormation.value
  if (filterPromotion.value) params.promotion = filterPromotion.value
  if (filterEtape.value) params.etape_nom = filterEtape.value

  await store.fetchCandidatures(params)
}

// Watch filters
watch([filterCampagne, filterStatut, filterAnnee, filterPromotion, filterEtape], () => {
  fetchCandidaturesList()
})

const handleSearch = () => {
  fetchCandidaturesList()
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-xl font-bold text-gray-900 tracking-tight">
            {{ authStore.user?.role === 'Candidat' ? 'Mes Candidatures' : 'Gestion des Candidatures' }}
          </h2>
          <p class="text-xs text-gray-500 hidden sm:block">
            {{ authStore.user?.role === 'Candidat' ? 'Consultez et suivez l\'état de vos dossiers de candidature' : 'Pilotez, filtrez et suivez le parcours de tous les candidats' }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Cartes d'indicateurs clés (KPIs) - Pour l'administration / staff -->
      <div v-if="authStore.user?.role !== 'Candidat'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/70 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Candidatures</p>
            <h3 class="text-2xl font-extrabold text-gray-900 mt-1">{{ totalCandidatures }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-[#00313C]">
            <ClipboardList class="w-6 h-6" />
          </div>
        </div>

        <!-- En attente -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/70 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider">En attente</p>
            <h3 class="text-2xl font-extrabold text-amber-700 mt-1">{{ countEnAttente }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock class="w-6 h-6" />
          </div>
        </div>

        <!-- En cours -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/70 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider">En cours</p>
            <h3 class="text-2xl font-extrabold text-blue-700 mt-1">{{ countEnCours }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers class="w-6 h-6" />
          </div>
        </div>

        <!-- Terminées -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200/70 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Terminées</p>
            <h3 class="text-2xl font-extrabold text-emerald-700 mt-1">{{ countTerminee }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- Section de filtres pour l'administration (Staff) -->
      <div v-if="authStore.user?.role !== 'Candidat'" class="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
        <!-- Ligne 1 : Recherche & Boutons d'action -->
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-gray-100 pb-4">
          <div class="relative flex-1">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              v-model="search"
              @keyup.enter="handleSearch"
              placeholder="Rechercher par numéro, nom, prénom, email..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all"
            />
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="handleSearch"
              class="px-5 py-2.5 bg-[#CE0033] hover:bg-[#a8002a] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Search class="w-4 h-4" />
              Rechercher
            </button>

            <button
              v-if="activeFiltersCount > 0"
              @click="resetFilters"
              class="px-3.5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw class="w-4 h-4" />
              <span class="hidden md:inline">Réinitialiser</span>
              <span class="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {{ activeFiltersCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Ligne 2 : Grille de filtres sélecteurs réactifs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <!-- Filtre Année -->
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Année</label>
            <select
              v-model="filterAnnee"
              class="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all"
            >
              <option value="">Toutes les années</option>
              <option v-for="y in availableYears" :key="y" :value="y">
                {{ y }}
              </option>
            </select>
          </div>

          <!-- Filtre Formation -->
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Formation</label>
            <select
              v-model="filterFormation"
              @change="handleFormationChange"
              class="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all truncate"
            >
              <option value="">Toutes les formations</option>
              <option v-for="f in campagnesStore.formations" :key="f.id" :value="f.id">
                {{ f.nom }}
              </option>
            </select>
          </div>

          <!-- Filtre Promotion (Cohorte) -->
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Promotion</label>
            <select
              v-model="filterPromotion"
              @change="handlePromotionChange"
              class="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all truncate"
            >
              <option value="">Toutes les promotions</option>
              <option v-for="c in filteredCohortesList" :key="c.id" :value="c.id">
                {{ c.nom }}
              </option>
            </select>
          </div>

          <!-- Filtre Étape Actuelle -->
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Étape du parcours</label>
            <select
              v-model="filterEtape"
              class="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all truncate"
            >
              <option value="">Toutes les étapes</option>
              <option v-for="step in availableSteps" :key="step" :value="step">
                {{ step }}
              </option>
            </select>
          </div>

          <!-- Filtre Campagne -->
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Campagne</label>
            <select
              v-model="filterCampagne"
              class="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all truncate"
            >
              <option value="">Toutes les campagnes</option>
              <option v-for="camp in campagnesStore.campagnes" :key="camp.id" :value="camp.id">
                {{ camp.nom }}
              </option>
            </select>
          </div>

          <!-- Filtre Statut -->
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Statut général</label>
            <select
              v-model="filterStatut"
              class="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-if="store.error" class="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-center gap-2">
        <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-500" />
        <span>{{ store.error }}</span>
      </div>

      <!-- Conteneur principal Liste / Tableau -->
      <div class="bg-white rounded-2xl border border-gray-200/80 overflow-hidden min-w-0">
        <!-- Spinner Chargement -->
        <div v-if="store.loading" class="flex flex-col justify-center items-center py-20 space-y-3">
          <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
          <p class="text-sm font-medium text-gray-500">Chargement des candidatures...</p>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="store.candidatures.length === 0" class="text-center py-16 px-4">
          <div class="bg-gray-100/70 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
            <ClipboardList class="w-8 h-8" />
          </div>
          <h3 class="text-base font-bold text-gray-900">Aucune candidature trouvée</h3>
          <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Aucune candidature ne correspond à vos filtres de recherche. Essayez de réinitialiser vos critères.
          </p>
          <button
            v-if="activeFiltersCount > 0"
            @click="resetFilters"
            class="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Mode Candidat : Vue en cartes avec badge d'identification QR -->
        <div v-else-if="authStore.user?.role === 'Candidat'" class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Carte Badge QR Code -->
          <div class="border border-gray-200/80 rounded-2xl p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col items-center justify-between text-center h-full">
            <div>
              <div class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#CE0033]">
                <QrCode class="w-6 h-6" />
              </div>
              <h4 class="font-bold text-gray-900 mb-1">Badge d'Émargement</h4>
              <p class="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                Présentez ce QR Code lors de vos épreuves ou ateliers de sélection pour valider votre présence.
              </p>
            </div>
            
            <div class="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-center my-2">
              <div v-if="!qrCodeDataUrl" class="w-36 h-36 flex items-center justify-center">
                <Loader2 class="w-6 h-6 animate-spin text-gray-300" />
              </div>
              <img v-else :src="qrCodeDataUrl" alt="QR Code d'émargement" class="w-36 h-36 object-contain" />
            </div>

            <button
              @click="downloadQrCode"
              :disabled="!qrCodeDataUrl"
              class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
            >
              <Download class="w-4 h-4" />
              Télécharger mon QR Code
            </button>
          </div>

          <!-- Liste des dossiers candidats -->
          <div class="lg:col-span-2 space-y-4">
            <div
              v-for="cand in store.candidatures"
              :key="cand.id"
              class="border border-gray-200/80 rounded-2xl p-6 transition-all bg-white relative group"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg">
                  {{ cand.numero }}
                </span>
                <span
                  class="px-3 py-1 text-xs font-bold rounded-full border"
                  :class="{ 'bg-amber-50 text-amber-700 border-amber-200': cand.statut === 'EN_ATTENTE', 'bg-blue-50 text-blue-700 border-blue-200': cand.statut === 'EN_COURS', 'bg-emerald-50 text-emerald-700 border-emerald-200': cand.statut === 'TERMINEE' }"
                >
                  {{ cand.statut === 'EN_ATTENTE' ? 'En attente' : cand.statut === 'EN_COURS' ? 'En cours' : 'Terminée' }}
                </span>
              </div>

              <h4 class="text-base font-bold text-gray-900 group-hover:text-[#CE0033] transition-colors mb-1">
                {{ cand.campagne_nom }}
              </h4>
              <p class="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                <GraduationCap class="w-4 h-4 text-gray-400" />
                <span>Formation : <strong class="text-gray-700 font-medium">{{ cand.formation_nom }}</strong></span>
              </p>

              <div class="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <Calendar class="w-3.5 h-3.5 text-gray-400" />
                  Soumis le {{ new Date(cand.dateSoumission).toLocaleDateString('fr-FR') }}
                </span>
                <button
                  @click="router.push(`/candidatures/${cand.id}`)"
                  class="flex items-center font-bold text-[#CE0033] hover:text-[#a8002a] transition-colors gap-1"
                >
                  Consulter mon dossier
                  <ArrowUpRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mode Staff / Administration : Tableau des candidatures -->
        <div v-else class="overflow-x-auto min-w-0">
          <table class="min-w-full divide-y divide-gray-200/80">
            <thead class="bg-gray-50/80">
              <tr>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  N° Candidature
                </th>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Candidat
                </th>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Campagne
                </th>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Formation / Promotion
                </th>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Étape Actuelle
                </th>
                <th scope="col" class="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" class="px-5 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr 
                v-for="cand in store.candidatures" 
                :key="cand.id" 
                class="hover:bg-gray-50/80 transition-colors"
              >
                <td class="px-5 py-4 whitespace-nowrap text-xs font-bold text-gray-900">
                  <span class="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded-md border border-gray-200/60">
                    {{ cand.numero }}
                  </span>
                </td>
                
                <td class="px-5 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-9 w-9 rounded-full bg-[#00313C]/10 text-[#00313C] flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">
                      {{ cand.candidat_nom ? cand.candidat_nom.charAt(0).toUpperCase() : 'C' }}
                    </div>
                    <div>
                      <div class="text-xs font-bold text-gray-900">{{ cand.candidat_nom }}</div>
                      <div class="text-[11px] text-gray-500 font-normal mt-0.5">
                        {{ cand.candidat_email }}
                      </div>
                      
                      <!-- Badge activation du compte -->
                      <span 
                        class="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        :class="cand.candidat_compte_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="cand.candidat_compte_active ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                        {{ cand.candidat_compte_active ? 'Compte Activé' : 'Inactif' }}
                      </span>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-4 whitespace-nowrap text-xs text-gray-700 font-medium">
                  {{ cand.campagne_nom }}
                </td>

                <td class="px-5 py-4 whitespace-nowrap text-xs">
                  <div class="font-semibold text-gray-900">{{ cand.formation_nom }}</div>
                  <div class="text-[11px] text-gray-400 font-normal mt-0.5">{{ cand.cohorte_nom || 'N/A' }}</div>
                </td>

                <td class="px-5 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                  {{ new Date(cand.dateSoumission).toLocaleDateString('fr-FR') }}
                </td>
                
                <!-- Colonne Étape Actuelle -->
                <td class="px-5 py-4 whitespace-nowrap text-xs">
                  <span 
                    class="px-2.5 py-1 inline-flex text-[11px] font-semibold rounded-full border"
                    :class="{ 'bg-red-50 text-red-700 border-red-200': ['ECHOUEE', 'ABSENT', 'ANNULEE'].includes(cand.etape_actuelle?.statut), 'bg-blue-50 text-blue-700 border-blue-200': cand.etape_actuelle?.statut === 'EN_COURS', 'bg-amber-50 text-amber-700 border-amber-200': cand.etape_actuelle?.statut === 'EN_ATTENTE', 'bg-emerald-50 text-emerald-700 border-emerald-200': cand.etape_actuelle?.statut === 'REUSSIE' }"
                  >
                    {{ cand.etape_actuelle?.label || 'Dossier soumis' }}
                  </span>
                </td>

                <td class="px-5 py-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 inline-flex text-[11px] font-bold rounded-full border"
                    :class="{ 'bg-amber-50 text-amber-800 border-amber-200': cand.statut === 'EN_ATTENTE', 'bg-blue-50 text-blue-800 border-blue-200': cand.statut === 'EN_COURS', 'bg-emerald-50 text-emerald-800 border-emerald-200': cand.statut === 'TERMINEE' }"
                  >
                    {{ cand.statut === 'EN_ATTENTE' ? 'En attente' : cand.statut === 'EN_COURS' ? 'En cours' : 'Terminée' }}
                  </span>
                </td>

                <td class="px-5 py-4 whitespace-nowrap text-right text-xs font-semibold">
                  <button
                    @click="router.push(`/candidatures/${cand.id}`)"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[#CE0033] hover:bg-red-50 rounded-xl transition-colors font-bold ml-auto"
                  >
                    <Eye class="w-4 h-4" />
                    Consulter
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
