<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import CandidatInterviewCard from '@/components/evaluator/CandidateInterviewCard.vue'

import {
  fetchMyCandidates,
} from '@/services/evaluator'

const router = useRouter()

const candidates = ref([])
const search = ref('')

const loading = ref(true)
const error = ref('')

const filteredCandidates = computed(() => {
  const query = search.value
    .trim()
    .toLowerCase()

  if (!query) {
    return candidates.value
  }

  return candidates.value.filter((candidate) => {
    const name =
      `${candidate.firstName || ''} ${candidate.lastName || ''}`
        .trim()
        .toLowerCase()

    return name.includes(query)
  })
})

async function loadCandidates() {
  loading.value = true
  error.value = ''

  try {
    candidates.value =
      await fetchMyCandidates()
  } catch (err) {
    console.error(
      'Erreur chargement candidats :',
      err
    )

    error.value =
      err?.response?.data?.detail ||
      'Impossible de charger les candidats.'
  } finally {
    loading.value = false
  }
}

function openCandidate(candidate) {
  if (!candidate?.id) {
    console.error(
      'ID candidat manquant :',
      candidate
    )
    return
  }

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
  <!-- Définit le conteneur principal de la page évaluateur. -->
  <main class="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-5 py-20 lg:px-10 lg:py-10">

    <!-- Regroupe le titre et les informations d’introduction. -->
    <header class="mb-7">
      <!-- Affiche une information courte ou décorative. -->
      <span class="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 ring-1 ring-cyan-100">
        <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
        ESPACE ÉVALUATEUR
      <!-- Ferme l’élément span. -->
      </span>

      <!-- Affiche le titre principal de la page. -->
      <h1 class="mt-5 text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
        <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
        Mes candidats
      <!-- Ferme l’élément h1. -->
      </h1>

      <!-- Affiche un paragraphe de texte. -->
      <p class="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
        <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
        Consultez les candidats qui vous sont attribués.
      <!-- Ferme l’élément p. -->
      </p>
    <!-- Ferme l’élément header. -->
    </header>

    <!-- Structure un groupe d’éléments visuels. -->
    <div class="mb-5 flex h-14 max-w-2xl items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-5 shadow-xl shadow-slate-200/20 backdrop-blur ring-indigo-500/10 transition focus-within:border-indigo-300 focus-within:ring-4">
      <!-- Affiche une information courte ou décorative. -->
      <span class="text-xl text-slate-400">⌕</span>

      <!-- Affiche un champ de saisie utilisateur. -->
      <input
        v-model="search"
        class="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
        type="search"
        placeholder="Rechercher un candidat..."
      />
    <!-- Ferme l’élément div. -->
    </div>

    <!-- Structure un groupe d’éléments visuels. -->
    <div
      v-if="error"
      class="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100"
    >
      <!-- Affiche une donnée dynamique dans l’interface. -->
      {{ error }}
    <!-- Ferme l’élément div. -->
    </div>

    <!-- Structure un groupe d’éléments visuels. -->
    <div
      v-if="loading"
      class="rounded-3xl border border-white/70 bg-white/80 py-20 text-center text-sm font-bold text-slate-400 shadow-xl shadow-slate-200/10"
    >
      <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
      Chargement des candidats...
    <!-- Ferme l’élément div. -->
    </div>

    <section
      v-else
      class="flex flex-col gap-3"
    >
      <!-- Affiche ou configure l’élément CandidateInfoCard. -->
      <CandidatInterviewCard
        v-for="candidate in filteredCandidates"
        :key="candidate.id"
        :candidate="candidate"
        @click="openCandidate(candidate)"
      />

      <!-- Structure un groupe d’éléments visuels. -->
      <div
        v-if="!filteredCandidates.length"
        class="rounded-3xl border border-dashed border-slate-300 bg-white/70 py-16 text-center text-sm font-bold text-slate-400"
      >
        <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
        Aucun candidat trouvé.
      <!-- Ferme l’élément div. -->
      </div>
    <!-- Ferme l’élément section. -->
    </section>

  <!-- Ferme l’élément main. -->
  </main>
</template>
