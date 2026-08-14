<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import EvaluatorInterviewCard
  from '@/components/evaluator/EvaluatorInterviewCard.vue'

import EvaluatorInterviewFilters
  from '@/components/evaluator/EvaluatorInterviewFilters.vue'

const router = useRouter()

const loading = ref(false)
const error = ref('')

const interviews = ref([
  {
    id: 'interview-001',
    candidateName: 'Sarah Connor',
    day: '20',
    month: 'Août',
    type: 'technique',
    typeLabel: 'Entretien technique',
    startTime: '09:00',
    endTime: '09:45',
    location: 'Salle A',
    status: 'En-attente',
    statusLabel: 'En-attente',
  },

  {
    id: 'interview-002',
    candidateName: 'John Smith',
    day: '20',
    month: 'Août',
    type: 'motivation',
    typeLabel: 'Entretien de motivation',
    startTime: '10:00',
    endTime: '10:30',
    location: 'Salle B',
    status: 'progress',
    statusLabel: 'En cours',
  },

  {
    id: 'interview-003',
    candidateName: 'Nadia Benali',
    day: '21',
    month: 'Août',
    type: 'technique',
    typeLabel: 'Entretien technique',
    startTime: '09:00',
    endTime: '09:45',
    location: 'Salle A',
    status: 'completed',
    statusLabel: 'Terminé',
  },
])

const filters = ref({
  search: '',
  type: 'Tous',
  status: 'Tous',
})

function handleFilters(value) {
  filters.value = value
}

const filteredInterviews = computed(() => {
  const query = filters.value.search
    .trim()
    .toLowerCase()

  return interviews.value.filter((interview) => {
    const matchesSearch =
      !query ||
      interview.candidateName
        .toLowerCase()
        .includes(query)

    const matchesType =
      filters.value.type === 'Tous' ||
      interview.type ===
        filters.value.type.toLowerCase()

    const matchesStatus =
      filters.value.status === 'Tous' ||
      interview.statusLabel ===
        filters.value.status

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus
    )
  })
})

const stats = computed(() => ({
  total: interviews.value.length,

  upcoming: interviews.value.filter(
    (item) => item.status === 'En-attente',
  ).length,

  progress: interviews.value.filter(
    (item) => item.status === 'progress',
  ).length,

  completed: interviews.value.filter(
    (item) => item.status === 'completed',
  ).length,
}))

function openInterview(interview) {
  router.push({
    name: 'evaluator-conduct-interview',
    params: {
      interviewId: interview.id,
    },
  })
}

async function loadInterviews() {
  loading.value = true

  try {
    // À remplacer plus tard par :
    // interviews.value = await fetchMyInterviews()
  } catch (err) {
    error.value =
      'Impossible de charger vos entretiens.'
  } finally {
    loading.value = false
  }
}

onMounted(loadInterviews)
</script>

<template>
  <main
    class="min-h-screen bg-[#F8FBFC] px-5 py-20 lg:px-10 lg:py-10"
  >

    <!-- =========================================================
         HEADER
         ========================================================= -->
    <header
      class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
    >
      <div>

        <!-- Badge -->
        <span
          class="inline-flex rounded-full bg-[#64CCC9]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#00313C] ring-1 ring-[#64CCC9]/30"
        >
          ESPACE ÉVALUATEUR
        </span>

        <!-- Titre -->
        <h1
          class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl"
        >
          Mes entretiens
        </h1>

        <!-- Description -->
        <p
          class="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#00313C]/65"
        >
          Retrouvez vos entretiens planifiés
          et suivez leur progression.
        </p>

      </div>
    </header>


    <!-- =========================================================
         STATISTIQUES
         ========================================================= -->
    <section
      class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >

      <!-- TOTAL -->
      <article
        class="rounded-3xl border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/10"
      >
        <span
          class="text-sm font-black text-[#00313C]/55"
        >
          Total
        </span>

        <strong
          class="mt-3 block text-4xl font-black text-[#00313C]"
        >
          {{ stats.total }}
        </strong>
      </article>


      <!-- À VENIR -->
      <article
        class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/20"
      >
        <span
          class="text-sm font-black text-[#64CCC9]"
        >
          À venir
        </span>

        <strong
          class="mt-3 block text-4xl font-black text-white"
        >
          {{ stats.upcoming }}
        </strong>
      </article>


      <!-- EN COURS -->
      <article
        class="rounded-3xl border border-[#64CCC9]/30 bg-white p-5 shadow-xl shadow-[#00313C]/10"
      >
        <span
          class="text-sm font-black text-[#64CCC9]"
        >
          En cours
        </span>

        <strong
          class="mt-3 block text-4xl font-black text-[#00313C]"
        >
          {{ stats.progress }}
        </strong>
      </article>


      <!-- TERMINÉS -->
      <article
        class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/10"
      >
        <span
          class="text-sm font-black text-white/60"
        >
          Terminés
        </span>

        <strong
          class="mt-3 block text-4xl font-black text-[#64CCC9]"
        >
          {{ stats.completed }}
        </strong>
      </article>

    </section>


    <!-- =========================================================
         LISTE DES ENTRETIENS
         ========================================================= -->
    <section
      class="rounded-[2rem] border border-[#64CCC9]/20 bg-white/90 p-4 shadow-2xl shadow-[#00313C]/10 backdrop-blur lg:p-6"
    >

      <!-- Titre -->
      <div class="mb-5">
        <div>

          <h2
            class="text-xl font-black text-[#00313C]"
          >
            Vos entretiens
          </h2>

          <p
            class="mt-1 text-sm font-semibold text-[#00313C]/60"
          >
            {{ filteredInterviews.length }}
            entretien{{
              filteredInterviews.length > 1
                ? 's'
                : ''
            }}
          </p>

        </div>
      </div>


      <!-- =======================================================
           FILTRES
           ======================================================= -->
      <EvaluatorInterviewFilters
        @filter="handleFilters"
      />


      <!-- =======================================================
           ERREUR
           ======================================================= -->
      <div
        v-if="error"
        class="mt-4 rounded-2xl bg-[#E40046]/10 p-4 text-sm font-bold text-[#E40046] ring-1 ring-[#E40046]/20"
      >
        {{ error }}
      </div>


      <!-- =======================================================
           CHARGEMENT
           ======================================================= -->
      <div
        v-if="loading"
        class="py-20 text-center text-sm font-bold text-[#00313C]/50"
      >
        Chargement...
      </div>


      <!-- =======================================================
           LISTE
           ======================================================= -->
      <div
        v-else
        class="mt-5 flex flex-col gap-3"
      >

        <EvaluatorInterviewCard
          v-for="interview in filteredInterviews"
          :key="interview.id"
          :interview="interview"
          @open="openInterview"
        />


        <!-- Aucun résultat -->
        <div
          v-if="!filteredInterviews.length"
          class="rounded-3xl border border-dashed border-[#64CCC9]/40 bg-[#64CCC9]/5 py-16 text-center text-sm font-bold text-[#00313C]/50"
        >
          Aucun entretien trouvé.
        </div>

      </div>

    </section>

  </main>
</template>