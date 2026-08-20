<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import { useRouter } from 'vue-router'

import CandidateInterviewCard from '@/components/evaluator/CandidateInterviewCard.vue'

import {
  fetchMyCandidates,
  fetchMyInterviews,
} from '@/services/evaluator'

const router = useRouter()

const candidates = ref([])
const interviews = ref([])
const loading = ref(true)
const error = ref('')

const filters = ref({
  search: '',
  campagne: 'Tous',
  type: 'Tous',
  status: 'Tous',
})

const candidateItemsPerPage = 5
const currentCandidatePage = ref(1)

const campaignOptions = computed(() => {
  const campaigns = new Map()

  ;[...interviews.value, ...candidates.value].forEach((item) => {
    const id = item.campagneId || item.campagneName
    const name = item.campagneName

    if (id && name) {
      campaigns.set(String(id), name)
    }
  })

  return Array.from(campaigns, ([id, name]) => ({
    id,
    name,
  }))
})

const filteredInterviews = computed(() => {
  const query = filters.value.search.trim().toLowerCase()

  return interviews.value.filter((interview) => {
    const searchable = [
      interview.candidateName,
      interview.candidateEmail,
      interview.CandidatEmail,
      interview.campagneName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch =
      !query ||
      searchable.includes(query)

    const matchesCampaign =
      filters.value.campagne === 'Tous' ||
      String(interview.campagneId || interview.campagneName) ===
        filters.value.campagne

    const matchesType =
      filters.value.type === 'Tous' ||
      interview.type === filters.value.type

    const matchesStatus =
      filters.value.status === 'Tous' ||
      interview.status === filters.value.status

    return (
      matchesSearch &&
      matchesCampaign &&
      matchesType &&
      matchesStatus
    )
  })
})

const filteredCandidates = computed(() => {
  const query = filters.value.search.trim().toLowerCase()

  return candidates.value.filter((candidate) => {
    const relatedInterviews = interviews.value.filter(
      (interview) => interview.candidateId === candidate.id,
    )

    const searchable = [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.campagneName,
      ...relatedInterviews.map((interview) => interview.campagneName),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch =
      !query ||
      searchable.includes(query)

    const matchesCampaign =
      filters.value.campagne === 'Tous' ||
      String(candidate.campagneId || candidate.campagneName) ===
        filters.value.campagne ||
      relatedInterviews.some(
        (interview) =>
          String(interview.campagneId || interview.campagneName) ===
          filters.value.campagne,
      )

    const matchesType =
      filters.value.type === 'Tous' ||
      relatedInterviews.some(
        (interview) => interview.type === filters.value.type,
      )

    const matchesStatus =
      filters.value.status === 'Tous' ||
      relatedInterviews.some(
        (interview) => interview.status === filters.value.status,
      )

    return (
      matchesSearch &&
      matchesCampaign &&
      matchesType &&
      matchesStatus
    )
  })
})

const stats = computed(() => ({
  candidates: filteredCandidates.value.length,
  upcoming: filteredInterviews.value.filter(
    (item) => item.status === 'En-attente',
  ).length,
  progress: filteredInterviews.value.filter(
    (item) => item.status === 'progress',
  ).length,
  completed: filteredInterviews.value.filter(
    (item) => item.status === 'completed',
  ).length,
}))

const totalCandidatePages = computed(() => (
  Math.ceil(filteredCandidates.value.length / candidateItemsPerPage)
))

const paginatedCandidates = computed(() => {
  const start = (currentCandidatePage.value - 1) * candidateItemsPerPage
  return filteredCandidates.value.slice(start, start + candidateItemsPerPage)
})

const candidatePageNumbers = computed(() => Array.from(
  { length: totalCandidatePages.value },
  (_, index) => index + 1,
))

watch(
  filters,
  () => {
    currentCandidatePage.value = 1
  },
  { deep: true },
)

watch(totalCandidatePages, (total) => {
  if (total > 0 && currentCandidatePage.value > total) {
    currentCandidatePage.value = total
  }

  if (total === 0) {
    currentCandidatePage.value = 1
  }
})

function resetFilters() {
  filters.value = {
    search: '',
    campagne: 'Tous',
    type: 'Tous',
    status: 'Tous',
  }
}

function goToCandidatePage(page) {
  if (page >= 1 && page <= totalCandidatePages.value) {
    currentCandidatePage.value = page
  }
}

function openCandidate(candidate) {
  if (!candidate?.id) {
    return
  }

  router.push({
    name: 'evaluator-candidate-detail',
    params: {
      candidateId: candidate.id,
    },
  })
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const [
      candidateData,
      interviewData,
    ] = await Promise.all([
      fetchMyCandidates(),
      fetchMyInterviews(),
    ])

    candidates.value = candidateData
    interviews.value = interviewData
  } catch (err) {
    console.error('Erreur chargement espace évaluateur :', err)
    error.value =
      err?.response?.data?.detail ||
      'Impossible de charger vos candidats et entretiens.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <main class="min-h-screen bg-[#F8FBFC] px-5 py-20 lg:px-10 lg:py-10">
    <header class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <span class="inline-flex rounded-full bg-[#00313C]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#00313C] ring-1 ring-[#00313C]/30">
          ESPACE ÉVALUATEUR
        </span>

        <h1 class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl">
          Mes candidats
        </h1>

        <p class="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#00313C]/65">
          Retrouvez vos candidats, leurs entretiens et leur progression au même endroit.
        </p>
      </div>
    </header>

    <section class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-3xl border border-[#00313C]/20 bg-white p-5 shadow-xl shadow-[#00313C]/5">
        <span class="text-sm font-black text-[#00313C]/55">Candidats</span>
        <strong class="mt-3 block text-4xl font-black text-[#00313C]">{{ stats.candidates }}</strong>
      </article>

      <article class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/5">
        <span class="text-sm font-black text-white/60">À venir</span>
        <strong class="mt-3 block text-4xl font-black text-white">{{ stats.upcoming }}</strong>
      </article>

      <article class="rounded-3xl border border-[#00313C]/30 bg-white p-5 shadow-xl shadow-[#00313C]/5">
        <span class="text-sm font-black text-[#00313C]">En cours</span>
        <strong class="mt-3 block text-4xl font-black text-[#00313C]">{{ stats.progress }}</strong>
      </article>

      <article class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/5">
        <span class="text-sm font-black text-white/60">Terminés</span>
        <strong class="mt-3 block text-4xl font-black text-white">{{ stats.completed }}</strong>
      </article>
    </section>

    <section class="mb-6 grid gap-3 rounded-3xl border border-[#00313C]/20 bg-white p-3 shadow-xl shadow-[#00313C]/5 xl:grid-cols-[1fr_210px_190px_190px_auto]">
      <div class="flex h-12 min-w-0 items-center gap-3 rounded-2xl border border-[#00313C]/30 bg-white px-4 transition focus-within:border-[#00313C] focus-within:ring-4 focus-within:ring-[#00313C]/15">
        <span class="text-lg text-[#00313C]">⌕</span>
        <input
          v-model="filters.search"
          class="w-full border-0 bg-white text-sm font-semibold text-[#00313C] outline-none placeholder:text-[#00313C]/40"
          type="search"
          placeholder="Rechercher un candidat..."
        />
      </div>

      <select
        v-model="filters.campagne"
        class="h-12 rounded-2xl border border-[#00313C]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#00313C] focus:ring-4 focus:ring-[#00313C]/15"
      >
        <option value="Tous">Toutes les campagnes</option>
        <option
          v-for="campagne in campaignOptions"
          :key="campagne.id"
          :value="campagne.id"
        >
          {{ campagne.name }}
        </option>
      </select>

      <select
        v-model="filters.type"
        class="h-12 rounded-2xl border border-[#00313C]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#00313C] focus:ring-4 focus:ring-[#00313C]/15"
      >
        <option value="Tous">Tous les entretiens</option>
        <option value="motivation">Motivation</option>
        <option value="technique">Technique</option>
        <option value="final">Final</option>
      </select>

      <select
        v-model="filters.status"
        class="h-12 rounded-2xl border border-[#00313C]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#00313C] focus:ring-4 focus:ring-[#00313C]/15"
      >
        <option value="Tous">Tous les statuts</option>
        <option value="En-attente">En-attente</option>
        <option value="progress">En cours</option>
        <option value="completed">Terminé</option>
      </select>

      <button
        type="button"
        class="h-12 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#E40046] focus:outline-none focus:ring-4 focus:ring-[#00313C]/20 active:scale-[0.98]"
        @click="resetFilters"
      >
        Réinitialiser
      </button>
    </section>

    <div
      v-if="error"
      class="mb-5 rounded-2xl bg-[#E40046]/10 p-4 text-sm font-bold text-[#E40046] ring-1 ring-[#E40046]/20"
    >
      {{ error }}
    </div>

    <div
      v-if="loading"
      class="rounded-3xl border border-[#00313C]/20 bg-white/80 py-20 text-center text-sm font-bold text-[#00313C]/50 shadow-xl shadow-[#00313C]/5"
    >
      Chargement...
    </div>

    <div
      v-else
      class="grid gap-6"
    >
      <section class="rounded-3xl border border-[#00313C]/20 bg-white/90 p-4 shadow-xl shadow-[#00313C]/5 lg:p-6">
        <div class="mb-5">
          <h2 class="text-xl font-black text-[#00313C]">Candidats</h2>
          <p class="mt-1 text-sm font-semibold text-[#00313C]/60">
            {{ filteredCandidates.length }}
            candidat{{ filteredCandidates.length > 1 ? 's' : '' }}
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <CandidateInterviewCard
            v-for="candidate in paginatedCandidates"
            :key="candidate.id"
            :candidate="candidate"
            @click="openCandidate(candidate)"
          />

          <div
            v-if="!filteredCandidates.length"
            class="rounded-3xl border border-dashed border-[#00313C]/40 bg-[#00313C]/5 py-16 text-center text-sm font-bold text-[#00313C]/50"
          >
            Aucun candidat trouvé.
          </div>
        </div>

        <div
          v-if="totalCandidatePages > 1"
          class="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            :disabled="currentCandidatePage === 1"
            class="rounded-xl border border-[#00313C]/20 bg-white px-4 py-2 text-sm font-bold text-[#00313C] shadow-sm transition hover:border-[#00313C] disabled:cursor-not-allowed disabled:opacity-40"
            @click="goToCandidatePage(currentCandidatePage - 1)"
          >
            ← Précédent
          </button>

          <button
            v-for="page in candidatePageNumbers"
            :key="page"
            type="button"
            class="h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition"
            :class="
              currentCandidatePage === page
                ? 'bg-[#00313C] text-white shadow-md'
                : 'border border-[#00313C]/20 bg-white text-[#00313C] hover:border-[#00313C] hover:bg-[#00313C]/5'
            "
            @click="goToCandidatePage(page)"
          >
            {{ page }}
          </button>

          <button
            type="button"
            :disabled="currentCandidatePage === totalCandidatePages"
            class="rounded-xl border border-[#00313C]/20 bg-white px-4 py-2 text-sm font-bold text-[#00313C] shadow-sm transition hover:border-[#00313C] disabled:cursor-not-allowed disabled:opacity-40"
            @click="goToCandidatePage(currentCandidatePage + 1)"
          >
            Suivant →
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
