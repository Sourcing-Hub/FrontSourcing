<script setup>
import { computed, onMounted, ref } from 'vue'
import { Loader2, Search, UserRound } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { fetchInterviewCandidates } from '../services/questionnaires'
import { parseBackendError } from '../utils/errorHandler'

const router = useRouter()

const candidates = ref([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')

const filteredCandidates = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase('fr')

  return candidates.value.filter((candidate) => {
    const content = [
      candidate.nom,
      candidate.prenom,
      candidate.nomFamille,
      candidate.numero,
      candidate.email,
      candidate.formation,
      candidate.cohorte,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('fr')

    return !query || content.includes(query)
  })
})

const stats = computed(() => ({
  total: candidates.value.length,
  evaluables: candidates.value.filter((candidate) => candidate.canDecide).length,
  admis: candidates.value.filter((candidate) => candidate.decision?.type === 'ADMIS').length,
  refuses: candidates.value.filter((candidate) => candidate.decision?.type === 'REFUSE').length,
}))

function formatScore(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return Number(value).toFixed(2)
}

function decisionLabel(decision) {
  const labels = {
    ADMIS: 'Admis',
    REFUSE: 'Refusé',
    EN_ATTENTE: 'En attente',
  }

  return labels[decision?.type] || 'Sans décision'
}

function openCandidate(candidate) {
  router.push({
    name: 'entretiens-candidat-detail',
    params: {
      candidatureId: candidate.candidatureId || candidate.id,
    },
  })
}

async function loadCandidates() {
  loading.value = true
  error.value = ''

  try {
    candidates.value = await fetchInterviewCandidates()
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadCandidates)
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Candidats en entretien</h2>
        <p class="text-sm text-slate-500">Suivez les moyennes des entretiens et préparez les décisions pédagogiques.</p>
      </div>
    </template>

    <div v-if="error" class="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </div>

    <section class="mb-6 grid gap-4 md:grid-cols-4">
      <article class="stat-card bg-[#00313C]"><span>Total</span><strong>{{ stats.total }}</strong></article>
      <article class="stat-card"><span>Décision possible</span><strong>{{ stats.evaluables }}</strong></article>
      <article class="stat-card"><span>Admis</span><strong>{{ stats.admis }}</strong></article>
      <article class="stat-card"><span>Refusés</span><strong>{{ stats.refuses }}</strong></article>
    </section>

    <section class="mb-6 rounded-xl border border-slate-100 bg-white p-4">
      <label class="relative block">
        <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input v-model="searchTerm" class="input-field pl-9" placeholder="Rechercher un candidat..." />
      </label>
    </section>

    <div v-if="loading" class="flex h-56 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="candidate in filteredCandidates"
        :key="candidate.id"
        class="rounded-xl border border-slate-100 bg-white p-5 transition hover:-translate-y-0.5"
      >
        <div class="flex items-start gap-4">
          <div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#00313C] text-white">
            <UserRound class="h-6 w-6" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-base font-black text-[#00313C]">{{ candidate.nom || 'Candidat sans nom' }}</h3>
            <p class="mt-1 truncate text-sm text-slate-500">{{ candidate.email }}</p>
            <p class="mt-1 text-xs font-semibold text-slate-400">{{ candidate.numero }}</p>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-slate-50 p-3">
            <span class="text-xs font-bold uppercase text-slate-400">Formation</span>
            <p class="mt-1 truncate text-sm font-bold text-[#00313C]">{{ candidate.formation || '-' }}</p>
          </div>

          <div class="rounded-lg bg-slate-50 p-3">
            <span class="text-xs font-bold uppercase text-slate-400">Moyenne générale</span>
            <p class="mt-1 text-sm font-black text-[#00313C]">{{ formatScore(candidate.moyenneGenerale) }}</p>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-between gap-3">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {{ decisionLabel(candidate.decision) }}
          </span>

          <button
            type="button"
            class="rounded-lg bg-[#00313C] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#E40046]"
            @click="openCandidate(candidate)"
          >
            Voir plus
          </button>
        </div>
      </article>
    </section>

    <p v-if="!loading && !filteredCandidates.length" class="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
      Aucun candidat ne correspond à la recherche.
    </p>
  </DashboardLayout>
</template>

<style scoped>
.stat-card { @apply rounded-xl border border-slate-100 bg-white p-5 shadow-sm; }
.stat-card span { @apply text-xs font-bold uppercase tracking-wide text-slate-500; }
.stat-card strong { @apply mt-2 block text-3xl font-black text-[#00313C]; }
</style>
