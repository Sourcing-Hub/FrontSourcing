<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import CandidateInterviewCard from '@/components/evaluator/CandidateInterviewCard.vue'

import { fetchMyCandidates } from '@/api/evaluator'

const router = useRouter()

const candidates = ref([])
const search = ref('')

const loading = ref(true)
const error = ref('')

const filteredCandidates = computed(() => {
  const query =
    search.value
      .trim()
      .toLowerCase()

  if (!query) {
    return candidates.value
  }

  return candidates.value.filter(
    (candidate) => {
      const name =
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase()

      return name.includes(query)
    },
  )
})

async function loadCandidates() {
  loading.value = true
  error.value = ''

  try {
    candidates.value =
      await fetchMyCandidates()
  } catch (err) {
    error.value =
      'Impossible de charger les candidats.'
  } finally {
    loading.value = false
  }
}

function openCandidate(candidate) {
  router.push({
    name: 'evaluator-candidate-detail',
    params: {
      candidateId: candidate.id,
    },
  })
}



onMounted(loadCandidates)
</script>

<template>
  <main class="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-5 py-20 lg:px-10 lg:py-10">

    <header class="mb-7">
      <span class="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 ring-1 ring-cyan-100">
        ESPACE ÉVALUATEUR
      </span>

      <h1 class="mt-5 text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
        Mes candidats
      </h1>

      <p class="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
        Consultez les candidats qui vous sont attribués.
      </p>
    </header>

    <div class="mb-5 flex h-14 max-w-2xl items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-5 shadow-xl shadow-slate-200/70 backdrop-blur ring-indigo-500/10 transition focus-within:border-indigo-300 focus-within:ring-4">
      <span class="text-xl text-slate-400">⌕</span>

      <input
        v-model="search"
        class="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
        type="search"
        placeholder="Rechercher un candidat..."
      />
    </div>

    <div
      v-if="error"
      class="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100"
    >
      {{ error }}
    </div>

    <div
      v-if="loading"
      class="rounded-3xl border border-white/70 bg-white/80 py-20 text-center text-sm font-bold text-slate-400 shadow-xl shadow-slate-200/70"
    >
      Chargement des candidats...
    </div>

    <section
      v-else
      class="flex flex-col gap-3"
    >
      <CandidateInterviewCard
        v-for="candidate in filteredCandidates"
        :key="candidate.id"
        :candidate="candidate"
        @open="openCandidate"
      />

      <div
        v-if="!filteredCandidates.length"
        class="rounded-3xl border border-dashed border-slate-300 bg-white/70 py-16 text-center text-sm font-bold text-slate-400"
      >
        Aucun candidat trouvé.
      </div>
    </section>

  </main>
</template>
