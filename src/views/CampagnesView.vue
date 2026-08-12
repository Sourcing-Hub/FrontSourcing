<script setup>
import { onMounted, ref } from 'vue'
import { useCampagnesStore } from '../stores/campagnes'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Plus, Play, Square, Archive, Loader2 } from 'lucide-vue-next'

const store = useCampagnesStore()
const showModal = ref(false)

const newCampagne = ref({
  nom: '',
  description: '',
  dateOuverture: '',
  dateCloture: '',
  cohorte: '',
})

onMounted(async () => {
  await store.fetchCampagnes()
  await store.fetchFormations()
  await store.fetchCohortes()
})

const getStatusColor = (statut) => {
  switch (statut) {
    case 'BROUILLON':
      return 'bg-gray-100 text-gray-800'
    case 'OUVERTE':
      return 'bg-green-100 text-green-800'
    case 'FERMEE':
      return 'bg-red-100 text-red-800'
    case 'ARCHIVEE':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const handleCreate = async () => {
  const result = await store.createCampagne(newCampagne.value)
  if (result) {
    showModal.value = false
    newCampagne.value = {
      nom: '',
      description: '',
      dateOuverture: '',
      dateCloture: '',
      cohorte: '',
    }
  }
}

const handleAction = async (id, action) => {
  await store.updateCampagneStatus(id, action)
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-xl font-semibold text-gray-900">Gestion des Campagnes</h2>
        <button @click="showModal = true" class="btn-primary">
          <Plus class="w-4 h-4 mr-2" /> Nouvelle Campagne
        </button>
      </div>
    </template>

    <!-- Erreur globale -->
    <div v-if="store.error" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
      <p class="text-sm text-red-700">{{ store.error }}</p>
    </div>

    <!-- Chargement -->
    <div
      v-if="store.loading && store.campagnes.length === 0"
      class="flex justify-center items-center h-64"
    >
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <!-- Liste -->
    <div v-else class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nom de la Campagne
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Formation / Cohorte
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dates
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="campagne in store.campagnes"
              :key="campagne.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ campagne.nom }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs">
                  {{ campagne.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ campagne.formation_nom }}</div>
                <div class="text-sm text-gray-500">{{ campagne.cohorte_nom }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Du {{ formatDate(campagne.dateOuverture) }}</div>
                <div class="text-sm text-gray-500">Au {{ formatDate(campagne.dateCloture) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusColor(campagne.statut)"
                  class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ campagne.statut }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  v-if="campagne.statut === 'BROUILLON' || campagne.statut === 'FERMEE'"
                  @click="handleAction(campagne.id, 'ouvrir')"
                  class="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-lg"
                  title="Ouvrir"
                >
                  <Play class="w-4 h-4" />
                </button>
                <button
                  v-if="campagne.statut === 'OUVERTE'"
                  @click="handleAction(campagne.id, 'fermer')"
                  class="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg"
                  title="Fermer"
                >
                  <Square class="w-4 h-4" />
                </button>
                <button
                  v-if="campagne.statut !== 'ARCHIVEE'"
                  @click="handleAction(campagne.id, 'archiver')"
                  class="text-yellow-600 hover:text-yellow-900 bg-yellow-50 p-2 rounded-lg"
                  title="Archiver"
                >
                  <Archive class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="store.campagnes.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                Aucune campagne trouvée. Cliquez sur "Nouvelle Campagne" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modale de création -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="showModal = false"
        ></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
        >
          <form @submit.prevent="handleCreate">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Créer une Campagne
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nom de la campagne</label>
                  <input type="text" v-model="newCampagne.nom" required class="input-field mt-1" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Cohorte</label>
                  <select v-model="newCampagne.cohorte" required class="input-field mt-1">
                    <option value="" disabled>Sélectionnez une cohorte</option>
                    <option v-for="cohorte in store.cohortes" :key="cohorte.id" :value="cohorte.id">
                      {{ cohorte.nom }} ({{ cohorte.formation_nom }})
                    </option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Date d'ouverture</label>
                    <input
                      type="datetime-local"
                      v-model="newCampagne.dateOuverture"
                      required
                      class="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Date de clôture</label>
                    <input
                      type="datetime-local"
                      v-model="newCampagne.dateCloture"
                      required
                      class="input-field mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="newCampagne.description"
                    rows="3"
                    class="input-field mt-1"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="store.loading"
                class="btn-primary w-full sm:w-auto sm:ml-3"
              >
                <Loader2 v-if="store.loading" class="w-4 h-4 mr-2 animate-spin" />
                Créer
              </button>
              <button
                type="button"
                @click="showModal = false"
                class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
