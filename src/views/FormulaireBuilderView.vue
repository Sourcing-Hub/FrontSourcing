<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormulairesStore } from '../stores/formulaires'
import { useModalStore } from '../stores/modal'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import {
  ArrowLeft,
  Plus,
  Settings,
  Trash2,
  GripVertical,
  Check,
  X,
  Type,
  Mail,
  Phone,
  Calendar,
  Hash,
  List,
  CheckSquare,
  AlignLeft,
  FileUp,
  Save,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useFormulairesStore()
const modalStore = useModalStore()
const formulaireId = route.params.id

const activeField = ref(null)
const saving = ref(false)

const fieldTypes = [
  { value: 'TEXTE', label: 'Texte court', icon: Type },
  { value: 'ZONE_TEXTE', label: 'Paragraphe', icon: AlignLeft },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'TELEPHONE', label: 'Téléphone', icon: Phone },
  { value: 'DATE', label: 'Date', icon: Calendar },
  { value: 'NOMBRE', label: 'Nombre', icon: Hash },
  { value: 'LISTE_DEROULANTE', label: 'Liste déroulante', icon: List },
  { value: 'CHOIX_MULTIPLES', label: 'Choix multiples', icon: CheckSquare },
  { value: 'CASE_A_COCHER', label: 'Cases à cocher', icon: CheckSquare },
  { value: 'FICHIER', label: 'Fichier / CV', icon: FileUp },
]

onMounted(async () => {
  await store.fetchFormulaireById(formulaireId)
})

const form = computed(() => store.currentFormulaire)

// --- Actions Champs ---

const addField = async (type) => {
  const newField = {
    libelle: `Nouveau champ ${fieldTypes.find((t) => t.value === type).label}`,
    type: type,
    obligatoire: true,
    description: '',
    options: ['LISTE_DEROULANTE', 'CHOIX_MULTIPLES', 'CASE_A_COCHER'].includes(type)
      ? [
          { libelle: 'Option 1', ordre: 0 },
          { libelle: 'Option 2', ordre: 1 },
        ]
      : [],
  }
  const created = await store.addChamp(formulaireId, newField)
  if (created) {
    activeField.value = created
  }
}

const deleteField = async (champId) => {
  const confirmed = await modalStore.showConfirm(
    'Êtes-vous sûr de vouloir supprimer ce champ ?',
    'Supprimer la question',
    { confirmText: 'Supprimer', variant: 'danger' }
  )
  if (confirmed) {
    await store.deleteChamp(champId)
    if (activeField.value?.id === champId) activeField.value = null
  }
}

const saveActiveField = async () => {
  if (!activeField.value) return
  saving.value = true
  await store.updateChamp(activeField.value.id, activeField.value)
  saving.value = false
  activeField.value = null // Désélectionne après sauvegarde
}

// --- Options (pour listes/choix) ---
const addOption = () => {
  if (activeField.value) {
    const ordre = activeField.value.options?.length || 0
    activeField.value.options.push({ libelle: `Option ${ordre + 1}`, ordre })
  }
}
const removeOption = (index) => {
  if (activeField.value) {
    activeField.value.options.splice(index, 1)
  }
}

// --- Drag & Drop ---
const onDragEnd = async (evt) => {
  if (!form.value) return
  // Les champs dans l'UI ont été réordonnés par le v-model de draggable
  // On récupère les IDs dans le nouvel ordre
  const orderedIds = form.value.champs.map((c) => c.id)
  await store.reorderChamps(formulaireId, orderedIds)
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center w-full">
        <button
          @click="router.push('/formulaires')"
          class="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-900">{{ form?.titre || 'Chargement...' }}</h2>
          <p class="text-sm text-gray-500">Constructeur de formulaire</p>
        </div>
      </div>
    </template>

    <div class="flex h-[calc(100vh-8rem)] gap-6" v-if="form">
      <!-- Zone de construction principale -->
      <div
        class="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <!-- Toolbar Ajout de champs -->
        <div
          class="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 overflow-x-auto no-scrollbar"
        >
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2"
            >Ajouter :</span
          >
          <button
            v-for="ft in fieldTypes"
            :key="ft.value"
            @click="addField(ft.value)"
            class="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors whitespace-nowrap"
          >
            <component :is="ft.icon" class="w-4 h-4 mr-1.5" />
            {{ ft.label }}
          </button>
        </div>

        <!-- Canvas (Liste des champs) -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div
            v-if="form.champs.length === 0"
            class="h-full flex flex-col items-center justify-center text-gray-400"
          >
            <List class="w-12 h-12 mb-3 text-gray-300" />
            <p>Ce formulaire est vide. Ajoutez des champs via la barre d'outils.</p>
          </div>

          <draggable
            v-model="form.champs"
            handle=".drag-handle"
            @end="onDragEnd"
            class="space-y-4 max-w-3xl mx-auto pb-20"
            item-key="id"
          >
            <template #item="{ element }">
              <div
                class="bg-white rounded-xl border p-5 relative transition-all group cursor-pointer"
                :class="activeField?.id === element.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'"
                @click="activeField = element"
              >
                <!-- Drag Handle -->
                <div
                  class="absolute top-0 left-0 bottom-0 w-8 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity drag-handle"
                >
                  <GripVertical class="w-5 h-5 text-gray-400" />
                </div>

                <div class="ml-6">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900 flex items-center">
                      {{ element.libelle }}
                      <span v-if="element.obligatoire" class="text-red-500 ml-1">*</span>
                    </h4>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{{
                      fieldTypes.find((t) => t.value === element.type)?.label
                    }}</span>
                  </div>
                  <p v-if="element.description" class="text-xs text-gray-500 mb-3">
                    {{ element.description }}
                  </p>

                  <!-- Fake Input preview -->
                  <div class="opacity-70 pointer-events-none mt-2">
                    <input
                      v-if="
                        ['TEXTE', 'EMAIL', 'TELEPHONE', 'DATE', 'NOMBRE'].includes(element.type)
                      "
                      type="text"
                      class="input-field py-1.5 bg-gray-50"
                      :placeholder="element.placeholderTexte || '...'"
                    />
                    <textarea
                      v-if="element.type === 'ZONE_TEXTE'"
                      rows="2"
                      class="input-field py-1.5 bg-gray-50"
                    ></textarea>
                    <div
                      v-if="element.type === 'LISTE_DEROULANTE'"
                      class="input-field py-1.5 bg-gray-50 flex items-center justify-between"
                    >
                      <span class="text-gray-400">Sélectionner...</span>
                    </div>
                    <div
                      v-if="
                        element.options?.length &&
                        ['CHOIX_MULTIPLES', 'CASE_A_COCHER'].includes(element.type)
                      "
                      class="space-y-2 mt-2"
                    >
                      <div
                        v-for="opt in element.options"
                        :key="opt.id"
                        class="flex items-center text-sm text-gray-600"
                      >
                        <div class="w-4 h-4 border border-gray-300 rounded-sm mr-2"></div>
                        {{ opt.libelle }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Delete Button -->
                <button
                  @click.stop="deleteField(element.id)"
                  class="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Panneau latéral : Propriétés du champ actif -->
      <div
        class="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden"
      >
        <div class="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 class="font-medium text-gray-900 flex items-center">
            <Settings class="w-4 h-4 mr-2 text-gray-500" /> Paramètres du champ
          </h3>
          <button
            v-if="activeField"
            @click="activeField = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 flex-1 overflow-y-auto" v-if="activeField">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Libellé</label>
              <input type="text" v-model="activeField.libelle" class="input-field mt-1" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Texte d'aide (Description)</label
              >
              <textarea
                v-model="activeField.description"
                rows="2"
                class="input-field mt-1 text-sm"
              ></textarea>
            </div>

            <div v-if="['TEXTE', 'EMAIL', 'TELEPHONE', 'NOMBRE'].includes(activeField.type)">
              <label class="block text-sm font-medium text-gray-700">Placeholder</label>
              <input type="text" v-model="activeField.placeholderTexte" class="input-field mt-1" />
            </div>

            <div class="flex items-center mt-4">
              <input
                type="checkbox"
                v-model="activeField.obligatoire"
                id="obl"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="obl" class="ml-2 block text-sm text-gray-900">Champ obligatoire</label>
            </div>

            <!-- Paramètres pour fichiers -->
            <template v-if="activeField.type === 'FICHIER'">
              <hr class="border-gray-100 my-4" />
              <div>
                <label class="block text-sm font-medium text-gray-700">Extensions autorisées</label>
                <input
                  type="text"
                  v-model="activeField.typesMimeAutorises"
                  class="input-field mt-1"
                  placeholder=".pdf,.docx"
                />
              </div>
              <div class="mt-2">
                <label class="block text-sm font-medium text-gray-700">Taille max (Mo)</label>
                <input type="number" v-model="activeField.tailleMaxMo" class="input-field mt-1" />
              </div>
            </template>

            <!-- Gestion des Options -->
            <template
              v-if="
                ['LISTE_DEROULANTE', 'CHOIX_MULTIPLES', 'CASE_A_COCHER'].includes(activeField.type)
              "
            >
              <hr class="border-gray-100 my-4" />
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Options</label>
                <button
                  @click="addOption"
                  class="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center"
                >
                  <Plus class="w-3 h-3 mr-1" /> Ajouter
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(opt, idx) in activeField.options"
                  :key="idx"
                  class="flex items-center gap-2"
                >
                  <input
                    type="text"
                    v-model="opt.libelle"
                    class="input-field py-1 text-sm flex-1"
                  />
                  <button @click="removeOption(idx)" class="text-gray-400 hover:text-red-500 p-1">
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <p v-if="!activeField.options?.length" class="text-xs text-red-500">
                  Au moins une option est requise.
                </p>
              </div>
            </template>
          </div>
        </div>
        <div v-else class="p-6 text-center text-gray-400">
          <p class="text-sm">Cliquez sur un champ pour modifier ses paramètres.</p>
        </div>

        <div class="p-4 border-t border-gray-100 bg-gray-50" v-if="activeField">
          <button @click="saveActiveField" :disabled="saving" class="btn-primary w-full">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            <Save v-else class="w-4 h-4 mr-2" />
            Sauvegarder le champ
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
