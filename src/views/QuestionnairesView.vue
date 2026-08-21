<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Edit3, Loader2, Plus, Search, Trash2, X } from 'lucide-vue-next'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { useAuthStore } from '../stores/auth'
import { useCampagnesStore } from '../stores/campagnes'
import { useModalStore } from '../stores/modal'
import {
  createQuestion,
  deleteQuestion,
  fetchQuestions,
  updateQuestion,
} from '../services/questionnaires'
import { parseBackendError } from '../utils/errorHandler'

const authStore = useAuthStore()
const campagnesStore = useCampagnesStore()
const modalStore = useModalStore()

const questions = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showForm = ref(false)
const editingId = ref(null)
const selectedFormation = ref('')
const selectedCohorte = ref('')
const selectedType = ref('')
const searchTerm = ref('')

const emptyForm = () => ({
  cohorte: '',
  type: 'TECHNIQUE',
  question: '',
  maxScore: 5,
  ordre: 1,
})
const form = reactive(emptyForm())

const normalizeRole = (role = '') => role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const canManage = computed(() => ['administrateur', 'equipe pedagogique'].includes(normalizeRole(authStore.user?.role)))
const formations = computed(() => campagnesStore.formations)
const cohortes = computed(() =>
  campagnesStore.cohortes.filter((cohorte) => !selectedFormation.value || cohorte.formation === selectedFormation.value),
)
const formCohortes = computed(() => campagnesStore.cohortes)
const filteredQuestions = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase('fr')
  return questions.value.filter((question) => {
    const matchesFormation = !selectedFormation.value || question.formationNom === formations.value.find((item) => item.id === selectedFormation.value)?.nom
    const matchesCohorte = !selectedCohorte.value || question.cohorte === selectedCohorte.value
    const matchesType = !selectedType.value || question.type === selectedType.value
    const content = `${question.question} ${question.cohorteNom} ${question.formationNom}`.toLocaleLowerCase('fr')
    return matchesFormation && matchesCohorte && matchesType && (!query || content.includes(query))
  })
})
const stats = computed(() => ({
  total: questions.value.length,
  technique: questions.value.filter((question) => question.type === 'TECHNIQUE').length,
  motivation: questions.value.filter((question) => question.type === 'SOFT_SKILLS_MOTIVATION').length,
  final: questions.value.filter((question) => question.type === 'FINAL').length,
}))

const typeOptions = [
  { value: 'TECHNIQUE', label: 'Technique' },
  { value: 'SOFT_SKILLS_MOTIVATION', label: 'Motivation / soft skills' },
  { value: 'FINAL', label: 'Entretien final' },
]
const typeLabel = (value) => typeOptions.find((type) => type.value === value)?.label || value

async function loadQuestions() {
  loading.value = true
  error.value = ''
  try {
    questions.value = await fetchQuestions()
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  form.cohorte = selectedCohorte.value || cohortes.value[0]?.id || ''
  form.ordre = questions.value.filter((question) => !form.cohorte || question.cohorte === form.cohorte).length + 1
  showForm.value = true
}

function openEdit(question) {
  editingId.value = question.id
  Object.assign(form, {
    cohorte: question.cohorte,
    type: question.type,
    question: question.question,
    maxScore: question.maxScore,
    ordre: question.ordre,
  })
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

async function saveQuestion() {
  saving.value = true
  error.value = ''
  const payload = {
    cohorte: form.cohorte,
    type: form.type,
    question: form.question,
    maxScore: Number(form.maxScore),
    ordre: Number(form.ordre),
  }
  try {
    if (editingId.value) {
      const saved = await updateQuestion(editingId.value, payload)
      const index = questions.value.findIndex((question) => question.id === saved.id)
      if (index !== -1) questions.value[index] = saved
    } else {
      questions.value.unshift(await createQuestion(payload))
    }
    closeForm()
    await modalStore.showAlert('Le questionnaire a été mis à jour.', 'Succès', 'success')
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    saving.value = false
  }
}

async function removeQuestion(question) {
  const confirmed = await modalStore.showConfirm(
    'Supprimer définitivement cette question du questionnaire ?',
    'Supprimer la question',
    { confirmText: 'Supprimer', variant: 'danger' },
  )
  if (!confirmed) return
  try {
    await deleteQuestion(question.id)
    questions.value = questions.value.filter((item) => item.id !== question.id)
  } catch (err) {
    error.value = parseBackendError(err)
  }
}

onMounted(async () => {
  await Promise.all([
    campagnesStore.fetchFormations(),
    campagnesStore.fetchCohortes(),
    loadQuestions(),
  ])
})
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex w-full items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Questionnaires</h2>
          <p class="text-sm text-slate-500">Questions utilisées pendant les entretiens technique, motivation et final.</p>
        </div>
        <button v-if="canManage" class="btn-primary" type="button" @click="openCreate">
          <Plus class="mr-2 h-4 w-4" /> Ajouter une question
        </button>
      </div>
    </template>

    <div v-if="error" class="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </div>

    <section class="mb-6 grid gap-4 md:grid-cols-4">
      <article class="stat-card"><span>Total</span><strong>{{ stats.total }}</strong></article>
      <article class="stat-card"><span>Technique</span><strong>{{ stats.technique }}</strong></article>
      <article class="stat-card"><span>Motivation</span><strong>{{ stats.motivation }}</strong></article>
      <article class="stat-card"><span>Final</span><strong>{{ stats.final }}</strong></article>
    </section>

    <section class="mb-6 rounded-xl border border-slate-100 bg-white p-4">
      <div class="grid gap-3 lg:grid-cols-[1fr_220px_220px_220px]">
        <label class="relative">
          <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input v-model="searchTerm" class="input-field pl-9" placeholder="Rechercher une question..." />
        </label>
        <select v-model="selectedFormation" class="input-field" @change="selectedCohorte = ''">
          <option value="">Toutes les formations</option>
          <option v-for="formation in formations" :key="formation.id" :value="formation.id">{{ formation.nom }}</option>
        </select>
        <select v-model="selectedCohorte" class="input-field">
          <option value="">Toutes les promotions</option>
          <option v-for="cohorte in cohortes" :key="cohorte.id" :value="cohorte.id">{{ cohorte.nom }}</option>
        </select>
        <select v-model="selectedType" class="input-field">
          <option value="">Tous les types</option>
          <option v-for="type in typeOptions" :key="type.value" :value="type.value">{{ type.label }}</option>
        </select>
      </div>
    </section>

    <div v-if="loading" class="flex h-56 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <section v-else class="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[840px] text-left">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-5 py-3">Question</th>
              <th class="px-5 py-3">Type</th>
              <th class="px-5 py-3">Formation / promo</th>
              <th class="px-5 py-3">Barème</th>
              <th class="px-5 py-3">Ordre</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="question in filteredQuestions" :key="question.id" class="text-sm text-[#00313C]">
              <td class="max-w-xl px-5 py-4 font-semibold">{{ question.question }}</td>
              <td class="px-5 py-4"><span class="badge">{{ typeLabel(question.type) }}</span></td>
              <td class="px-5 py-4 text-slate-600">{{ question.formationNom }}<br /><small>{{ question.cohorteNom }}</small></td>
              <td class="px-5 py-4 font-bold">{{ question.maxScore }}</td>
              <td class="px-5 py-4">{{ question.ordre }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button class="icon-button" type="button" title="Modifier" @click="openEdit(question)"><Edit3 class="h-4 w-4" /></button>
                  <button class="icon-button-danger" type="button" title="Supprimer" @click="removeQuestion(question)"><Trash2 class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredQuestions.length" class="px-5 py-12 text-center text-sm text-slate-500">
        Aucune question ne correspond aux filtres.
      </p>
    </section>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form class="w-full max-w-2xl rounded-xl bg-white p-5" @submit.prevent="saveQuestion">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-[#00313C]">{{ editingId ? 'Modifier la question' : 'Ajouter une question' }}</h3>
            <p class="text-sm text-slate-500">Définissez le type, l’ordre d’affichage et le barème.</p>
          </div>
          <button class="icon-button" type="button" title="Fermer" @click="closeForm"><X class="h-4 w-4" /></button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="field-label">Promotion
            <select v-model="form.cohorte" class="input-field" required>
              <option value="" disabled>Choisir une promotion</option>
              <option v-for="cohorte in formCohortes" :key="cohorte.id" :value="cohorte.id">
                {{ cohorte.nom }} - {{ cohorte.formation_nom }}
              </option>
            </select>
          </label>
          <label class="field-label">Type
            <select v-model="form.type" class="input-field" required>
              <option v-for="type in typeOptions" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </label>
          <label class="field-label">Barème
            <input v-model.number="form.maxScore" class="input-field" min="1" step="0.5" type="number" required />
          </label>
          <label class="field-label">Ordre
            <input v-model.number="form.ordre" class="input-field" min="1" type="number" required />
          </label>
          <label class="field-label md:col-span-2">Question
            <textarea v-model.trim="form.question" class="input-field min-h-32" required placeholder="Saisir la question..." />
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button class="btn-secondary" type="button" @click="closeForm">Annuler</button>
          <button class="btn-primary" type="submit" :disabled="saving">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" /> Enregistrer
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.stat-card { @apply rounded-xl border border-slate-100 bg-white p-5 shadow-sm; }
.stat-card span { @apply text-xs font-bold uppercase tracking-wide text-slate-500; }
.stat-card strong { @apply mt-2 block text-3xl font-black text-[#00313C]; }
.badge { @apply inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700; }
.icon-button { @apply inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#00313C]; }
.icon-button-danger { @apply inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600; }
.field-label { @apply text-xs font-bold uppercase tracking-wide text-[#00313C]; }
.field-label .input-field { @apply mt-1.5 text-sm normal-case tracking-normal; }
</style>
