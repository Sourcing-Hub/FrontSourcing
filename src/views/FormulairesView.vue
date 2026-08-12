<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFormulairesStore } from '../stores/formulaires'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Plus, FileText, Loader2, Trash2 } from 'lucide-vue-next'

const store = useFormulairesStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchFormulaires()
})

const createNewForm = async () => {
  try {
    const newForm = await store.createFormulaire({
      titre: 'Formulaire sans titre',
      description: '',
    })
    if (newForm) {
      router.push(`/formulaires/${newForm.id}/edit`)
    } else {
      alert("Erreur lors de la création : " + (store.error || "Erreur inconnue"))
    }
  } catch (err) {
    alert("Exception interceptée : " + err.message)
  }
}

const deleteForm = async (id) => {
  if (confirm('Voulez-vous vraiment supprimer ce formulaire ?')) {
    await store.deleteFormulaire(id)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-xl font-semibold text-gray-900">Formulaires</h2>
      </div>
    </template>

    <div class="mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Créer un formulaire</h3>
      <div class="flex gap-4">
        <!-- Carte "Nouveau formulaire" -->
        <button
          @click="createNewForm"
          class="flex flex-col items-center justify-center w-48 h-36 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-500 hover:shadow-md transition-all group"
        >
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-100 mb-3">
            <Plus v-if="!store.loading" class="w-6 h-6" />
            <Loader2 v-else class="w-6 h-6 animate-spin" />
          </div>
          <span class="text-sm font-medium text-gray-700">Vide</span>
        </button>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Formulaires récents</h3>

      <div v-if="store.loading && store.formulaires.length === 0" class="flex justify-center p-12">
        <Loader2 class="w-8 h-8 animate-spin text-primary-600" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="form in store.formulaires"
          :key="form.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
        >
          <!-- Aperçu / Image (simulé par un fond coloré pour ressembler à GForms) -->
          <div
            class="h-32 bg-[#CE0033]/10 flex items-center justify-center cursor-pointer"
            @click="router.push(`/formulaires/${form.id}/edit`)"
          >
            <FileText class="w-12 h-12 text-[#CE0033]/40" />
          </div>

          <div class="p-4 flex flex-col flex-grow bg-white">
            <h4
              class="text-sm font-medium text-gray-900 mb-1 truncate cursor-pointer hover:text-primary-600"
              @click="router.push(`/formulaires/${form.id}/edit`)"
              :title="form.titre"
            >
              {{ form.titre || 'Formulaire sans titre' }}
            </h4>
            <div class="flex items-center justify-between mt-auto pt-2">
              <span class="text-xs text-gray-500 flex items-center">
                <FileText class="w-3 h-3 mr-1" />
                Ouvert le {{ formatDate(form.dateCreation) }}
              </span>
              <button
                @click="deleteForm(form.id)"
                class="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Supprimer"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
