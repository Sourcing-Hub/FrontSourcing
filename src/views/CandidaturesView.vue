import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCandidaturesStore } from '../stores/candidatures'
import { useCampagnesStore } from '../stores/campagnes'
import api from '../services/api'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { ClipboardList, Search, Loader2, Eye, User, QrCode, Download } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const store = useCandidaturesStore()
const campagnesStore = useCampagnesStore()

const search = ref('')
const filterCampagne = ref('')
const filterStatut = ref('')
const qrCodeDataUrl = ref('')

onMounted(async () => {
  // Load campaigns for filters (staff only)
  if (!authStore.user?.role || authStore.user.role !== 'Candidat') {
    await campagnesStore.fetchCampagnes()
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

const fetchCandidaturesList = async () => {
  const params = {}
  if (search.value) params.search = search.value
  if (filterCampagne.value) params.campagne = filterCampagne.value
  if (filterStatut.value) params.statut = filterStatut.value

  await store.fetchCandidatures(params)
}

// Watch filters
watch([filterCampagne, filterStatut], () => {
  fetchCandidaturesList()
})

const handleSearch = () => {
  fetchCandidaturesList()
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900">
        {{ authStore.user?.role === 'Candidat' ? 'Mes Candidatures' : 'Gestion des Candidatures' }}
      </h2>
    </template>

    <div class="space-y-6">
      <!-- Section de filtres pour l'administration (Staff) -->
      <div v-if="authStore.user?.role !== 'Candidat'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-end">
        <!-- Recherche -->
        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
          <div class="relative">
            <input
              type="text"
              v-model="search"
              @keyup.enter="handleSearch"
              placeholder="Numéro, nom, prénom ou e-mail..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033]"
            />
            <Search class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <!-- Filtre Campagne -->
        <div class="w-full md:w-64">
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrer par Campagne</label>
          <select
            v-model="filterCampagne"
            class="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033]"
          >
            <option value="">Toutes les campagnes</option>
            <option v-for="camp in campagnesStore.campagnes" :key="camp.id" :value="camp.id">
              {{ camp.nom }}
            </option>
          </select>
        </div>

        <!-- Filtre Statut -->
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrer par Statut</label>
          <select
            v-model="filterStatut"
            class="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033]"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
          </select>
        </div>

        <!-- Bouton de recherche -->
        <button
          @click="handleSearch"
          class="w-full md:w-auto px-6 py-2 bg-[#CE0033] text-white rounded-lg hover:bg-[#a8002a] text-sm font-semibold transition-colors shadow-sm"
        >
          Rechercher
        </button>
      </div>

      <!-- Erreur -->
      <div v-if="store.error" class="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
        {{ store.error }}
      </div>

      <!-- Tableaux / Listes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="store.loading" class="flex justify-center items-center py-20">
          <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
        </div>

        <div v-else-if="store.candidatures.length === 0" class="text-center py-16 px-4">
          <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">Aucune candidature trouvée</h3>
          <p class="text-gray-500 mt-1">Aucune candidature ne correspond à vos critères pour le moment.</p>
        </div>

        <!-- Mode Candidat : Vue en grille avec le badge QR d'identification -->
        <div v-else-if="authStore.user?.role === 'Candidat'" class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Carte QR Code d'identification -->
          <div class="border border-gray-150 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 flex flex-col items-center justify-between text-center shadow-sm h-full">
            <div>
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#CE0033]">
                <QrCode class="w-5 h-5" />
              </div>
              <h4 class="font-bold text-gray-900 mb-1">Badge d'identification</h4>
              <p class="text-xs text-gray-500 max-w-xs mx-auto mb-6">Présentez ce code QR lors des épreuves de sélection pour enregistrer votre présence.</p>
            </div>
            
            <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center my-4">
              <div v-if="!qrCodeDataUrl" class="w-32 h-32 flex items-center justify-center">
                <Loader2 class="w-6 h-6 animate-spin text-gray-300" />
              </div>
              <img v-else :src="qrCodeDataUrl" alt="QR Code d'émargement" class="w-36 h-36" />
            </div>

            <button
              @click="downloadQrCode"
              :disabled="!qrCodeDataUrl"
              class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Download class="w-4 h-4" />
              Télécharger mon QR Code
            </button>
          </div>

          <!-- Liste des candidatures -->
          <div class="lg:col-span-2 space-y-6">
            <div
              v-for="cand in store.candidatures"
              :key="cand.id"
              class="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow relative bg-white"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-semibold text-gray-900">{{ cand.numero }}</span>
              <span
                class="px-2.5 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-amber-100 text-amber-800': cand.statut === 'EN_ATTENTE',
                  'bg-blue-100 text-blue-800': cand.statut === 'EN_COURS',
                  'bg-emerald-100 text-emerald-800': cand.statut === 'TERMINEE'
                }"
              >
                {{ cand.statut === 'EN_ATTENTE' ? 'En attente' : cand.statut === 'EN_COURS' ? 'En cours' : 'Terminée' }}
              </span>
            </div>

            <h4 class="font-bold text-gray-900 mb-1">{{ cand.campagne_nom }}</h4>
            <p class="text-xs text-gray-500 mb-4">Formation : {{ cand.formation_nom }}</p>

            <div class="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-500">
              <span>Soumis le : {{ new Date(cand.dateSoumission).toLocaleDateString('fr-FR') }}</span>
              <button
                @click="router.push(`/candidatures/${cand.id}`)"
                class="flex items-center font-semibold text-[#CE0033] hover:text-[#a8002a]"
              >
                <Eye class="w-4 h-4 mr-1" />
                Consulter
              </button>
            </div>
          </div>
        </div>

        <!-- Mode Staff : Tableau de gestion complet -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Candidature</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidat</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campagne</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="cand in store.candidatures" :key="cand.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ cand.numero }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                      <User class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ cand.candidat_nom }}</div>
                      <div class="text-xs text-gray-500">{{ cand.candidat_email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ cand.campagne_nom }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ cand.formation_nom }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(cand.dateSoumission).toLocaleDateString('fr-FR') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-amber-100 text-amber-800': cand.statut === 'EN_ATTENTE',
                      'bg-blue-100 text-blue-800': cand.statut === 'EN_COURS',
                      'bg-emerald-100 text-emerald-800': cand.statut === 'TERMINEE'
                    }"
                  >
                    {{ cand.statut === 'EN_ATTENTE' ? 'En attente' : cand.statut === 'EN_COURS' ? 'En cours' : 'Terminée' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="router.push(`/candidatures/${cand.id}`)"
                    class="text-[#CE0033] hover:text-[#a8002a] font-semibold flex items-center justify-end ml-auto"
                  >
                    <Eye class="w-4 h-4 mr-1" />
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
