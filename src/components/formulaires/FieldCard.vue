<script setup>
import { computed } from 'vue'
import {
  GripVertical,
  Trash2,
  Copy,
  Plus,
  X,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Calendar,
  Hash,
  Upload,
} from 'lucide-vue-next'

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'click',
  'update',
  'delete',
  'duplicate',
  'add-option',
  'update-option',
  'delete-option',
])

const fieldTypes = [
  { value: 'TEXTE', label: 'Réponse courte', icon: Type },
  { value: 'ZONE_TEXTE', label: 'Paragraphe', icon: AlignLeft },
  { value: 'CHOIX_MULTIPLES', label: 'Choix multiples', icon: CircleDot },
  { value: 'CASE_A_COCHER', label: 'Cases à cocher', icon: CheckSquare },
  { value: 'LISTE_DEROULANTE', label: 'Liste déroulante', icon: ChevronDown },
  { value: 'FICHIER', label: 'Importer un fichier', icon: Upload },
  { value: 'DATE', label: 'Date', icon: Calendar },
  { value: 'NOMBRE', label: 'Nombre', icon: Hash },
]

const hasOptions = computed(() => {
  return ['CHOIX_MULTIPLES', 'CASE_A_COCHER', 'LISTE_DEROULANTE'].includes(props.field.type)
})

const currentTypeIcon = computed(() => {
  const typeObj = fieldTypes.find((t) => t.value === props.field.type)
  return typeObj ? typeObj.icon : Type
})

const updateField = (key, value) => {
  emit('update', { ...props.field, [key]: value })
}
</script>

<template>
  <div
    class="relative bg-white rounded-lg transition-shadow duration-200"
    :class="[
      isActive ? 'shadow-md border-l-4 border-l-primary-500 border-t border-r border-b border-gray-200' : 'shadow-sm border border-gray-200 hover:shadow-md cursor-pointer',
    ]"
    @click="!isActive && emit('click')"
  >
    <!-- Handle de drag (visible au survol ou si actif) -->
    <div class="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 hover:opacity-100 cursor-move transition-opacity" :class="{ 'opacity-20': isActive }">
      <GripVertical class="w-4 h-4 text-gray-400" />
    </div>

    <div class="p-6 ml-4">
      <!-- MODE ÉDITION -->
      <template v-if="isActive">
        <div class="flex flex-col sm:flex-row gap-4 mb-4">
          <!-- Titre du champ -->
          <div class="flex-grow">
            <input
              type="text"
              :value="field.libelle"
              @input="updateField('libelle', $event.target.value)"
              placeholder="Question"
              class="w-full bg-gray-50 border-b-2 border-transparent hover:border-gray-300 focus:border-primary-500 focus:bg-white focus:outline-none transition-colors p-3 text-base font-medium rounded-t-md"
            />
          </div>

          <!-- Type de champ -->
          <div class="w-full sm:w-64">
            <div class="relative">
              <select
                :value="field.type"
                @change="updateField('type', $event.target.value)"
                class="w-full appearance-none bg-white border border-gray-300 rounded-md py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium"
              >
                <option v-for="t in fieldTypes" :key="t.value" :value="t.value">
                  {{ t.label }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <component :is="currentTypeIcon" class="w-4 h-4 text-gray-500" />
              </div>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- Rendu dynamique selon le type (Mode Édition) -->
        <div class="mb-6 pl-3">
          <div v-if="field.type === 'TEXTE'" class="text-sm text-gray-400 border-b border-dotted border-gray-300 w-1/2 pb-1">
            Texte d'une ligne
          </div>
          
          <div v-else-if="field.type === 'ZONE_TEXTE'" class="text-sm text-gray-400 border-b border-dotted border-gray-300 w-3/4 pb-1">
            Texte long
          </div>

          <!-- Options pour choix multiples, cases, liste -->
          <div v-else-if="hasOptions" class="space-y-3">
            <div v-for="(opt, idx) in field.options || []" :key="opt.id || idx" class="flex items-center group">
              <!-- Icône décorative selon le type -->
              <CircleDot v-if="field.type === 'CHOIX_MULTIPLES'" class="w-4 h-4 text-gray-300 mr-3" />
              <CheckSquare v-else-if="field.type === 'CASE_A_COCHER'" class="w-4 h-4 text-gray-300 mr-3" />
              <span v-else class="text-sm text-gray-400 mr-3 w-4 text-right">{{ idx + 1 }}.</span>

              <input
                type="text"
                :value="opt.libelle"
                @change="emit('update-option', opt.id, { ...opt, libelle: $event.target.value })"
                class="flex-grow bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none transition-colors text-sm py-1"
                placeholder="Option"
              />
              <button
                @click="emit('delete-option', opt.id)"
                class="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            
            <div class="flex items-center mt-2">
              <CircleDot v-if="field.type === 'CHOIX_MULTIPLES'" class="w-4 h-4 text-gray-300 mr-3" />
              <CheckSquare v-else-if="field.type === 'CASE_A_COCHER'" class="w-4 h-4 text-gray-300 mr-3" />
              <span v-else class="text-sm text-gray-400 mr-3 w-4 text-right">{{ (field.options?.length || 0) + 1 }}.</span>
              
              <button
                @click="emit('add-option', field.id)"
                class="text-sm text-gray-500 hover:text-gray-800 hover:underline border-b border-transparent py-1"
              >
                Ajouter une option
              </button>
            </div>
          </div>
        </div>

        <!-- Footer (Actions) -->
        <div class="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <button @click="emit('duplicate')" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Dupliquer">
            <Copy class="w-5 h-5" />
          </button>
          <button @click="emit('delete')" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Supprimer">
            <Trash2 class="w-5 h-5" />
          </button>
          <div class="w-px h-6 bg-gray-200"></div>
          <div class="flex items-center">
            <span class="mr-2 text-sm text-gray-700">Obligatoire</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="field.obligatoire"
                @change="updateField('obligatoire', $event.target.checked)"
                class="sr-only peer"
              >
              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </template>

      <!-- MODE VUE (Inactif) -->
      <template v-else>
        <div class="mb-4">
          <h3 class="text-base text-gray-900 font-medium">
            {{ field.libelle || 'Question sans titre' }}
            <span v-if="field.obligatoire" class="text-red-500 ml-1">*</span>
          </h3>
        </div>

        <div>
          <!-- Représentation visuelle non interactive -->
          <div v-if="field.type === 'TEXTE'" class="border-b border-dotted border-gray-400 w-1/2 pb-2 text-sm text-gray-400">
            Votre réponse
          </div>
          
          <div v-else-if="field.type === 'ZONE_TEXTE'" class="border-b border-dotted border-gray-400 w-3/4 pb-2 text-sm text-gray-400">
            Votre réponse
          </div>

          <div v-else-if="hasOptions" class="space-y-2">
            <div v-for="opt in (field.options || [])" :key="opt.id" class="flex items-center">
              <CircleDot v-if="field.type === 'CHOIX_MULTIPLES'" class="w-4 h-4 text-gray-300 mr-3" />
              <CheckSquare v-else-if="field.type === 'CASE_A_COCHER'" class="w-4 h-4 text-gray-300 mr-3" />
              <span v-else class="text-sm text-gray-400 mr-3 w-4 text-right">{{ (field.options?.indexOf(opt) || 0) + 1 }}.</span>
              <span class="text-sm text-gray-700">{{ opt.libelle }}</span>
            </div>
            <div v-if="!field.options || field.options.length === 0" class="text-sm text-gray-400 italic">
              Aucune option
            </div>
          </div>
          
          <div v-else-if="field.type === 'DATE'" class="flex items-center border-b border-dotted border-gray-400 w-48 pb-2 text-sm text-gray-400">
            <Calendar class="w-4 h-4 mr-2" />
            jj/mm/aaaa
          </div>
          
          <div v-else-if="field.type === 'FICHIER'" class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md w-48 py-4 text-sm text-gray-400">
            <Upload class="w-4 h-4 mr-2" />
            Ajouter un fichier
          </div>
          
          <div v-else-if="field.type === 'NOMBRE'" class="border-b border-dotted border-gray-400 w-32 pb-2 text-sm text-gray-400">
            123...
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
