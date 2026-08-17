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

// Importe CandidateInfoCard utilisé dans la partie évaluateur.
import CandidateInfoCard from '@/components/evaluator/CandidatInfoCard.vue'

// Prépare un import groupé depuis une dépendance.
import { fetchMyCandidates } from '@/services/evaluator'

// Déclare router pour stocker une donnée ou un calcul de la vue.
const router = useRouter()

// Déclare candidates pour stocker une donnée ou un calcul de la vue.
const candidates = ref([])
// Déclare search pour stocker une donnée ou un calcul de la vue.
const search = ref('')

// Déclare loading pour stocker une donnée ou un calcul de la vue.
const loading = ref(true)
// Déclare error pour stocker une donnée ou un calcul de la vue.
const error = ref('')

// Déclare filteredCandidates pour stocker une donnée ou un calcul de la vue.
const filteredCandidates = computed(() => {
  // Déclare query pour stocker une donnée ou un calcul de la vue.
  const query =
    // Met à jour ou lit la valeur réactive utilisée par Vue.
    search.value
      // Exécute cette ligne de logique propre à la partie évaluateur.
      .trim()
      // Exécute cette ligne de logique propre à la partie évaluateur.
      .toLowerCase()

  // Vérifie cette condition avant de continuer.
  if (!query) {
    // Retourne le résultat attendu par le reste du code.
    return candidates.value
  // Ferme le bloc de configuration ou de traitement.
  }

  // Retourne le résultat attendu par le reste du code.
  return candidates.value.filter(
    // Exécute cette ligne de logique propre à la partie évaluateur.
    (candidate) => {
      // Déclare name pour stocker une donnée ou un calcul de la vue.
      const name =
        // Exécute cette ligne de logique propre à la partie évaluateur.
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase()

      // Retourne le résultat attendu par le reste du code.
      return name.includes(query)
    // Ajoute cette valeur à la structure ou à la liste en cours.
    },
  // Exécute cette ligne de logique propre à la partie évaluateur.
  )
// Ferme le bloc de configuration ou de traitement.
})

// Déclare la fonction loadCandidates pour isoler un traitement évaluateur.
async function loadCandidates() {
  // Met à jour ou lit la valeur réactive utilisée par Vue.
  loading.value = true
  // Met à jour ou lit la valeur réactive utilisée par Vue.
  error.value = ''

  // Démarre un bloc qui tente une action pouvant échouer.
  try {
    // Met à jour ou lit la valeur réactive utilisée par Vue.
    candidates.value =
      // Attend la réponse d'une action asynchrone avant de continuer.
      await fetchMyCandidates()
  // Gère l'erreur si le traitement précédent échoue.
  } catch {
    // Met à jour ou lit la valeur réactive utilisée par Vue.
    error.value =
      // Exécute cette ligne de logique propre à la partie évaluateur.
      'Impossible de charger les candidats.'
  // Exécute ce bloc dans tous les cas après l'action.
  } finally {
    // Met à jour ou lit la valeur réactive utilisée par Vue.
    loading.value = false
  // Ferme le bloc de configuration ou de traitement.
  }
// Ferme le bloc de configuration ou de traitement.
}

// Déclare la fonction openCandidate pour isoler un traitement évaluateur.
function openCandidate(candidate) {
  // Redirige l'utilisateur vers la page evaluator correspondante.
  router.push({
    // Ajoute cette valeur à la structure ou à la liste en cours.
    name: 'evaluator-candidate-detail',
    // Exécute cette ligne de logique propre à la partie évaluateur.
    params: {
      // Ajoute cette valeur à la structure ou à la liste en cours.
      candidateId: candidate.id,
    // Ajoute cette valeur à la structure ou à la liste en cours.
    },
  // Ferme le bloc de configuration ou de traitement.
  })
// Ferme le bloc de configuration ou de traitement.
}



// Lance ce traitement au montage du composant.
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
    <div class="mb-5 flex h-14 max-w-2xl items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-5 shadow-xl shadow-slate-200/70 backdrop-blur ring-indigo-500/10 transition focus-within:border-indigo-300 focus-within:ring-4">
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
      class="rounded-3xl border border-white/70 bg-white/80 py-20 text-center text-sm font-bold text-slate-400 shadow-xl shadow-slate-200/70"
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
      <CandidateInfoCard
        v-for="candidate in filteredCandidates"
        :key="candidate.id"
        :candidate="candidate"
        class="cursor-pointer transition hover:-translate-y-0.5"
        role="button"
        tabindex="0"
        @click="openCandidate(candidate)"
        @keydown.enter="openCandidate(candidate)"
        @keydown.space.prevent="openCandidate(candidate)"
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
