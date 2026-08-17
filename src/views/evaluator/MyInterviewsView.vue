<script setup>
// Prépare un import groupé depuis une dépendance.
import {
  // Ajoute cette valeur à la structure ou à la liste en cours.
  computed,
  // Ajoute cette valeur à la structure ou à la liste en cours.
  onMounted,
  // Ajoute cette valeur à la structure ou à la liste en cours.
  ref,
// Ferme la liste d'import et précise le module source.
} from 'vue'

// Prépare un import groupé depuis une dépendance.
import { useRouter } from 'vue-router'

// Importe EvaluatorInterviewCard utilisé dans la partie évaluateur.
import EvaluatorInterviewCard from '@/components/evaluator/EvaluationInterviewCard.vue'

// Importe EvaluatorInterviewFilters utilisé dans la partie évaluateur.
import EvaluatorInterviewFilters from '@/components/evaluator/EvaluatorInterviewFilters.vue'

// Prépare un import groupé depuis une dépendance.
import { fetchMyInterviews } from '@/services/evaluator'

// Déclare router pour stocker une donnée ou un calcul de la vue.
const router = useRouter()

// Déclare loading pour stocker une donnée ou un calcul de la vue.
const loading = ref(true)
// Déclare error pour stocker une donnée ou un calcul de la vue.
const error = ref('')

// Déclare interviews pour stocker une donnée ou un calcul de la vue.
const interviews = ref([])

// Déclare filters pour stocker une donnée ou un calcul de la vue.
const filters = ref({
  // Ajoute cette valeur à la structure ou à la liste en cours.
  search: '',
  // Ajoute cette valeur à la structure ou à la liste en cours.
  type: 'Tous',
  // Ajoute cette valeur à la structure ou à la liste en cours.
  status: 'Tous',
// Ferme le bloc de configuration ou de traitement.
})

// Déclare la fonction handleFilters pour isoler un traitement évaluateur.
function handleFilters(value) {
  // Met à jour ou lit la valeur réactive utilisée par Vue.
  filters.value = value
// Ferme le bloc de configuration ou de traitement.
}

// Déclare filteredInterviews pour stocker une donnée ou un calcul de la vue.
const filteredInterviews = computed(() => {
  // Déclare query pour stocker une donnée ou un calcul de la vue.
  const query = filters.value.search
    // Exécute cette ligne de logique propre à la partie évaluateur.
    .trim()
    // Exécute cette ligne de logique propre à la partie évaluateur.
    .toLowerCase()

  // Retourne le résultat attendu par le reste du code.
  return interviews.value.filter((interview) => {
    // Déclare matchesSearch pour stocker une donnée ou un calcul de la vue.
    const matchesSearch =
      // Exécute cette ligne de logique propre à la partie évaluateur.
      !query ||
      // Exécute cette ligne de logique propre à la partie évaluateur.
      interview.candidateName
        // Exécute cette ligne de logique propre à la partie évaluateur.
        .toLowerCase()
        // Exécute cette ligne de logique propre à la partie évaluateur.
        .includes(query)

    // Déclare matchesType pour stocker une donnée ou un calcul de la vue.
    const matchesType =
      // Met à jour ou lit la valeur réactive utilisée par Vue.
      filters.value.type === 'Tous' ||
      // Exécute cette ligne de logique propre à la partie évaluateur.
      interview.type ===
        // Met à jour ou lit la valeur réactive utilisée par Vue.
        filters.value.type.toLowerCase()

    // Déclare matchesStatus pour stocker une donnée ou un calcul de la vue.
    const matchesStatus =
      // Met à jour ou lit la valeur réactive utilisée par Vue.
      filters.value.status === 'Tous' ||
      // Exécute cette ligne de logique propre à la partie évaluateur.
      interview.statusLabel ===
        // Met à jour ou lit la valeur réactive utilisée par Vue.
        filters.value.status

    // Retourne le résultat attendu par le reste du code.
    return (
      // Exécute cette ligne de logique propre à la partie évaluateur.
      matchesSearch &&
      // Exécute cette ligne de logique propre à la partie évaluateur.
      matchesType &&
      // Exécute cette ligne de logique propre à la partie évaluateur.
      matchesStatus
    // Exécute cette ligne de logique propre à la partie évaluateur.
    )
  // Ferme le bloc de configuration ou de traitement.
  })
// Ferme le bloc de configuration ou de traitement.
})

// Déclare stats pour stocker une donnée ou un calcul de la vue.
const stats = computed(() => ({
  // Ajoute cette valeur à la structure ou à la liste en cours.
  total: interviews.value.length,

  // Met à jour ou lit la valeur réactive utilisée par Vue.
  upcoming: interviews.value.filter(
    // Ajoute cette valeur à la structure ou à la liste en cours.
    (item) => item.status === 'En-attente',
  // Ajoute cette valeur à la structure ou à la liste en cours.
  ).length,

  // Met à jour ou lit la valeur réactive utilisée par Vue.
  progress: interviews.value.filter(
    // Ajoute cette valeur à la structure ou à la liste en cours.
    (item) => item.status === 'progress',
  // Ajoute cette valeur à la structure ou à la liste en cours.
  ).length,

  // Met à jour ou lit la valeur réactive utilisée par Vue.
  completed: interviews.value.filter(
    // Ajoute cette valeur à la structure ou à la liste en cours.
    (item) => item.status === 'completed',
  // Ajoute cette valeur à la structure ou à la liste en cours.
  ).length,
// Exécute cette ligne de logique propre à la partie évaluateur.
}))

// Déclare la fonction openInterview pour isoler un traitement évaluateur.
function openInterview(interview) {
  // Redirige l'utilisateur vers la page evaluator correspondante.
  router.push({
    // Ajoute cette valeur à la structure ou à la liste en cours.
    name: 'evaluator-conduct-interview',
    // Exécute cette ligne de logique propre à la partie évaluateur.
    params: {
      // Ajoute cette valeur à la structure ou à la liste en cours.
      interviewId: interview.id,
    // Ajoute cette valeur à la structure ou à la liste en cours.
    },
  // Ferme le bloc de configuration ou de traitement.
  })
// Ferme le bloc de configuration ou de traitement.
}

// Déclare la fonction loadInterviews pour isoler un traitement évaluateur.
async function loadInterviews() {
  // Met à jour ou lit la valeur réactive utilisée par Vue.
  loading.value = true
  // Met à jour ou lit la valeur réactive utilisée par Vue.
  error.value = ''

  // Démarre un bloc qui tente une action pouvant échouer.
  try {
    // Attend la réponse d'une action asynchrone avant de continuer.
    interviews.value = await fetchMyInterviews()
  // Gère l'erreur si le traitement précédent échoue.
  } catch {
    // Met à jour ou lit la valeur réactive utilisée par Vue.
    error.value =
      // Exécute cette ligne de logique propre à la partie évaluateur.
      'Impossible de charger vos entretiens.'
  // Exécute ce bloc dans tous les cas après l'action.
  } finally {
    // Met à jour ou lit la valeur réactive utilisée par Vue.
    loading.value = false
  // Ferme le bloc de configuration ou de traitement.
  }
// Ferme le bloc de configuration ou de traitement.
}

// Lance ce traitement au montage du composant.
onMounted(loadInterviews)
</script>

<template>
  <!-- Définit le conteneur principal de la page évaluateur. -->
  <main
    class="min-h-screen bg-[#F8FBFC] px-5 py-20 lg:px-10 lg:py-10"
  >

    <!-- =========================================================
         HEADER
         ========================================================= -->
    <!-- Regroupe le titre et les informations d’introduction. -->
    <header
      class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
    >
      <!-- Structure un groupe d’éléments visuels. -->
      <div>

        <!-- Badge -->
        <!-- Affiche une information courte ou décorative. -->
        <span
          class="inline-flex rounded-full bg-[#64CCC9]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#00313C] ring-1 ring-[#64CCC9]/30"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          ESPACE ÉVALUATEUR
        <!-- Ferme l’élément span. -->
        </span>

        <!-- Titre -->
        <!-- Affiche le titre principal de la page. -->
        <h1
          class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          Mes entretiens
        <!-- Ferme l’élément h1. -->
        </h1>

        <!-- Description -->
        <!-- Affiche un paragraphe de texte. -->
        <p
          class="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#00313C]/65"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          Retrouvez vos entretiens planifiés
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          et suivez leur progression.
        <!-- Ferme l’élément p. -->
        </p>

      <!-- Ferme l’élément div. -->
      </div>
    <!-- Ferme l’élément header. -->
    </header>


    <!-- =========================================================
         STATISTIQUES
         ========================================================= -->
    <!-- Délimite une zone fonctionnelle de la page. -->
    <section
      class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >

      <!-- TOTAL -->
      <!-- Affiche une carte ou un bloc de contenu autonome. -->
      <article
        class="rounded-3xl border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/10"
      >
        <!-- Affiche une information courte ou décorative. -->
        <span
          class="text-sm font-black text-[#00313C]/55"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          Total
        <!-- Ferme l’élément span. -->
        </span>

        <!-- Met en avant une valeur importante. -->
        <strong
          class="mt-3 block text-4xl font-black text-[#00313C]"
        >
          <!-- Affiche une donnée dynamique dans l’interface. -->
          {{ stats.total }}
        <!-- Ferme l’élément strong. -->
        </strong>
      <!-- Ferme l’élément article. -->
      </article>


      <!-- À VENIR -->
      <!-- Affiche une carte ou un bloc de contenu autonome. -->
      <article
        class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/20"
      >
        <!-- Affiche une information courte ou décorative. -->
        <span
          class="text-sm font-black text-[#64CCC9]"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          À venir
        <!-- Ferme l’élément span. -->
        </span>

        <!-- Met en avant une valeur importante. -->
        <strong
          class="mt-3 block text-4xl font-black text-white"
        >
          <!-- Affiche une donnée dynamique dans l’interface. -->
          {{ stats.upcoming }}
        <!-- Ferme l’élément strong. -->
        </strong>
      <!-- Ferme l’élément article. -->
      </article>


      <!-- EN COURS -->
      <!-- Affiche une carte ou un bloc de contenu autonome. -->
      <article
        class="rounded-3xl border border-[#64CCC9]/30 bg-white p-5 shadow-xl shadow-[#00313C]/10"
      >
        <!-- Affiche une information courte ou décorative. -->
        <span
          class="text-sm font-black text-[#64CCC9]"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          En cours
        <!-- Ferme l’élément span. -->
        </span>

        <!-- Met en avant une valeur importante. -->
        <strong
          class="mt-3 block text-4xl font-black text-[#00313C]"
        >
          <!-- Affiche une donnée dynamique dans l’interface. -->
          {{ stats.progress }}
        <!-- Ferme l’élément strong. -->
        </strong>
      <!-- Ferme l’élément article. -->
      </article>


      <!-- TERMINÉS -->
      <!-- Affiche une carte ou un bloc de contenu autonome. -->
      <article
        class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/10"
      >
        <!-- Affiche une information courte ou décorative. -->
        <span
          class="text-sm font-black text-white/60"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          Terminés
        <!-- Ferme l’élément span. -->
        </span>

        <!-- Met en avant une valeur importante. -->
        <strong
          class="mt-3 block text-4xl font-black text-[#64CCC9]"
        >
          <!-- Affiche une donnée dynamique dans l’interface. -->
          {{ stats.completed }}
        <!-- Ferme l’élément strong. -->
        </strong>
      <!-- Ferme l’élément article. -->
      </article>

    <!-- Ferme l’élément section. -->
    </section>


    <!-- =========================================================
         LISTE DES ENTRETIENS
         ========================================================= -->
    <!-- Délimite une zone fonctionnelle de la page. -->
    <section
      class="rounded-[2rem] border border-[#64CCC9]/20 bg-white/90 p-4 shadow-2xl shadow-[#00313C]/10 backdrop-blur lg:p-6"
    >

      <!-- Titre -->
      <!-- Structure un groupe d’éléments visuels. -->
      <div class="mb-5">
        <!-- Structure un groupe d’éléments visuels. -->
        <div>

          <!-- Affiche un titre de section. -->
          <h2
            class="text-xl font-black text-[#00313C]"
          >
            <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
            Vos entretiens
          <!-- Ferme l’élément h2. -->
          </h2>

          <!-- Affiche un paragraphe de texte. -->
          <p
            class="mt-1 text-sm font-semibold text-[#00313C]/60"
          >
            <!-- Affiche une donnée dynamique dans l’interface. -->
            {{ filteredInterviews.length }}
            <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
            entretien{{
              filteredInterviews.length > 1
                ? 's'
                : ''
            }}
          <!-- Ferme l’élément p. -->
          </p>

        <!-- Ferme l’élément div. -->
        </div>
      <!-- Ferme l’élément div. -->
      </div>


      <!-- =======================================================
           FILTRES
           ======================================================= -->
      <!-- Affiche ou configure l’élément EvaluatorInterviewFilters. -->
      <EvaluatorInterviewFilters
        @filter="handleFilters"
      />


      <!-- =======================================================
           ERREUR
           ======================================================= -->
      <!-- Structure un groupe d’éléments visuels. -->
      <div
        v-if="error"
        class="mt-4 rounded-2xl bg-[#E40046]/10 p-4 text-sm font-bold text-[#E40046] ring-1 ring-[#E40046]/20"
      >
        <!-- Affiche une donnée dynamique dans l’interface. -->
        {{ error }}
      <!-- Ferme l’élément div. -->
      </div>


      <!-- =======================================================
           CHARGEMENT
           ======================================================= -->
      <!-- Structure un groupe d’éléments visuels. -->
      <div
        v-if="loading"
        class="py-20 text-center text-sm font-bold text-[#00313C]/50"
      >
        <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
        Chargement...
      <!-- Ferme l’élément div. -->
      </div>


      <!-- =======================================================
           LISTE
           ======================================================= -->
      <div
        v-else
        class="mt-5 flex flex-col gap-3"
      >

        <!-- Affiche ou configure l’élément EvaluatorInterviewCard. -->
        <EvaluatorInterviewCard
          v-for="interview in filteredInterviews"
          :key="interview.id"
          :interview="interview"
          @open="openInterview"
        />


        <!-- Aucun résultat -->
        <!-- Structure un groupe d’éléments visuels. -->
        <div
          v-if="!filteredInterviews.length"
          class="rounded-3xl border border-dashed border-[#64CCC9]/40 bg-[#64CCC9]/5 py-16 text-center text-sm font-bold text-[#00313C]/50"
        >
          <!-- Affiche ce contenu textuel dans la vue évaluateur. -->
          Aucun entretien trouvé.
        <!-- Ferme l’élément div. -->
        </div>

      <!-- Ferme l’élément div. -->
      </div>

    <!-- Ferme l’élément section. -->
    </section>

  <!-- Ferme l’élément main. -->
  </main>
</template>
