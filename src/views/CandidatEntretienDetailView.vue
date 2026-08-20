<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import {
  fetchInterviewCandidateDetail,
  saveCandidatureDecision,
} from '../services/questionnaires'
import { parseBackendError } from '../utils/errorHandler'

const route = useRoute()
const router = useRouter()

const candidate = ref(null)
const loading = ref(false)
const saving = ref('')
const error = ref('')

const decisionOptions = [
  { value: 'ADMIS', label: 'Admis', class: 'bg-emerald-600 hover:bg-emerald-700' },
  { value: 'REFUSE', label: 'Refuser', class: 'bg-red-600 hover:bg-red-700' },
  { value: 'EN_ATTENTE', label: 'Mettre en attente', class: 'bg-slate-700 hover:bg-slate-800' },
]

const canUseDecisionButtons = computed(() => Boolean(candidate.value?.canDecide))

function formatScore(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return Number(value).toFixed(2)
}

function statusLabel(value) {
  const labels = {
    completed: 'Terminé',
    progress: 'En cours',
    'En-attente': 'En attente',
  }

  return labels[value] || value || 'Non renseigné'
}

function decisionLabel(value) {
  const labels = {
    ADMIS: 'Admis',
    REFUSE: 'Refusé',
    EN_ATTENTE: 'En attente',
  }

  return labels[value] || 'Sans décision'
}

async function loadCandidate() {
  loading.value = true
  error.value = ''

  try {
    candidate.value = await fetchInterviewCandidateDetail(route.params.candidatureId)
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    loading.value = false
  }
}

async function chooseDecision(decision) {
  if (!canUseDecisionButtons.value) {
    return
  }

  saving.value = decision
  error.value = ''

  try {
    const response = await saveCandidatureDecision(candidate.value.candidatureId, {
      decision,
    })

    candidate.value.decision = response.decision
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    saving.value = ''
  }
}

onMounted(loadCandidate)
</script>

<template>
  <DashboardLayout>
    <template #header>
      <button
        type="button"
        class="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#00313C] transition hover:border-[#00313C]"
        @click="router.back()"
      >
        <ArrowLeft class="h-4 w-4" />
        Retour
      </button>

      <div>
        <h2 class="text-xl font-semibold text-gray-900">Détail du candidat</h2>
        <p class="text-sm text-slate-500">Moyennes d’entretien et décision pédagogique.</p>
      </div>
    </template>

    <div v-if="error" class="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="flex h-56 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <template v-else-if="candidate">
      <section class="mb-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-2xl font-black text-[#00313C]">{{ candidate.nom }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ candidate.email }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ candidate.formation }} · {{ candidate.cohorte }}</p>
          </div>

          <div class="rounded-xl bg-[#00313C] px-5 py-4 text-white">
            <span class="text-xs font-bold uppercase text-white/60">Moyenne générale</span>
            <strong class="mt-1 block text-3xl font-black">{{ formatScore(candidate.moyenneGenerale) }}</strong>
          </div>
        </div>
      </section>

      <section class="mb-6 grid gap-4 md:grid-cols-3">
        <article class="score-card">
          <span>Entretien technique</span>
          <strong>{{ formatScore(candidate.technique?.averageScore) }}</strong>
          <small>{{ statusLabel(candidate.technique?.status) }}</small>
        </article>

        <article class="score-card">
          <span>Entretien motivation</span>
          <strong>{{ formatScore(candidate.motivation?.averageScore) }}</strong>
          <small>{{ statusLabel(candidate.motivation?.status) }}</small>
        </article>

        <article class="score-card">
          <span>Décision actuelle</span>
          <strong class="text-xl">{{ decisionLabel(candidate.decision?.type) }}</strong>
          <small>{{ candidate.decision?.motif || 'Aucun motif' }}</small>
        </article>
      </section>

      <section class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-black text-[#00313C]">Décision pédagogique</h3>
            <p class="mt-1 text-sm text-slate-500">
              Les décisions sont disponibles après validation des deux entretiens.
            </p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
            v-for="option in decisionOptions"
            :key="option.value"
            type="button"
            :disabled="!canUseDecisionButtons || Boolean(saving)"
            class="rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            :class="option.class"
            @click="chooseDecision(option.value)"
          >
            <Loader2 v-if="saving === option.value" class="mr-2 inline h-4 w-4 animate-spin" />
            {{ option.label }}
          </button>
        </div>
      </section>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.score-card { @apply rounded-xl border border-slate-100 bg-white p-5 shadow-sm; }
.score-card span { @apply text-xs font-bold uppercase tracking-wide text-slate-500; }
.score-card strong { @apply mt-2 block text-3xl font-black text-[#00313C]; }
.score-card small { @apply mt-1 block text-sm font-semibold text-slate-500; }
</style>
