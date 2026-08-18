<script setup>
/**
 * Éditeur dynamique de formulaires : gestion des champs, types, règles et glisser-déposer.
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormulairesStore } from '../stores/formulaires'
import { useCampagnesStore } from '../stores/campagnes'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import FieldCard from '../components/formulaires/FieldCard.vue'
import { Plus, ArrowLeft, Loader2, Save, Eye } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useFormulairesStore()
const campagnesStore = useCampagnesStore()

const formId = route.params.id
const activeFieldId = ref(null)

const isSaving = ref(false)

onMounted(async () => {
  await campagnesStore.fetchCampagnes()
  await store.fetchFormulaire(formId)
  if (!store.currentFormulaire) {
    router.push('/formulaires')
  }
})

const formulaire = computed(() => store.currentFormulaire)
const champs = computed(() => store.currentFormulaire?.champs || [])
const campagnesDisponibles = computed(() => 
  campagnesStore.campagnes.filter(c => !c.a_formulaire || c.id === formulaire.value?.campagne)
)

// --- Sauvegarde entête ---
let saveTimeout = null
const updateHeader = (key, value) => {
  if (store.currentFormulaire) {
    store.currentFormulaire[key] = value
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(async () => {
      isSaving.value = true
      await store.updateFormulaire(formId, { [key]: value })
      isSaving.value = false
    }, 1000)
  }
}

// --- Gestion des champs ---
const addField = async () => {
  isSaving.value = true
  const newField = await store.addField(formId, {
    libelle: 'Nouvelle question',
    type: 'TEXTE',
    obligatoire: false,
    ordre: champs.value.length
  })
  if (newField) {
    activeFieldId.value = newField.id
  }
  isSaving.value = false
}

let fieldSaveTimeouts = {}
const updateField = (updatedField) => {
  // Sync update locally first for reactivity
  if (store.currentFormulaire && store.currentFormulaire.champs) {
    const idx = store.currentFormulaire.champs.findIndex(c => c.id === updatedField.id)
    if (idx !== -1) {
      store.currentFormulaire.champs[idx] = updatedField
    }
  }

  // Debounce API call
  clearTimeout(fieldSaveTimeouts[updatedField.id])
  fieldSaveTimeouts[updatedField.id] = setTimeout(async () => {
    isSaving.value = true
    await store.updateField(updatedField.id, updatedField)
    isSaving.value = false
  }, 800)
}

const deleteField = async (fieldId) => {
  await store.deleteField(fieldId)
  if (activeFieldId.value === fieldId) {
    activeFieldId.value = null
  }
}

const duplicateField = async (field) => {
  isSaving.value = true
  const payload = {
    libelle: field.libelle,
    type: field.type,
    obligatoire: field.obligatoire,
    ordre: champs.value.length
  }
  
  if (field.options && field.options.length > 0) {
    payload.options = field.options.map(opt => ({
      libelle: opt.libelle,
      valeur: opt.valeur
    }))
  }

  const newField = await store.addField(formId, payload)
  
  if (newField) {
    activeFieldId.value = newField.id
  }
  isSaving.value = false
}

// --- Gestion des options ---
const addOption = async (fieldId) => {
  await store.addOption(fieldId, { libelle: 'Option ' + ((champs.value.find(c => c.id === fieldId)?.options?.length || 0) + 1) })
}

let optionSaveTimeouts = {}
const updateOption = (optionId, optionData) => {
  // 1. Optimistic update (Synchrone)
  if (store.currentFormulaire && store.currentFormulaire.champs) {
    store.currentFormulaire.champs.forEach(field => {
      if (field.options) {
        const idx = field.options.findIndex(o => o.id === optionId)
        if (idx !== -1) {
          field.options[idx] = { ...field.options[idx], ...optionData }
        }
      }
    })
  }

  // 2. API Call (Debounce)
  clearTimeout(optionSaveTimeouts[optionId])
  optionSaveTimeouts[optionId] = setTimeout(async () => {
    isSaving.value = true
    await store.updateOption(optionId, optionData)
    isSaving.value = false
  }, 800)
}

const deleteOption = async (optionId) => {
  await store.deleteOption(optionId)
}

const goBack = () => {
  router.push('/formulaires')
}
</script>

<template>
  <div class="min-h-screen bg-[#CE0033]/5 pb-20">
    <!-- En-tête de l'éditeur -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center">
          <button @click="goBack" class="p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Retour">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">{{ formulaire?.titre || 'Chargement...' }}</span>
            <span class="text-xs text-gray-500 flex items-center h-4">
              <template v-if="store.loading && !isSaving">Chargement...</template>
              <template v-else-if="isSaving">
                <Loader2 class="w-3 h-3 animate-spin mr-1" /> Enregistrement...
              </template>
              <template v-else>
                <Save class="w-3 h-3 mr-1" /> Enregistré
              </template>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="router.push(`/formulaires/${formId}/preview`)" 
            class="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
            title="Aperçu"
          >
            <Eye class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto mt-8 px-4 relative">
      <div v-if="!formulaire && store.loading" class="flex justify-center mt-20">
        <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
      </div>

      <div v-else-if="formulaire" class="space-y-6">
        <!-- Carte Titre et Description -->
        <div
          class="bg-white rounded-lg border-t-[8px] border-[#CE0033] p-6 cursor-text"
          @click="activeFieldId = 'header'"
          :class="activeFieldId === 'header' ? 'border-l-4 border-l-primary-500 border-r border-b border-gray-200' : 'border border-gray-200 transition-'"
        >
          <input
            type="text"
            :value="formulaire.titre"
            @input="updateHeader('titre', $event.target.value)"
            class="w-full text-3xl font-normal text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-[#CE0033] focus:outline-none transition-colors pb-1 mb-4"
            placeholder="Titre du formulaire"
          />
          <textarea
            :value="formulaire.description"
            @input="updateHeader('description', $event.target.value)"
            class="w-full text-sm text-gray-600 border-b border-transparent hover:border-gray-200 focus:border-[#CE0033] focus:outline-none transition-colors pb-1 resize-none overflow-hidden"
            placeholder="Description du formulaire"
            rows="1"
            oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
          ></textarea>
          
          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center">
            <label class="text-sm text-gray-700 mr-4 font-medium">Lié à la campagne :</label>
            <select
              :value="formulaire.campagne || ''"
              @change="updateHeader('campagne', $event.target.value || null)"
              class="border-b border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1 text-sm bg-transparent cursor-pointer"
            >
              <option value="">Aucune campagne</option>
              <option v-for="camp in campagnesDisponibles" :key="camp.id" :value="camp.id">
                {{ camp.nom }}
              </option>
            </select>
          </div>
        </div>

        <!-- Liste des Champs -->
        <FieldCard
          v-for="champ in champs"
          :key="champ.id"
          :field="champ"
          :isActive="activeFieldId === champ.id"
          @click="activeFieldId = champ.id"
          @update="updateField"
          @delete="deleteField(champ.id)"
          @duplicate="duplicateField(champ)"
          @add-option="addOption"
          @update-option="updateOption"
          @delete-option="deleteOption"
        />

        <!-- Floating Toolbar -->
        <div class="fixed top-32 right-[calc(50%-26rem)] hidden lg:flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden z-30">
          <button
            @click="addField"
            class="p-3 text-gray-500 hover:text-[#CE0033] hover:bg-gray-50 transition-colors"
            title="Ajouter une question"
          >
            <Plus class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Mobile Add Button -->
        <div class="lg:hidden fixed bottom-6 right-6 z-30">
          <button
            @click="addField"
            class="p-4 bg-[#CE0033] text-white rounded-full hover:bg-[#a8002a] transition-colors"
          >
            <Plus class="w-6 h-6" />
          </button>
        </div>

        <div v-if="champs.length === 0" class="text-center py-12 text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg">
          Ce formulaire est vide. Ajoutez une question pour commencer.
        </div>
      </div>
    </main>
  </div>
</template>
