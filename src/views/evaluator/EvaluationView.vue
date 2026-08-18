<script setup>
//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  computed,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  onMounted,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  ref,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  watch,
//  Ferme la liste d'import et précise le module source.
} from 'vue'

//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  useRoute,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  useRouter,
//  Ferme la liste d'import et précise le module source.
} from 'vue-router'

//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchCandidate,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchEvaluation,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchInterview,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  saveEvaluation,
//  Ferme la liste d'import et précise le module source.
} from '@/services/evaluator'

//  Déclare route pour stocker une donnée ou un calcul de la vue.
const route = useRoute()
//  Déclare router pour stocker une donnée ou un calcul de la vue.
const router = useRouter()

//  Déclare interview pour stocker une donnée ou un calcul de la vue.
const interview = ref(null)
//  Déclare candidate pour stocker une donnée ou un calcul de la vue.
const candidate = ref(null)
//  Déclare evaluation pour stocker une donnée ou un calcul de la vue.
const evaluation = ref(null)

//  Déclare loading pour stocker une donnée ou un calcul de la vue.
const loading = ref(true)
//  Déclare saving pour stocker une donnée ou un calcul de la vue.
const saving = ref(false)
//  Déclare error pour stocker une donnée ou un calcul de la vue.
const error = ref('')

// ============================================================
// QUESTIONS
// ============================================================
// ============================================================
// ÉTAT
// ============================================================

//  Déclare selectedType pour stocker une donnée ou un calcul de la vue.
const selectedType = ref(
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  '',
//  Exécute cette ligne de logique propre à la partie évaluateur.
)

//  Déclare answers pour stocker une donnée ou un calcul de la vue.
const answers = ref({})
//  Déclare notes pour stocker une donnée ou un calcul de la vue.
const notes = ref({})
//  Déclare globalComment pour stocker une donnée ou un calcul de la vue.
const globalComment = ref('')

//  Déclare touched pour stocker une donnée ou un calcul de la vue.
const touched = ref(false)

// ============================================================
// INITIALISATION
// ============================================================

//  Déclare la fonction initializeEvaluation pour isoler un traitement évaluateur.
function initializeEvaluation() {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  selectedType.value =
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    evaluation.value?.type ||
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    interview.value?.type ||
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ''

  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  globalComment.value =
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    evaluation.value?.comment ||
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    evaluation.value?.comments ||
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    evaluation.value?.globalComment ||
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ''

  //  Vérifie cette condition avant de continuer.
  if (evaluation.value?.answers) {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    answers.value = {
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      ...evaluation.value.answers,
    //  Ferme le bloc de configuration ou de traitement.
    }
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Vérifie cette condition avant de continuer.
  if (evaluation.value?.notes) {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    notes.value = {
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      ...evaluation.value.notes,
    //  Ferme le bloc de configuration ou de traitement.
    }
  //  Ferme le bloc de configuration ou de traitement.
  }
//  Ferme le bloc de configuration ou de traitement.
}

//  Observe un changement de donnée pour déclencher une réaction.
watch(
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  [
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    () => evaluation.value,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    () => interview.value,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  ],
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  initializeEvaluation,
  //  Ouvre un bloc de configuration ou de données.
  {
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    deep: true,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  },
//  Exécute cette ligne de logique propre à la partie évaluateur.
)

// ============================================================
// QUESTIONS ACTUELLES
// ============================================================

//  Déclare currentQuestions pour stocker une donnée ou un calcul de la vue.
const currentQuestions = computed(() => {
  //  Vérifie cette condition avant de continuer.
  if (!selectedType.value) {
    //  Retourne le résultat attendu par le reste du code.
    return []
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Retourne le résultat attendu par le reste du code.
  return questions[selectedType.value] || []
//  Ferme le bloc de configuration ou de traitement.
})

// ============================================================
// SCORE
// ============================================================

//  Déclare answeredQuestions pour stocker une donnée ou un calcul de la vue.
const answeredQuestions = computed(() => {
  //  Retourne le résultat attendu par le reste du code.
  return currentQuestions.value.filter(
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    (question) =>
      //  Met à jour ou lit la valeur réactive utilisée par Vue.
      notes.value[question.id] !== undefined &&
      //  Met à jour ou lit la valeur réactive utilisée par Vue.
      notes.value[question.id] !== null &&
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      notes.value[question.id] !== '',
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )
//  Ferme le bloc de configuration ou de traitement.
})

//  Déclare totalScore pour stocker une donnée ou un calcul de la vue.
const totalScore = computed(() => {
  //  Vérifie cette condition avant de continuer.
  if (!answeredQuestions.value.length) {
    //  Retourne le résultat attendu par le reste du code.
    return 0
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Déclare total pour stocker une donnée ou un calcul de la vue.
  const total = answeredQuestions.value.reduce(
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    (sum, question) => {
      //  Retourne le résultat attendu par le reste du code.
      return (
        //  Exécute cette ligne de logique propre à la partie évaluateur.
        sum +
        //  Met à jour ou lit la valeur réactive utilisée par Vue.
        Number(notes.value[question.id] || 0)
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      )
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    },
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    0,
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )

  //  Retourne le résultat attendu par le reste du code.
  return Math.round(
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    (total /
      //  Met à jour ou lit la valeur réactive utilisée par Vue.
      (currentQuestions.value.length * 5)) *
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      100,
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )
//  Ferme le bloc de configuration ou de traitement.
})

//  Déclare averageScore pour stocker une donnée ou un calcul de la vue.
const averageScore = computed(() => {
  //  Vérifie cette condition avant de continuer.
  if (!answeredQuestions.value.length) {
    //  Retourne le résultat attendu par le reste du code.
    return 0
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Déclare total pour stocker une donnée ou un calcul de la vue.
  const total = answeredQuestions.value.reduce(
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    (sum, question) => {
      //  Retourne le résultat attendu par le reste du code.
      return (
        //  Exécute cette ligne de logique propre à la partie évaluateur.
        sum +
        //  Met à jour ou lit la valeur réactive utilisée par Vue.
        Number(notes.value[question.id] || 0)
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      )
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    },
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    0,
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )

  //  Retourne le résultat attendu par le reste du code.
  return (
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    total /
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    answeredQuestions.value.length
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  ).toFixed(1)
//  Ferme le bloc de configuration ou de traitement.
})

// ============================================================
// PROGRESSION
// ============================================================

//  Déclare progress pour stocker une donnée ou un calcul de la vue.
const progress = computed(() => {
  //  Vérifie cette condition avant de continuer.
  if (!currentQuestions.value.length) {
    //  Retourne le résultat attendu par le reste du code.
    return 0
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Retourne le résultat attendu par le reste du code.
  return Math.round(
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    (answeredQuestions.value.length /
      //  Met à jour ou lit la valeur réactive utilisée par Vue.
      currentQuestions.value.length) *
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      100,
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )
//  Ferme le bloc de configuration ou de traitement.
})

// ============================================================
// CHANGEMENT DU TYPE
// ============================================================

//  Déclare la fonction selectType pour isoler un traitement évaluateur.
function selectType(type) {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  selectedType.value = type
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  touched.value = false
//  Ferme le bloc de configuration ou de traitement.
}

// ============================================================
// NOTE
// ============================================================

//  Déclare la fonction setNote pour isoler un traitement évaluateur.
function setNote(questionId, note) {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  notes.value = {
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    ...notes.value,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    [questionId]: note,
  //  Ferme le bloc de configuration ou de traitement.
  }
//  Ferme le bloc de configuration ou de traitement.
}

// ============================================================
// CHARGEMENT
// ============================================================

//  Déclare la fonction loadData pour isoler un traitement évaluateur.
async function loadData() {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  loading.value = true
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  error.value = ''

  //  Démarre un bloc qui tente une action pouvant échouer.
  try {
    //  Déclare interviewData pour stocker une donnée ou un calcul de la vue.
    const interviewData =
      //  Attend la réponse d'une action asynchrone avant de continuer.
      await fetchInterview(
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        route.params.interviewId,
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      )

    //  Exécute cette ligne de logique propre à la partie évaluateur.
    const [
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      candidateData,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      evaluationData,
    //  Attend la réponse d'une action asynchrone avant de continuer.
    ] = await Promise.all([
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      fetchCandidate(
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        interviewData.candidateId,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      ),

      //  Exécute cette ligne de logique propre à la partie évaluateur.
      fetchEvaluation(
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        route.params.interviewId,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      ),
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ])

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    interview.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      interviewData

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    candidate.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      candidateData

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    evaluation.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      evaluationData
  //  Gère l'erreur si le traitement précédent échoue.
  } catch {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    error.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      'Impossible de charger l’évaluation.'
  //  Exécute ce bloc dans tous les cas après l'action.
  } finally {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    loading.value = false
  //  Ferme le bloc de configuration ou de traitement.
  }
//  Ferme le bloc de configuration ou de traitement.
}

// ============================================================
// VALIDATION
// ============================================================

//  Déclare isComplete pour stocker une donnée ou un calcul de la vue.
const isComplete = computed(() => {
  //  Vérifie cette condition avant de continuer.
  if (!selectedType.value) {
    //  Retourne le résultat attendu par le reste du code.
    return false
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Vérifie cette condition avant de continuer.
  if (!currentQuestions.value.length) {
    //  Retourne le résultat attendu par le reste du code.
    return false
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Retourne le résultat attendu par le reste du code.
  return (
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    answeredQuestions.value.length ===
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    currentQuestions.value.length
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )
//  Ferme le bloc de configuration ou de traitement.
})

// ============================================================
// ENREGISTREMENT
// ============================================================

//  Déclare la fonction submit pour isoler un traitement évaluateur.
async function submit() {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  touched.value = true

  //  Vérifie cette condition avant de continuer.
  if (!selectedType.value) {
    //  Retourne le résultat attendu par le reste du code.
    return
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Vérifie cette condition avant de continuer.
  if (!isComplete.value) {
    //  Retourne le résultat attendu par le reste du code.
    return
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  saving.value = true
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  error.value = ''

  //  Démarre un bloc qui tente une action pouvant échouer.
  try {
    //  Attend la réponse d'une action asynchrone avant de continuer.
    await saveEvaluation(
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      route.params.interviewId,
      //  Ouvre un bloc de configuration ou de données.
      {
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        type: selectedType.value,

        //  Exécute cette ligne de logique propre à la partie évaluateur.
        answers: {
          //  Ajoute cette valeur à la structure ou à la liste en cours.
          ...answers.value,
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        },

        //  Exécute cette ligne de logique propre à la partie évaluateur.
        notes: {
          //  Ajoute cette valeur à la structure ou à la liste en cours.
          ...notes.value,
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        },

        //  Ajoute cette valeur à la structure ou à la liste en cours.
        score: totalScore.value,

        //  Exécute cette ligne de logique propre à la partie évaluateur.
        averageScore:
          //  Ajoute cette valeur à la structure ou à la liste en cours.
          Number(averageScore.value),

        //  Ajoute cette valeur à la structure ou à la liste en cours.
        comment: globalComment.value,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      },
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    )

    //  Redirige l'utilisateur vers la page evaluator correspondante.
    router.push({
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      name: 'evaluator-evaluation-validation',
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      params: {
        //  Exécute cette ligne de logique propre à la partie évaluateur.
        interviewId:
          //  Ajoute cette valeur à la structure ou à la liste en cours.
          route.params.interviewId,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      },
    //  Ferme le bloc de configuration ou de traitement.
    })
  //  Gère l'erreur si le traitement précédent échoue.
  } catch {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    error.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      'Impossible d’enregistrer l’évaluation.'
  //  Exécute ce bloc dans tous les cas après l'action.
  } finally {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    saving.value = false
  //  Ferme le bloc de configuration ou de traitement.
  }
//  Ferme le bloc de configuration ou de traitement.
}

//  Déclare la fonction goBack pour isoler un traitement évaluateur.
function goBack() {
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  router.back()
//  Ferme le bloc de configuration ou de traitement.
}

//  Lance ce traitement au montage du composant.
onMounted(loadData)
</script>

<template>
  <!--  Définit le conteneur principal de la page évaluateur. -->
  <main
    class="min-h-screen bg-[#F8FBFC] px-5 py-20 lg:px-10 lg:py-10"
  >
    <!--  Structure un groupe d’éléments visuels. -->
    <div
      v-if="loading"
      class="rounded-3xl border border-[#64CCC9]/20 bg-white py-20 text-center text-sm font-bold text-[#00313C]/50"
    >
      <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
      Chargement de l'évaluation...
    <!--  Ferme l’élément div. -->
    </div>

    <div
      v-else-if="error && !interview"
      class="rounded-2xl border border-[#E40046]/20 bg-[#E40046]/5 p-4 text-sm font-bold text-[#E40046]"
    >
      <!--  Affiche une donnée dynamique dans l’interface. -->
      {{ error }}
    <!--  Ferme l’élément div. -->
    </div>

    <form
      v-else
      class="space-y-6 rounded-[2rem] border border-[#64CCC9]/20 bg-white p-6 lg:p-10"
      @submit.prevent="submit"
    >

      <!--  Structure un groupe d’éléments visuels. -->
      <div
        v-if="error"
        class="rounded-2xl border border-[#E40046]/20 bg-[#E40046]/5 p-4 text-sm font-bold text-[#E40046]"
      >
        <!--  Affiche une donnée dynamique dans l’interface. -->
        {{ error }}
      <!--  Ferme l’élément div. -->
      </div>

    <!-- ======================================================
         TITRE
         ====================================================== -->

    <!--  Structure un groupe d’éléments visuels. -->
    <div>
      <!--  Affiche une information courte ou décorative. -->
      <span
        class="inline-flex rounded-full bg-[#E40046]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20 sm:px-4 sm:py-2 sm:text-xs"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        ÉVALUATION
      <!--  Ferme l’élément span. -->
      </span>

      <!--  Affiche un titre de section. -->
      <h2
        class="mt-3 text-2xl font-black tracking-tight text-[#00313C] sm:text-3xl"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Évaluer le candidat
      <!--  Ferme l’élément h2. -->
      </h2>

      <!--  Affiche un paragraphe de texte. -->
      <p
        v-if="candidate"
        class="mt-2 text-sm font-black text-[#00313C]/70"
      >
        <!--  Affiche une donnée dynamique dans l’interface. -->
        {{ candidate.firstName }}
        <!--  Affiche une donnée dynamique dans l’interface. -->
        {{ candidate.lastName }}
      <!--  Ferme l’élément p. -->
      </p>

      <!--  Affiche un paragraphe de texte. -->
      <p
        class="mt-2 max-w-2xl text-xs font-semibold leading-5 text-[#00313C]/55 sm:text-sm sm:leading-6"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Choisissez le type d’entretien pour afficher les questions
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        correspondantes.
      <!--  Ferme l’élément p. -->
      </p>
    <!--  Ferme l’élément div. -->
    </div>


    <!-- ======================================================
         TYPE D'ENTRETIEN
         ====================================================== -->

    <!--  Délimite une zone fonctionnelle de la page. -->
    <section>
      <!--  Structure un groupe d’éléments visuels. -->
      <div class="mb-3">
        <!--  Affiche un sous-titre ou un nom important. -->
        <h3
          class="text-xs font-black uppercase tracking-wider text-[#00313C] sm:text-sm"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          Type d’entretien
        <!--  Ferme l’élément h3. -->
        </h3>

        <!--  Affiche un paragraphe de texte. -->
        <p
          class="mt-1 text-xs font-medium text-[#00313C]/50"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          Sélectionnez le type d’évaluation.
        <!--  Ferme l’élément p. -->
        </p>
      <!--  Ferme l’élément div. -->
      </div>


      <!-- CARTES TYPE -->

      <!--  Structure un groupe d’éléments visuels. -->
      <div
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >

        <!-- MOTIVATION -->

        <!--  Affiche un bouton d’action pour l’utilisateur. -->
        <button
          type="button"
          class="group min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4"
          :class="selectedType === 'motivation' ? 'border-[#E40046] bg-[#E40046]/5 ring-2 ring-[#E40046]/10' : 'border-[#64CCC9]/20 bg-white hover:-translate-y-0.5 hover:border-[#64CCC9]/40 '"
          @click="selectType('motivation')"
        >

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="mb-3 grid h-9 w-9 place-items-center rounded-lg"
            :class="selectedType === 'motivation' ? 'bg-[#E40046] text-white' : 'bg-[#E40046]/10 text-[#E40046]'"
          >
            <!--  Affiche ou configure l’élément svg. -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <!--  Affiche ou configure l’élément path. -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z"
              />
            <!--  Ferme l’élément svg. -->
            </svg>
          <!--  Ferme l’élément div. -->
          </div>

          <!--  Affiche ou configure l’élément h4. -->
          <h4 class="text-sm font-black text-[#00313C]">
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Motivation
          <!--  Ferme l’élément h4. -->
          </h4>

          <!--  Affiche un paragraphe de texte. -->
          <p
            class="mt-1.5 text-[11px] font-semibold leading-4 text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Motivation, projet professionnel et engagement.
          <!--  Ferme l’élément p. -->
          </p>
        <!--  Ferme l’élément button. -->
        </button>


        <!-- TECHNIQUE -->

        <!--  Affiche un bouton d’action pour l’utilisateur. -->
        <button
          type="button"
          class="group min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4"
          :class="selectedType === 'technique' ? 'border-[#00313C] bg-[#00313C]/5 ring-2 ring-[#00313C]/10' : 'border-[#64CCC9]/20 bg-white hover:-translate-y-0.5 hover:border-[#64CCC9]/40 '"
          @click="selectType('technique')"
        >

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="mb-3 grid h-9 w-9 place-items-center rounded-lg"
            :class="selectedType === 'technique' ? 'bg-[#00313C] text-white' : 'bg-[#64CCC9]/15 text-[#00313C]'"
          >
            <!--  Affiche ou configure l’élément svg. -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <!--  Affiche ou configure l’élément path. -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8 9 3-3 3 3-3 3-3-3Z"
              />

              <!--  Affiche ou configure l’élément path. -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14 15 3-3 3 3-3 3-3-3Z"
              />

              <!--  Affiche ou configure l’élément path. -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 19h14"
              />
            <!--  Ferme l’élément svg. -->
            </svg>
          <!--  Ferme l’élément div. -->
          </div>

          <!--  Affiche ou configure l’élément h4. -->
          <h4 class="text-sm font-black text-[#00313C]">
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Technique
          <!--  Ferme l’élément h4. -->
          </h4>

          <!--  Affiche un paragraphe de texte. -->
          <p
            class="mt-1.5 text-[11px] font-semibold leading-4 text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Compétences techniques et résolution de problèmes.
          <!--  Ferme l’élément p. -->
          </p>
        <!--  Ferme l’élément button. -->
        </button>


        <!-- FINAL -->

        <!--  Affiche un bouton d’action pour l’utilisateur. -->
        <button
          type="button"
          class="group min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4"
          :class="selectedType === 'final' ? 'border-[#64CCC9] bg-[#64CCC9]/10 ring-2 ring-[#64CCC9]/20' : 'border-[#64CCC9]/20 bg-white hover:-translate-y-0.5 hover:border-[#64CCC9]/40 '"
          @click="selectType('final')"
        >

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="mb-3 grid h-9 w-9 place-items-center rounded-lg"
            :class="selectedType === 'final' ? 'bg-[#64CCC9] text-[#00313C]' : 'bg-[#64CCC9]/15 text-[#00313C]'"
          >
            <!--  Affiche ou configure l’élément svg. -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <!--  Affiche ou configure l’élément path. -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5 12 4 4L19 6"
              />
            <!--  Ferme l’élément svg. -->
            </svg>
          <!--  Ferme l’élément div. -->
          </div>

          <!--  Affiche ou configure l’élément h4. -->
          <h4 class="text-sm font-black text-[#00313C]">
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Final
          <!--  Ferme l’élément h4. -->
          </h4>

          <!--  Affiche un paragraphe de texte. -->
          <p
            class="mt-1.5 text-[11px] font-semibold leading-4 text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Synthèse et dernière évaluation du candidat.
          <!--  Ferme l’élément p. -->
          </p>
        <!--  Ferme l’élément button. -->
        </button>

      <!--  Ferme l’élément div. -->
      </div>
    <!--  Ferme l’élément section. -->
    </section>


    <!-- ======================================================
         MESSAGE SI AUCUN TYPE
         ====================================================== -->

    <!--  Structure un groupe d’éléments visuels. -->
    <div
      v-if="!selectedType"
      class="rounded-xl border border-dashed border-[#64CCC9]/30 bg-[#64CCC9]/5 p-6 text-center"
    >
      <!--  Affiche un paragraphe de texte. -->
      <p
        class="text-sm font-bold text-[#00313C]/60"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Sélectionnez un type d’entretien pour commencer.
      <!--  Ferme l’élément p. -->
      </p>
    <!--  Ferme l’élément div. -->
    </div>


    <!-- ======================================================
         QUESTIONS
         ====================================================== -->

    <section
      v-else
      class="space-y-4"
    >

      <!-- EN-TÊTE QUESTIONS -->

      <!--  Structure un groupe d’éléments visuels. -->
      <div
        class="flex flex-col gap-3 rounded-xl border border-[#64CCC9]/20 bg-[#64CCC9]/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      >

        <!--  Structure un groupe d’éléments visuels. -->
        <div class="min-w-0">
          <!--  Affiche un sous-titre ou un nom important. -->
          <h3
            class="text-sm font-black text-[#00313C]"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Questions — {{ selectedType }}
          <!--  Ferme l’élément h3. -->
          </h3>

          <!--  Affiche un paragraphe de texte. -->
          <p
            class="mt-1 text-xs font-semibold text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Notez chaque réponse de 0 à 5.
          <!--  Ferme l’élément p. -->
          </p>
        <!--  Ferme l’élément div. -->
        </div>


        <!-- PROGRESSION -->

        <!--  Structure un groupe d’éléments visuels. -->
        <div class="w-full sm:w-[160px] sm:shrink-0">

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="mb-1.5 flex justify-between text-[10px] font-black"
          >
            <!--  Affiche une information courte ou décorative. -->
            <span class="text-[#00313C]/50">
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              Progression
            <!--  Ferme l’élément span. -->
            </span>

            <!--  Affiche une information courte ou décorative. -->
            <span class="text-[#E40046]">
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ answeredQuestions.length }}/{{ currentQuestions.length }}
            <!--  Ferme l’élément span. -->
            </span>
          <!--  Ferme l’élément div. -->
          </div>

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="h-1.5 overflow-hidden rounded-full bg-[#00313C]/10"
          >
            <!--  Structure un groupe d’éléments visuels. -->
            <div
              class="h-full rounded-full bg-[#E40046] transition-all duration-300"
              :style="{ width: `${progress}%` }"
            />
          <!--  Ferme l’élément div. -->
          </div>

        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément div. -->
      </div>


      <!-- ====================================================
           QUESTION
           ==================================================== -->

      <!--  Affiche une carte ou un bloc de contenu autonome. -->
      <article
        v-for="(question, index) in currentQuestions"
        :key="question.id"
        class="rounded-xl border border-[#64CCC9]/20 bg-white p-4 transition-all duration-200 hover:border-[#64CCC9]/40 sm:p-5"
      >

        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >

          <!-- QUESTION -->

          <!--  Structure un groupe d’éléments visuels. -->
          <div class="min-w-0 flex-1">

            <!--  Structure un groupe d’éléments visuels. -->
            <div class="mb-2.5 flex items-center gap-2">

              <!--  Affiche une information courte ou décorative. -->
              <span
                class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#00313C] text-[10px] font-black text-white"
              >
                <!--  Affiche une donnée dynamique dans l’interface. -->
                {{ index + 1 }}
              <!--  Ferme l’élément span. -->
              </span>

              <!--  Affiche une information courte ou décorative. -->
              <span
                class="text-[10px] font-black uppercase tracking-wider text-[#E40046]"
              >
                <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
                Question {{ index + 1 }}
              <!--  Ferme l’élément span. -->
              </span>

            <!--  Ferme l’élément div. -->
            </div>

            <!--  Affiche un paragraphe de texte. -->
            <p
              class="text-sm font-black leading-6 text-[#00313C] sm:text-[15px]"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ question.text }}
            <!--  Ferme l’élément p. -->
            </p>


            <!-- RÉPONSE -->

            <!--  Affiche une zone de saisie longue. -->
            <textarea
              v-model="answers[question.id]"
              rows="3"
              placeholder="Saisissez les observations et la réponse du candidat..."
              class="mt-3 w-full resize-none rounded-xl border border-[#64CCC9]/25 bg-[#64CCC9]/5 px-3.5 py-2.5 text-xs font-medium text-[#00313C] outline-none transition-all placeholder:text-[#00313C]/35 focus:border-[#E40046] focus:bg-white focus:ring-4 focus:ring-[#E40046]/10 sm:text-sm"
            />
          <!--  Ferme l’élément div. -->
          </div>


          <!-- NOTE -->

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="w-full shrink-0 rounded-xl border border-[#E40046]/15 bg-[#E40046]/5 p-3 lg:w-[180px]"
          >

            <!--  Structure un groupe d’éléments visuels. -->
            <div
              class="mb-2.5 flex items-center justify-between"
            >

              <!--  Affiche une information courte ou décorative. -->
              <span
                class="text-[10px] font-black uppercase tracking-wider text-[#00313C]"
              >
                <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
                Note
              <!--  Ferme l’élément span. -->
              </span>

              <!--  Affiche une information courte ou décorative. -->
              <span
                class="text-[10px] font-black text-[#00313C]/45"
              >
                <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
                /5
              <!--  Ferme l’élément span. -->
              </span>

            <!--  Ferme l’élément div. -->
            </div>


            <!-- NOTES -->

            <!--  Structure un groupe d’éléments visuels. -->
            <div
              class="flex gap-1.5"
            >

              <!--  Affiche un bouton d’action pour l’utilisateur. -->
              <button
                v-for="note in 5"
                :key="note"
                type="button"
                class="grid h-8 w-8 place-items-center rounded-lg border text-xs font-black transition-all duration-150"
                :class="Number(notes[question.id]) >= note ? 'border-[#E40046] bg-[#E40046] text-white ' : 'border-[#E40046]/20 bg-white text-[#E40046] hover:border-[#E40046]/50 hover:bg-[#E40046]/10'"
                @click="setNote(question.id, note)"
              >
                <!--  Affiche une donnée dynamique dans l’interface. -->
                {{ note }}
              <!--  Ferme l’élément button. -->
              </button>

            <!--  Ferme l’élément div. -->
            </div>


            <!--  Affiche un paragraphe de texte. -->
            <p
              class="mt-2 text-[10px] font-semibold text-[#00313C]/45"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              1 = faible · 5 = excellent
            <!--  Ferme l’élément p. -->
            </p>

          <!--  Ferme l’élément div. -->
          </div>

        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément article. -->
      </article>


      <!-- ====================================================
           COMMENTAIRE GLOBAL
           ==================================================== -->

      <!--  Délimite une zone fonctionnelle de la page. -->
      <section
        class="rounded-xl border border-[#64CCC9]/20 bg-white p-4 sm:p-5"
      >

        <!--  Associe un libellé à un champ. -->
        <label
          for="global-comment"
          class="block text-sm font-black text-[#00313C]"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          Commentaire général
        <!--  Ferme l’élément label. -->
        </label>

        <!--  Affiche un paragraphe de texte. -->
        <p
          class="mt-1 text-[11px] font-semibold text-[#00313C]/45"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          Ajoutez votre appréciation générale sur l’entretien.
        <!--  Ferme l’élément p. -->
        </p>

        <!--  Affiche une zone de saisie longue. -->
        <textarea
          id="global-comment"
          v-model="globalComment"
          rows="3"
          placeholder="Votre appréciation générale..."
          class="mt-3 w-full resize-none rounded-xl border border-[#64CCC9]/25 bg-[#64CCC9]/5 px-3.5 py-2.5 text-xs font-medium text-[#00313C] outline-none transition-all placeholder:text-[#00313C]/35 focus:border-[#E40046] focus:bg-white focus:ring-4 focus:ring-[#E40046]/10 sm:text-sm"
        />

      <!--  Ferme l’élément section. -->
      </section>


      <!-- ====================================================
           RÉSUMÉ DU SCORE
           ==================================================== -->

      <!--  Délimite une zone fonctionnelle de la page. -->
      <section
        class="grid gap-3 sm:grid-cols-2"
      >

        <!-- SCORE GLOBAL 

        <div
          class="rounded-xl border border-[#00313C]/10 bg-[#00313C] p-4 text-white"
        >

          <span
            class="text-[10px] font-black uppercase tracking-wider text-white/55"
          >
            Score global
          </span>

          <div
            class="mt-1 flex items-baseline gap-1.5"
          >

            <strong
              class="text-3xl font-black"
            >
              {{ totalScore }}
            </strong>

            <span
              class="text-sm font-bold text-white/50"
            >
              /100
            </span>

          </div>

        </div>
-->

        <!-- MOYENNE -->

        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="rounded-xl border border-[#E40046]/15 bg-[#E40046]/5 p-4"
        >

          <!--  Affiche une information courte ou décorative. -->
          <span
            class="text-[10px] font-black uppercase tracking-wider text-[#E40046]"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Moyenne
          <!--  Ferme l’élément span. -->
          </span>

          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="mt-1 flex items-baseline gap-1.5"
          >

            <!--  Met en avant une valeur importante. -->
            <strong
              class="text-3xl font-black text-[#00313C]"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ averageScore }}
            <!--  Ferme l’élément strong. -->
            </strong>

            <!--  Affiche une information courte ou décorative. -->
            <span
              class="text-sm font-bold text-[#00313C]/45"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              /5
            <!--  Ferme l’élément span. -->
            </span>

          <!--  Ferme l’élément div. -->
          </div>

        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément section. -->
      </section>


      <!-- ====================================================
           MESSAGE ERREUR
           ==================================================== -->

      <!--  Structure un groupe d’éléments visuels. -->
      <div
        v-if="touched && !isComplete"
        class="rounded-xl border border-[#E40046]/20 bg-[#E40046]/5 p-3"
      >

        <!--  Affiche un paragraphe de texte. -->
        <p
          class="text-xs font-bold leading-5 text-[#E40046]"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          Veuillez répondre à toutes les questions et attribuer
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          une note à chacune avant de valider l’entretien.
        <!--  Ferme l’élément p. -->
        </p>

      <!--  Ferme l’élément div. -->
      </div>


      <!-- ====================================================
           ACTION
           ==================================================== -->

      <!--  Structure un groupe d’éléments visuels. -->
      <div
        class="flex flex-col-reverse gap-3 border-t border-[#64CCC9]/20 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >

        <!--  Affiche un bouton d’action pour l’utilisateur. -->
        <button
          type="button"
          class="h-10 rounded-xl border border-[#00313C]/15 bg-white px-5 text-xs font-black text-[#00313C] transition-all duration-200 hover:border-[#E40046]/30 hover:bg-[#E40046] hover:text-white"
          @click="goBack"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          ← Retour
        <!--  Ferme l’élément button. -->
        </button>


        <!--  Affiche un bouton d’action pour l’utilisateur. -->
        <button
          type="submit"
          class="h-10 rounded-xl bg-[#00313C] px-6 text-xs font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E40046] disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!isComplete || saving"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{
            saving
              ? 'Enregistrement...'
              : 'Valider l’évaluation'
          }}

          <!--  Affiche une information courte ou décorative. -->
          <span class="ml-1.5 text-[#64CCC9]">
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            →
          <!--  Ferme l’élément span. -->
          </span>
        <!--  Ferme l’élément button. -->
        </button>

      <!--  Ferme l’élément div. -->
      </div>

    <!--  Ferme l’élément section. -->
    </section>

    <!--  Ferme l’élément form. -->
    </form>
  <!--  Ferme l’élément main. -->
  </main>
</template>
