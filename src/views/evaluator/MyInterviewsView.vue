```vue
<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import { useRouter } from 'vue-router'

import EvaluatorInterviewCard from '@/components/evaluator/EvaluationInterviewCard.vue'
import EvaluatorInterviewFilters from '@/components/evaluator/EvaluatorInterviewFilters.vue'

import {
  fetchMyInterviews,
} from '@/services/evaluator'

const router = useRouter()

// ============================================================
// ÉTAT
// ============================================================

const loading = ref(true)
const error = ref('')
const interviews = ref([])

const filters = ref({
  search: '',
  type: 'Tous',
  status: 'Tous',
})

// ============================================================
// PAGINATION
// ============================================================

// Nombre d'entretiens affichés par page
const itemsPerPage = 5

// Page actuelle
const currentPage = ref(1)

// ============================================================
// FILTRES
// ============================================================

function handleFilters(value) {
  filters.value = value
}

// ============================================================
// ENTRETIENS FILTRÉS
// ============================================================

const filteredInterviews = computed(() => {
  const query = filters.value.search
    .trim()
    .toLowerCase()

  return interviews.value.filter((interview) => {
    // Recherche par nom du candidat
    const matchesSearch =
      !query ||
      interview.candidateName 
        .toLowerCase()
        .includes(query)

    // Filtre par type
    const matchesType =
      filters.value.type === 'Tous' ||
      interview.type ===
        filters.value.type.toLowerCase()

    // Filtre par statut
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

// ============================================================
// NOMBRE TOTAL DE PAGES
// ============================================================

const totalPages = computed(() => {
  return Math.ceil(
    filteredInterviews.value.length /
      itemsPerPage
  )
})

// ============================================================
// ENTRETIENS DE LA PAGE ACTUELLE
// ============================================================

const paginatedInterviews = computed(() => {
  const start =
    (currentPage.value - 1) *
    itemsPerPage

  const end =
    start + itemsPerPage

  return filteredInterviews.value.slice(
    start,
    end
  )
})

// ============================================================
// NUMÉROS DES PAGES
// ============================================================

const pageNumbers = computed(() => {
  return Array.from(
    {
      length: totalPages.value,
    },
    (_, index) => index + 1
  )
})

// ============================================================
// RÉINITIALISER LA PAGINATION
// ============================================================

// Quand les filtres changent,
// on revient à la première page.
watch(
  () => filters.value,
  () => {
    currentPage.value = 1
  },
  {
    deep: true,
  }
)

// Si le nombre de résultats diminue,
// on évite de rester sur une page inexistante.
watch(totalPages, (newTotalPages) => {
  if (
    newTotalPages > 0 &&
    currentPage.value > newTotalPages
  ) {
    currentPage.value = newTotalPages
  }

  if (newTotalPages === 0) {
    currentPage.value = 1
  }
})

// ============================================================
// PAGINATION - ALLER À UNE PAGE
// ============================================================

function goToPage(page) {
  if (
    page < 1 ||
    page > totalPages.value
  ) {
    return
  }

  currentPage.value = page
}

// ============================================================
// PAGINATION - PAGE PRÉCÉDENTE
// ============================================================

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// ============================================================
// PAGINATION - PAGE SUIVANTE
// ============================================================

function nextPage() {
  if (
    currentPage.value < totalPages.value
  ) {
    currentPage.value++
  }
}

// ============================================================
// STATISTIQUES
// ============================================================

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

// ============================================================
// OUVRIR UN ENTRETIEN
// ============================================================

function openInterview(interview) {
  router.push({
    name: 'evaluator-conduct-interview',
    params: {
      interviewId: interview.id,
    },
  })
}

// ============================================================
// CHARGEMENT DES ENTRETIENS
// ============================================================

async function loadInterviews() {
  loading.value = true
  error.value = ''

  try {
    interviews.value =
      await fetchMyInterviews()

    currentPage.value = 1
  } catch (err) {
    console.error(
      'Erreur chargement entretiens :',
      err
    )

    error.value =
      err?.response?.data?.detail ||
      'Impossible de charger vos entretiens.'
  } finally {
    loading.value = false
  }
}

// ============================================================
// INITIALISATION
// ============================================================

onMounted(loadInterviews)
</script>

<template>
  <!-- ========================================================
       CONTENEUR PRINCIPAL
       ======================================================== -->

  <main
    class="min-h-screen bg-[#F8FBFC] px-5 py-20 lg:px-10 lg:py-10"
  >
    <!-- ======================================================
         HEADER
         ====================================================== -->

    <header
      class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
    >
      <div>
        <!-- Badge -->
        <span
          class="inline-flex rounded-full bg-[#00313C]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#00313C] ring-1 ring-[#00313C]/30"
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

    <!-- ======================================================
         STATISTIQUES
         ====================================================== -->

    <section
      class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <!-- TOTAL -->

      <article
        class="rounded-3xl border border-[#00313C]/20 bg-white p-5 -[#00313C]/2"
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
        class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white -[#00313C]/2"
      >
        <span
          class="text-sm font-black text-white/60"
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
        class="rounded-3xl border border-[#00313C]/30 bg-white p-5 -[#00313C]/2"
      >
        <span
          class="text-sm font-black text-[#00313C]"
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
        class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white -[#00313C]/2"
      >
        <span
          class="text-sm font-black text-white/60"
        >
          Terminés
        </span>

        <strong
          class="mt-3 block text-4xl font-black text-white"
        >
          {{ stats.completed }}
        </strong>
      </article>
    </section>

    <!-- ======================================================
         LISTE DES ENTRETIENS
         ====================================================== -->

    <section
      class="rounded-[2rem] border border-[#00313C]/20 bg-white/90 p-4 -[#00313C]/2 lg:p-6"
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

      <!-- ====================================================
           FILTRES
           ==================================================== -->

      <EvaluatorInterviewFilters
        @filter="handleFilters"
      />

      <!-- ====================================================
           ERREUR
           ==================================================== -->

      <div
        v-if="error"
        class="mt-4 rounded-2xl bg-[#E40046]/10 p-4 text-sm font-bold text-[#E40046] ring-1 ring-[#E40046]/20"
      >
        {{ error }}
      </div>

      <!-- ====================================================
           CHARGEMENT
           ==================================================== -->

      <div
        v-if="loading"
        class="py-20 text-center text-sm font-bold text-[#00313C]/50"
      >
        Chargement...
      </div>

      <!-- ====================================================
           LISTE
           ==================================================== -->

      <div
        v-else
        class="mt-5 flex flex-col gap-3"
      >
        <!-- Cartes des entretiens de la page actuelle -->

        <EvaluatorInterviewCard
          v-for="interview in paginatedInterviews"
          :key="interview.id"
          :interview="interview"
          @open="openInterview"
        />

        <!-- ==================================================
             AUCUN RÉSULTAT
             ================================================== -->

        <div
          v-if="!filteredInterviews.length"
          class="rounded-3xl border border-dashed border-[#00313C]/40 bg-[#00313C]/5 py-16 text-center text-sm font-bold text-[#00313C]/50"
        >
          Aucun entretien trouvé.
        </div>

        <!-- ==================================================
             PAGINATION
             ================================================== -->

        <div
          v-if="totalPages > 1"
          class="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <!-- PRÉCÉDENT -->

          <button
            type="button"
            :disabled="currentPage === 1"
            class="rounded-xl border border-[#00313C]/20 bg-white px-4 py-2 text-sm font-bold text-[#00313C] transition hover:border-[#00313C] disabled:cursor-not-allowed disabled:opacity-40"
            @click="previousPage"
          >
            ← Précédent
          </button>

          <!-- NUMÉROS -->

          <button
            v-for="page in pageNumbers"
            :key="page"
            type="button"
            class="h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition"
            :class="currentPage === page ? 'bg-[#00313C] text-white ' : 'border border-[#00313C]/20 bg-white text-[#00313C] hover:border-[#00313C] hover:bg-[#00313C]/5'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <!-- SUIVANT -->

          <button
            type="button"
            :disabled="currentPage === totalPages"
            class="rounded-xl border border-[#00313C]/20 bg-white px-4 py-2 text-sm font-bold text-[#00313C] transition hover:border-[#00313C] disabled:cursor-not-allowed disabled:opacity-40"
            @click="nextPage"
          >
            Suivant →
          </button>
        </div>

        <!-- ==================================================
             INFORMATIONS PAGINATION
             ================================================== -->

        <div
          v-if="filteredInterviews.length"
          class="mt-2 text-center text-xs font-semibold text-[#00313C]/45"
        >
          Page {{ currentPage }}
          sur {{ totalPages }}
          ·
          {{ filteredInterviews.length }}
          entretien{{
            filteredInterviews.length > 1
              ? 's'
              : ''
          }}
        </div>
      </div>
    </section>
  </main>
</template>
```
