<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import TestsFilterBar from '@/components/tests/TestsFilterBar.vue'
import TestsTable from '@/components/tests/TestsTable.vue'
import CreateTestModal from '@/components/tests/CreateTestModal.vue'
import PublishTestModal from '@/components/tests/PublishTestModal.vue'
import TestDetailModal from '@/components/tests/TestDetailModal.vue'
import testService from '@/services/testService'


// --- Données ---------------------------------------------------------
const tests = ref([])
const formations = ref([]) 

onMounted(async () => {
  try {
    const response = await testService.obtenirTests()
    // Utilisation directe des données backend sans mapping artificiel
    tests.value = response.data
  } catch (error) {
    console.error("Erreur lors du chargement des tests depuis l'API :", error)
    notify('Erreur', '', 'Impossible de charger la liste des tests.')
  }
})

// --- Filtres / recherche ---------------------------------------------
const search = ref('')
const formationFilter = ref('')
const statusFilter = ref('')

const filteredTests = computed(() => {
  return tests.value.filter((t) => {
    const nomTest = t.nom || t.name || ''
    const matchSearch = nomTest.toLowerCase().includes(search.value.toLowerCase())
    const matchFormation = !formationFilter.value || t.campagne_assossiee === formationFilter.value
    const matchStatus = !statusFilter.value || (t.statut || '').toLowerCase() === statusFilter.value.toLowerCase()
    return matchSearch && matchFormation && matchStatus
  })
})

// --- Pagination ------------------------------------------------------
const currentPage = ref(1)
const totalPages = ref(1)

// --- Bannière d'information ------------------------------------------
const alert = reactive({ prefix: '', highlight: '', suffix: '' })
const showAlert = ref(false)

const notify = (prefix, highlight, suffix) => {
  alert.prefix = prefix
  alert.highlight = highlight
  alert.suffix = suffix
  showAlert.value = true
}

// --- Modale de Création / Modification ------------------------------
const isCreateModalOpen = ref(false)
const isEditMode = ref(false)
const testToEdit = ref(null)

const openCreateModal = () => {
  isEditMode.value = false
  testToEdit.value = null
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
  isEditMode.value = false
  testToEdit.value = null
}

// Action au clic sur le bouton Modifier
const handleEdit = (test) => {
  if (!test || !test.id) return
  testToEdit.value = { ...test }
  isEditMode.value = true
  isCreateModalOpen.value = true
}

// Soumission unifiée (Création ou Édition)
const handleSubmitTest = async (formDataFromModal) => {
  try {
    const formData = new FormData()
    formData.append('nom', formDataFromModal.nom)
    formData.append('campagne_assossiee', formDataFromModal.campagne_assossiee || '')
    formData.append('lien_ressource', formDataFromModal.lien_ressource || '')
    formData.append('description', formDataFromModal.description || '')
    formData.append('date_ouverture', formDataFromModal.date_ouverture || '')
    formData.append('date_cloture', formDataFromModal.date_cloture || '')

    if (formDataFromModal.fichier_ressource instanceof File) {
      formData.append('fichier_ressource', formDataFromModal.fichier_ressource)
    }

    if (isEditMode.value && testToEdit.value) {
      // --- ACTION MODIFIER ---
      const response = await testService.modifierTest(testToEdit.value.id, formData)
      
      const index = tests.value.findIndex(t => t.id === testToEdit.value.id)
      if (index !== -1) {
        tests.value[index] = response.data
      }
      notify('Le test', formDataFromModal.nom, 'a été modifié avec succès.')
    } else {
      // --- ACTION CRÉER ---
      const response = await testService.creerTest(formData)
      tests.value.unshift(response.data)
      notify('Le test', formDataFromModal.nom, 'a été créé avec succès.')
    }

    closeCreateModal()
  } catch (error) {
    console.error("Détail de l'erreur Django :", error.response?.data || error)
    notify('Erreur', '', 'Erreur lors de l\'enregistrement du test.')
  }
}

const handleCreateAndPublish = async (formDataFromModal) => {
  try {
    await handleSubmitTest(formDataFromModal)
    if (tests.value.length > 0) {
      openPublishModal(tests.value[0])
    }
  } catch (error) {
    console.error("Erreur lors de la création/publication :", error)
  }
}

// --- Modale de détail ------------------------------------------------
const viewingTest = ref(null)
const isDetailModalOpen = ref(false)

const openDetailModal = (test) => {
  viewingTest.value = test
  isDetailModalOpen.value = true
}
const closeDetailModal = () => (isDetailModalOpen.value = false)

// --- Modale de publication -------------------------------------------
const publishingTest = ref(null)
const isPublishModalOpen = ref(false)

const candidatesForPublish = computed(() => {
  if (!publishingTest.value) return []
  return [] 
})

const openPublishModal = (test) => {
  publishingTest.value = test
  isPublishModalOpen.value = true
}
const closePublishModal = () => (isPublishModalOpen.value = false)

const handleConfirmPublish = async ({ candidateIds }) => {
  try {
    if (!publishingTest.value) return

    await testService.publierTest(publishingTest.value.id, {
      candidats_ids: candidateIds
    })

    const test = tests.value.find((t) => t.id === publishingTest.value.id)
    if (test) {
      test.statut = 'ACTIF'
    }

    closePublishModal()
    notify(
      'Le test',
      publishingTest.value.nom || publishingTest.value.name,
      `a été publié avec succès.`
    )
  } catch (error) {
    console.error("Erreur lors de la publication :", error)
    notify('Erreur', '', "Erreur lors de la publication du test.")
  }
}

// --- Suppression & Téléchargement ------------------------------------
const handleDelete = async (test) => {
  if (confirm("Voulez-vous vraiment supprimer ce test ?")) {
    try {
      await testService.supprimerTest(test.id)
      tests.value = tests.value.filter((t) => t.id !== test.id)
      notify('Le test', '', 'a été supprimé avec succès.')
    } catch (error) {
      console.error("Erreur lors de la suppression :", error)
    }
  }
}

const handleDownload = async (test) => {
  try {
    const response = await testService.telechargerPdf(test.id)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `test_${test.id}.pdf`
    link.click()
    window.URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF :", error)
    notify('Erreur', '', 'Impossible de télécharger le PDF.')
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-xl font-semibold text-gray-900">Gestion des Tests</h2>
        <BaseButton variant="primary" @click="openCreateModal">
          <AppIcon name="plus" :size="16" />
          Créer un test
        </BaseButton>
      </div>
    </template>

    <main class="tests-view__body">
      <TestsFilterBar
        v-model:search="search"
        v-model:formationFilter="formationFilter"
        v-model:statusFilter="statusFilter"
        :formations="formations"
      />

      <AlertBanner
        v-if="showAlert"
        :prefix="alert.prefix"
        :highlight="alert.highlight"
        :suffix="alert.suffix"
        @close="showAlert = false"
      />

      <TestsTable
        :tests="filteredTests"
        @view="openDetailModal"
        @edit="handleEdit"
        @delete="handleDelete"
        @download="handleDownload"
        @publish="openPublishModal"
      />

      <BasePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="currentPage = $event"
      />
    </main>

    <CreateTestModal
      v-if="isCreateModalOpen"
      :formations="formations"
      :initialData="testToEdit"
      :isEditMode="isEditMode"
      @close="closeCreateModal"
      @submit="handleSubmitTest"
      @publish="handleCreateAndPublish"
    />

    <TestDetailModal
      v-if="isDetailModalOpen && viewingTest"
      :test="viewingTest"
      @close="closeDetailModal"
    />

    <PublishTestModal
      v-if="isPublishModalOpen && publishingTest"
      :test="publishingTest"
      :candidates="candidatesForPublish"
      @close="closePublishModal"
      @confirm="handleConfirmPublish"
    />
  </DashboardLayout>
</template>

<style scoped>
.tests-view {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tests-view__body {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>