<script setup>
import { onMounted, ref } from 'vue'
import { useCampagnesStore } from '../stores/campagnes'
import { useModalStore } from '../stores/modal'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, Users } from 'lucide-vue-next'

const store = useCampagnesStore()
const modalStore = useModalStore()
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)

const showCohortesModal = ref(false)
const isEditingCohorte = ref(false)
const selectedFormation = ref(null)

const currentFormation = ref({
  id: null,
  nom: '',
  description: '',
  dateDebut: '',
  dateFin: '',
})

const currentCohorte = ref({
  id: null,
  nom: '',
  dateDebut: '',
  dateFin: '',
  formation: null,
})

const itemToDelete = ref(null)
const itemToDeleteCohorte = ref(null)
const showDeleteCohorteModal = ref(false)

onMounted(async () => {
  await store.fetchFormations()
})

const openCreateModal = () => {
  store.error = null
  isEditing.value = false
  currentFormation.value = {
    id: null,
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
  }
  showModal.value = true
}

const openEditModal = (formation) => {
  store.error = null
  isEditing.value = true
  currentFormation.value = { ...formation }
  showModal.value = true
}

const confirmDelete = (id) => {
  itemToDelete.value = id
  showDeleteModal.value = true
}

const openCohortesModal = async (formation) => {
  store.error = null
  selectedFormation.value = formation
  await store.fetchCohortes(formation.id)
  showCohortesModal.value = true
}

const prepareCreateCohorte = () => {
  store.error = null
  isEditingCohorte.value = false
  currentCohorte.value = {
    id: null,
    nom: '',
    dateDebut: '',
    dateFin: '',
    formation: selectedFormation.value.id,
  }
}

const openEditCohorte = (cohorte) => {
  store.error = null
  isEditingCohorte.value = true
  currentCohorte.value = { ...cohorte }
}

const confirmDeleteCohorte = (id) => {
  itemToDeleteCohorte.value = id
  showDeleteCohorteModal.value = true
}

const handleCohorteSubmit = async () => {
  store.error = null
  const payload = { ...currentCohorte.value }
  payload.formation = selectedFormation.value.id
  if (!payload.dateDebut) payload.dateDebut = null
  if (!payload.dateFin) payload.dateFin = null

  if (payload.dateDebut && payload.dateFin && new Date(payload.dateDebut) >= new Date(payload.dateFin)) {
    store.error = "La date de fin de la cohorte doit être postérieure à la date de début."
    return
  }

  let result
  if (isEditingCohorte.value) {
    result = await store.updateCohorte(payload.id, payload)
  } else {
    result = await store.createCohorte(payload)
  }

  if (result) {
    prepareCreateCohorte() // Reset form
    await modalStore.showAlert(
      isEditingCohorte.value ? "La cohorte a été modifiée avec succès." : "La cohorte a été créée avec succès.",
      "Succès",
      "success"
    )
  }
}

const handleDeleteCohorte = async () => {
  if (itemToDeleteCohorte.value) {
    const success = await store.deleteCohorte(itemToDeleteCohorte.value)
    showDeleteCohorteModal.value = false
    itemToDeleteCohorte.value = null
    if (success) {
      await modalStore.showAlert("La cohorte a été supprimée avec succès.", "Succès", "success")
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Non définie'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const handleSubmit = async () => {
  store.error = null
  const payload = { ...currentFormation.value }
  if (!payload.dateDebut) payload.dateDebut = null
  if (!payload.dateFin) payload.dateFin = null

  if (payload.dateDebut && payload.dateFin && new Date(payload.dateDebut) >= new Date(payload.dateFin)) {
    store.error = "La date de fin de la formation doit être postérieure à la date de début."
    return
  }

  let result
  if (isEditing.value) {
    result = await store.updateFormation(payload.id, payload)
  } else {
    result = await store.createFormation(payload)
  }

  if (result) {
    showModal.value = false
    await modalStore.showAlert(
      isEditing.value ? "La formation a été modifiée avec succès." : "La formation a été créée avec succès.",
      "Succès",
      "success"
    )
  }
}

const handleDelete = async () => {
  if (itemToDelete.value) {
    const success = await store.deleteFormation(itemToDelete.value)
    showDeleteModal.value = false
    itemToDelete.value = null
    if (success) {
      await modalStore.showAlert("La formation a été supprimée avec succès.", "Succès", "success")
    }
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-xl font-semibold text-gray-900">Gestion des Formations</h2>
        <button @click="openCreateModal" class="btn-primary">
          <Plus class="w-4 h-4 mr-2" /> Nouvelle Formation
        </button>
      </div>
    </template>

    <!-- Erreur globale -->
    <div v-if="store.error" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
      <p class="text-sm text-red-700">{{ store.error }}</p>
    </div>

    <!-- Chargement -->
    <div
      v-if="store.loading && store.formations.length === 0"
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
                Formation
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dates
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
              v-for="formation in store.formations"
              :key="formation.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ formation.nom }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs" :title="formation.description">
                  {{ formation.description || 'Aucune description' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Du {{ formatDate(formation.dateDebut) }}</div>
                <div class="text-sm text-gray-500">Au {{ formatDate(formation.dateFin) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="openCohortesModal(formation)"
                  class="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-lg"
                  title="Gérer les cohortes"
                >
                  <Users class="w-4 h-4" />
                </button>
                <button
                  @click="openEditModal(formation)"
                  class="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg"
                  title="Modifier"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  @click="confirmDelete(formation.id)"
                  class="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="store.formations.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                Aucune formation trouvée. Cliquez sur "Nouvelle Formation" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modale Création / Édition Formations -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="showModal = false"
        ></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
          class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
        >
          <form @submit.prevent="handleSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ isEditing ? 'Modifier la formation' : 'Créer une formation' }}
              </h3>
              
              <div v-if="store.error" class="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-xs text-red-700">
                {{ store.error }}
              </div>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nom de la formation</label>
                  <input type="text" v-model="currentFormation.nom" required class="input-field mt-1" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Date de début (optionnel)</label>
                    <input type="date" v-model="currentFormation.dateDebut" class="input-field mt-1" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Date de fin (optionnel)</label>
                    <input type="date" v-model="currentFormation.dateFin" class="input-field mt-1" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea v-model="currentFormation.description" rows="3" class="input-field mt-1"></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="store.loading" class="btn-primary w-full sm:w-auto sm:ml-3">
                <Loader2 v-if="store.loading" class="w-4 h-4 mr-2 animate-spin" />
                {{ isEditing ? 'Enregistrer' : 'Créer' }}
              </button>
              <button type="button" @click="showModal = false" class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modale de Suppression -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDeleteModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle class="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Supprimer la formation
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible et entraînera la suppression des cohortes et campagnes associées.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="handleDelete" :disabled="store.loading" class="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              <Loader2 v-if="store.loading" class="w-4 h-4 mr-2 animate-spin" />
              Supprimer
            </button>
            <button type="button" @click="showDeleteModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale Gestion des Cohortes -->
    <div
      v-if="showCohortesModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showCohortesModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Cohortes pour {{ selectedFormation?.nom }}
              </h3>
              <button @click="showCohortesModal = false" class="text-gray-400 hover:text-gray-500">
                <span class="sr-only">Fermer</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="store.error" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-xs text-red-700">
              {{ store.error }}
            </div>

            <!-- Formulaire de création / édition de cohorte -->
            <form @submit.prevent="handleCohorteSubmit" class="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ isEditingCohorte ? 'Modifier la cohorte' : 'Nouvelle cohorte' }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500">Nom</label>
                  <input type="text" v-model="currentCohorte.nom" required class="input-field mt-1" placeholder="Ex: Promotion 2026" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500">Date de début</label>
                  <input type="date" v-model="currentCohorte.dateDebut" class="input-field mt-1" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500">Date de fin</label>
                  <input type="date" v-model="currentCohorte.dateFin" class="input-field mt-1" />
                </div>
              </div>
              <div class="flex justify-end space-x-2">
                <button type="button" v-if="isEditingCohorte" @click="prepareCreateCohorte" class="btn-secondary text-xs px-3 py-1.5">
                  Annuler l'édition
                </button>
                <button type="submit" :disabled="store.loading" class="btn-primary text-xs px-3 py-1.5">
                  <Loader2 v-if="store.loading" class="w-3 h-3 mr-1 animate-spin" />
                  {{ isEditingCohorte ? 'Mettre à jour' : 'Ajouter la cohorte' }}
                </button>
              </div>
            </form>

            <!-- Liste des cohortes -->
            <div class="overflow-hidden border border-gray-200 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="cohorte in store.cohortes" :key="cohorte.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ cohorte.nom }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">
                      {{ formatDate(cohorte.dateDebut) }} - {{ formatDate(cohorte.dateFin) }}
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-medium space-x-2">
                      <button @click="openEditCohorte(cohorte)" class="text-blue-600 hover:text-blue-900 p-1" title="Modifier">
                        <Edit2 class="w-4 h-4 inline" />
                      </button>
                      <button @click="confirmDeleteCohorte(cohorte.id)" class="text-red-600 hover:text-red-900 p-1" title="Supprimer">
                        <Trash2 class="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="store.cohortes.length === 0 && !store.loading">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-500">Aucune cohorte pour cette formation.</td>
                  </tr>
                  <tr v-if="store.loading && store.cohortes.length === 0">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-500">
                      <Loader2 class="w-5 h-5 mx-auto animate-spin text-primary-600" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modale de Suppression Cohorte -->
    <div
      v-if="showDeleteCohorteModal"
      class="fixed inset-0 z-[60] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDeleteCohorteModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle class="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Supprimer la cohorte
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer cette cohorte ? Cette action supprimera également les campagnes associées.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="handleDeleteCohorte" :disabled="store.loading" class="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              <Loader2 v-if="store.loading" class="w-4 h-4 mr-2 animate-spin" />
              Supprimer
            </button>
            <button type="button" @click="showDeleteCohorteModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
