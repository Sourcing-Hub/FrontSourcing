<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  fetchInterview,
  fetchCandidate,
  fetchEvaluation,
  saveEvaluation,
  validateEvaluation,
} from '@/services/evaluator'

/* =========================================================
   ROUTER
========================================================= */

const route = useRoute()
const router = useRouter()

/* =========================================================
   STATE
========================================================= */

const loading = ref(true)
const saving = ref(false)
const validating = ref(false)

const error = ref('')
const successMessage = ref('')

const touched = ref(false)

const interview = ref(null)
const candidate = ref(null)
const evaluation = ref(null)

const questions = ref([])

const answers = ref({})
const notes = ref({})

const globalComment = ref('')

/* =========================================================
   INTERVIEW ID
========================================================= */

const interviewId = computed(() => {
  const value =
    route.params.interviewId ||
    route.params.id ||
    ''

  return Array.isArray(value)
    ? value[0]
    : value
})

/* =========================================================
   TYPE D'ENTRETIEN
========================================================= */

/*
 * Le backend fournit :
 *
 * motivation
 * technique
 *
 * On ne permet pas de changer le type.
 */
const selectedType = computed(() => {
  return interview.value?.type || ''
})

const selectedTypeLabel = computed(() => {
  if (selectedType.value === 'motivation') {
    return 'Entretien de motivation'
  }

  if (selectedType.value === 'technique') {
    return 'Entretien technique'
  }

  return 'Entretien'
})

/* =========================================================
   QUESTIONS
========================================================= */

const currentQuestions = computed(() => {
  return Array.isArray(questions.value)
    ? questions.value
    : []
})

/* =========================================================
   PROGRESSION
========================================================= */

const answeredQuestions = computed(() => {
  return currentQuestions.value.filter((question) => {
    const id = String(question.id)

    const answer = answers.value[id]
    const note = notes.value[id]

    const hasAnswer =
      answer !== undefined &&
      answer !== null &&
      String(answer).trim() !== ''

    const hasNote =
      note !== undefined &&
      note !== null &&
      note !== ''

    return hasAnswer && hasNote
  })
})

const progress = computed(() => {
  if (!currentQuestions.value.length) {
    return 0
  }

  return Math.round(
    (
      answeredQuestions.value.length /
      currentQuestions.value.length
    ) * 100
  )
})

const isComplete = computed(() => {
  return (
    currentQuestions.value.length > 0 &&
    answeredQuestions.value.length ===
      currentQuestions.value.length
  )
})

/* =========================================================
   SCORE
========================================================= */

const totalScore = computed(() => {
  return currentQuestions.value.reduce(
    (total, question) => {
      const note = Number(
        notes.value[String(question.id)]
      )

      if (Number.isNaN(note)) {
        return total
      }

      return total + note
    },
    0
  )
})

const maxScore = computed(() => {
  return currentQuestions.value.reduce(
    (total, question) => {
      return (
        total +
        Number(question.maxScore || 0)
      )
    },
    0
  )
})

const averageScore = computed(() => {
  if (!currentQuestions.value.length) {
    return 0
  }

  return Number(
    (
      totalScore.value /
      currentQuestions.value.length
    ).toFixed(2)
  )
})

const scorePercentage = computed(() => {
  if (!maxScore.value) {
    return 0
  }

  return Math.round(
    (
      totalScore.value /
      maxScore.value
    ) * 100
  )
})

/* =========================================================
   MODIFICATION REPONSE
========================================================= */

const updateAnswer = (
  questionId,
  value
) => {
  const id = String(questionId)

  answers.value = {
    ...answers.value,
    [id]: value,
  }
}

/* =========================================================
   NOTE
========================================================= */

const setNote = (
  questionId,
  note
) => {
  const id = String(questionId)

  notes.value = {
    ...notes.value,
    [id]: Number(note),
  }

  touched.value = true
}

/* =========================================================
   CHARGEMENT
========================================================= */

const loadData = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    console.log(
      '===================================='
    )

    console.log(
      'EvaluationView - route params :',
      route.params
    )

    console.log(
      'EvaluationView - interviewId :',
      interviewId.value
    )

    console.log(
      '===================================='
    )

    if (!interviewId.value) {
      throw new Error(
        "ID de l'entretien introuvable dans l'URL."
      )
    }

    /* -----------------------------------------------------
       1. ENTRETIEN
    ----------------------------------------------------- */

    const interviewData =
      await fetchInterview(
        interviewId.value
      )

    console.log(
      'Entretien récupéré :',
      interviewData
    )

    interview.value =
      interviewData

    /* -----------------------------------------------------
       2. CANDIDAT
    ----------------------------------------------------- */

    if (!interviewData.candidateId) {
      throw new Error(
        "L'entretien ne contient pas de candidateId."
      )
    }

    const candidateData =
      await fetchCandidate(
        interviewData.candidateId
      )

    console.log(
      'Candidat récupéré :',
      candidateData
    )

    candidate.value =
      candidateData

    /* -----------------------------------------------------
       3. EVALUATION
    ----------------------------------------------------- */

    const evaluationData =
      await fetchEvaluation(
        interviewId.value
      )

    console.log(
      'Evaluation récupérée :',
      evaluationData
    )

    evaluation.value =
      evaluationData

    /* -----------------------------------------------------
       4. QUESTIONS
    ----------------------------------------------------- */

    questions.value =
      Array.isArray(
        evaluationData.questions
      )
        ? evaluationData.questions
        : []

    /* -----------------------------------------------------
       5. REPONSES EXISTANTES
    ----------------------------------------------------- */

    answers.value = {
      ...(evaluationData.answers || {}),
    }

    /* -----------------------------------------------------
       6. NOTES EXISTANTES
    ----------------------------------------------------- */

    notes.value = {
      ...(evaluationData.notes || {}),
    }

    /* -----------------------------------------------------
       7. COMMENTAIRE
    ----------------------------------------------------- */

    globalComment.value =
      evaluationData.comment || ''

    console.log(
      'Type entretien :',
      selectedType.value
    )

    console.log(
      'Questions :',
      questions.value
    )

  } catch (err) {
    console.error(
      'Erreur chargement EvaluationView :',
      err
    )

    error.value =
      err?.response?.data?.detail ||
      err?.message ||
      "Impossible de charger l'évaluation."
  } finally {
    loading.value = false
  }
}

/* =========================================================
   ENREGISTREMENT
========================================================= */

const submit = async () => {
  touched.value = true
  error.value = ''
  successMessage.value = ''

  if (!interviewId.value) {
    error.value =
      "ID de l'entretien manquant."

    return false
  }

  if (!currentQuestions.value.length) {
    error.value =
      "Aucune question n'est configurée pour cet entretien."

    return false
  }

  if (!isComplete.value) {
    error.value =
      'Veuillez répondre à toutes les questions et attribuer une note à chacune.'

    return false
  }

  saving.value = true

  try {
    const payload = {
      answers: {
        ...answers.value,
      },

      notes: {
        ...notes.value,
      },

      score: totalScore.value,

      averageScore:
        averageScore.value,

      comment:
        globalComment.value,
    }

    console.log(
      'Payload envoyé :',
      payload
    )

    const response =
      await saveEvaluation(
        interviewId.value,
        payload
      )

    console.log(
      'Evaluation enregistrée :',
      response
    )

    evaluation.value =
      response

    successMessage.value =
      'Évaluation enregistrée avec succès.'

    return true

  } catch (err) {
    console.error(
      'Erreur sauvegarde :',
      err
    )

    error.value =
      err?.response?.data?.detail ||
      "Impossible d'enregistrer l'évaluation."

    return false

  } finally {
    saving.value = false
  }
}

/* =========================================================
   VALIDATION DEFINITIVE
========================================================= */

const handleValidate = async () => {
  touched.value = true
  error.value = ''
  successMessage.value = ''

  if (!isComplete.value) {
    error.value =
      'Toutes les questions doivent être répondues et notées avant validation.'

    return
  }

  validating.value = true

  try {
    /*
     * 1. Enregistrer les réponses
     */
    const saved =
      await submit()

    if (!saved) {
      return
    }

    /*
     * 2. Valider définitivement
     */
    const response =
      await validateEvaluation(
        interviewId.value
      )

    console.log(
      'Evaluation validée :',
      response
    )

    successMessage.value =
      'L’entretien a été validé avec succès.'

    /*
     * Petite pause visuelle puis retour
     */
    setTimeout(() => {
      router.push({
        name: 'evaluator-interviews',
      })
    }, 700)

  } catch (err) {
    console.error(
      'Erreur validation :',
      err
    )

    error.value =
      err?.response?.data?.detail ||
      "Impossible de valider l'entretien."

  } finally {
    validating.value = false
  }
}

/* =========================================================
   RETOUR
========================================================= */

const goBack = () => {
  router.back()
}

/* =========================================================
   INITIALISATION
========================================================= */

onMounted(() => {
  loadData()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#F8FBFC] px-5 py-20 lg:px-10 lg:py-10"
  >

    <!-- =====================================================
         CHARGEMENT
    ====================================================== -->

    <div
      v-if="loading"
      class="rounded-3xl border border-[#64CCC9]/20 bg-white py-20 text-center shadow-xl shadow-[#00313C]/1"
    >
      <p
        class="text-sm font-bold text-[#00313C]/50"
      >
        Chargement de l’évaluation...
      </p>
    </div>

    <!-- =====================================================
         ERREUR GENERALE
    ====================================================== -->

    <div
      v-else-if="error && !interview"
      class="rounded-2xl border border-[#E40046]/20 bg-[#E40046]/5 p-5 text-sm font-bold text-[#E40046]"
    >
      {{ error }}

      <div class="mt-4">
        <button
          type="button"
          class="rounded-xl bg-[#00313C] px-5 py-2.5 text-xs font-black text-white"
          @click="loadData"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- =====================================================
         CONTENU
    ====================================================== -->

    <form
      v-else
      class="mx-auto max-w-6xl space-y-6 rounded-[2rem] border border-[#00313C]/20 bg-white p-6  lg:p-10"
      @submit.prevent="handleValidate"
    >

      <!-- ===================================================
           HEADER
      ==================================================== -->

      <div
        class="flex flex-col gap-5 border-b border-[#00313C]/15 pb-6 lg:flex-row lg:items-center lg:justify-between"
      >

        <div>

          <span
            class="inline-flex rounded-full bg-[#E40046]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20"
          >
            ÉVALUATION
          </span>

          <h1
            class="mt-3 text-2xl font-black tracking-tight text-[#00313C] sm:text-3xl"
          >
            Évaluer le candidat
          </h1>

          <p
            v-if="candidate"
            class="mt-2 text-sm font-black text-[#00313C]/70"
          >
            {{ candidate.firstName }}
            {{ candidate.lastName }}
          </p>

          <p
            v-if="interview"
            class="mt-1 text-xs font-semibold text-[#00313C]/50"
          >
            {{ selectedTypeLabel }}
          </p>

        </div>

        <button
          type="button"
          class="h-10 rounded-xl border border-[#00313C]/15 bg-white px-5 text-xs font-black text-[#00313C] transition hover:border-[#E40046]/30 hover:bg-[#E40046] hover:text-white"
          @click="goBack"
        >
          ← Retour
        </button>

      </div>

      <!-- ===================================================
           ERREUR
      ==================================================== -->

      <div
        v-if="error"
        class="rounded-2xl border border-[#E40046]/20 bg-[#E40046]/5 p-4 text-sm font-bold text-[#E40046]"
      >
        {{ error }}
      </div>

      <!-- ===================================================
           SUCCES
      ==================================================== -->

      <div
        v-if="successMessage"
        class="rounded-2xl border border-[#00313C]/30 bg-[#00313C]/10 p-4 text-sm font-bold text-[#00313C]"
      >
        {{ successMessage }}
      </div>

      <!-- ===================================================
           TYPE D'ENTRETIEN
      ==================================================== -->

      <section>
        <div
          class="mb-3"
        >
          <h2
            class="text-xs font-black uppercase tracking-wider text-[#00313C] sm:text-sm"
          >
            Type d’entretien
          </h2>

          <p
            class="mt-1 text-xs font-medium text-[#00313C]/50"
          >
            Le type est déterminé automatiquement par l’entretien convoqué.
          </p>
        </div>

        <div
          class="rounded-xl border border-[#64CCC9]/20 bg-[#64CCC9]/5 p-4"
        >
          <span
            class="inline-flex rounded-lg bg-[#00313C] px-4 py-2 text-xs font-black text-white"
          >
            {{ selectedTypeLabel }}
          </span>
        </div>
      </section>

      <!-- ===================================================
           PROGRESSION
      ==================================================== -->

      <section
        v-if="currentQuestions.length"
        class="rounded-xl border border-[#00313C]/20 bg-[#00313C]/5 p-4"
      >

        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >

          <div>
            <h2
              class="text-sm font-black text-[#00313C]"
            >
              Questions
            </h2>

            <p
              class="mt-1 text-xs font-semibold text-[#00313C]/50"
            >
              Répondez et attribuez une note à chaque question.
            </p>
          </div>

          <div
            class="text-xs font-black text-[#E40046]"
          >
            {{ answeredQuestions.length }}/{{ currentQuestions.length }}
          </div>

        </div>

        <div
          class="mt-3 h-2 overflow-hidden rounded-full bg-[#00313C]/10"
        >
          <div
            class="h-full rounded-full bg-[#E40046] transition-all duration-300"
            :style="{
              width: `${progress}%`,
            }"
          />
        </div>

        <p
          class="mt-2 text-right text-[10px] font-black text-[#00313C]/45"
        >
          {{ progress }} %
        </p>

      </section>

      <!-- ===================================================
           QUESTIONS
      ==================================================== -->

      <section
        v-if="currentQuestions.length"
        class="space-y-4"
      >

        <article
          v-for="(question, index) in currentQuestions"
          :key="question.id"
          class="rounded-xl border border-[#00313C]/20 bg-white p-4 transition hover:border-[#00313C]/40  sm:p-5"
        >

          <div
            class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
          >

            <!-- QUESTION + REPONSE -->

            <div
              class="min-w-0 flex-1"
            >

              <div
                class="mb-3 flex items-center gap-2"
              >
                <span
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#00313C] text-[10px] font-black text-white"
                >
                  {{ index + 1 }}
                </span>

                <span
                  class="text-[10px] font-black uppercase tracking-wider text-[#E40046]"
                >
                  Question {{ index + 1 }}
                </span>
              </div>

              <p
                class="text-sm font-black leading-6 text-[#00313C] sm:text-[15px]"
              >
                {{
                  question.text ||
                  question.question ||
                  question.contenu
                }}
              </p>

              <textarea
                :value="
                  answers[String(question.id)] || ''
                "
                rows="4"
                placeholder="Saisissez la réponse et vos observations..."
                class="mt-4 w-full resize-none rounded-xl border border-[#00313C]/25 bg-[#00313C]/5 px-3.5 py-3 text-xs font-medium text-[#00313C] outline-none transition placeholder:text-[#00313C]/35 focus:border-[#E40046] focus:bg-white focus:ring-4 focus:ring-[#E40046]/10 sm:text-sm"
                @input="
                  updateAnswer(
                    question.id,
                    $event.target.value
                  )
                "
              />

            </div>

            <!-- NOTE -->

            <div
              class="w-full shrink-0 rounded-xl border border-[#E40046]/15 bg-[#E40046]/5 p-3 lg:w-[190px]"
            >

              <div
                class="mb-3 flex items-center justify-between"
              >
                <span
                  class="text-[10px] font-black uppercase tracking-wider text-[#00313C]"
                >
                  Note
                </span>

                <span
                  class="text-[10px] font-black text-[#00313C]/45"
                >
                  /{{ question.maxScore || 5 }}
                </span>
              </div>

              <div
                class="flex flex-wrap gap-1.5"
              >

                <button
                  v-for="
                    note in Number(
                      question.maxScore || 5
                    )
                  "
                  :key="note"
                  type="button"
                  class="grid h-8 w-8 place-items-center rounded-lg border text-xs font-black transition"
                  :class="
                    Number(
                      notes[String(question.id)]
                    ) >= note
                      ? 'border-[#E40046] bg-[#E40046] text-white'
                      : 'border-[#E40046]/20 bg-white text-[#E40046] hover:border-[#E40046]/50 hover:bg-[#E40046]/10'
                  "
                  @click="
                    setNote(
                      question.id,
                      note
                    )
                  "
                >
                  {{ note }}
                </button>

              </div>

              <p
                class="mt-2 text-[10px] font-semibold text-[#00313C]/45"
              >
                Sélectionnez une note.
              </p>

            </div>

          </div>

        </article>

      </section>

      <!-- ===================================================
           AUCUNE QUESTION
      ==================================================== -->

      <div
        v-else
        class="rounded-xl border border-dashed border-[#00313C]/30 bg-[#00313C]/5 p-8 text-center"
      >
        <p
          class="text-sm font-bold text-[#00313C]/60"
        >
          Aucune question n’est configurée pour cet entretien.
        </p>
      </div>

      <!-- ===================================================
           COMMENTAIRE
      ==================================================== -->

      <section
        class="rounded-xl border border-[#00313C]/20 bg-white p-4 sm:p-5"
      >

        <label
          for="global-comment"
          class="block text-sm font-black text-[#00313C]"
        >
          Commentaire général
        </label>

        <p
          class="mt-1 text-[11px] font-semibold text-[#00313C]/45"
        >
          Ajoutez votre appréciation générale sur l’entretien.
        </p>

        <textarea
          id="global-comment"
          v-model="globalComment"
          rows="4"
          placeholder="Votre appréciation générale..."
          class="mt-3 w-full resize-none rounded-xl border border-[#00313C]/25 bg-[#00313C]/5 px-3.5 py-3 text-xs font-medium text-[#00313C] outline-none transition placeholder:text-[#00313C]/35 focus:border-[#E40046] focus:bg-white focus:ring-4 focus:ring-[#E40046]/10 sm:text-sm"
        />

      </section>

      <!-- ===================================================
           SCORE
      ==================================================== -->

      <section
        class="grid gap-3 sm:grid-cols-3"
      >

        <div
          class="rounded-xl border border-[#00313C]/10 bg-[#00313C] p-4 text-white"
        >
          <span
            class="text-[10px] font-black uppercase tracking-wider text-white/55"
          >
            Score
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
              /{{ maxScore }}
            </span>
          </div>
        </div>

        <div
          class="rounded-xl border border-[#E40046]/15 bg-[#E40046]/5 p-4"
        >
          <span
            class="text-[10px] font-black uppercase tracking-wider text-[#E40046]"
          >
            Moyenne
          </span>

          <div
            class="mt-1 flex items-baseline gap-1.5"
          >
            <strong
              class="text-3xl font-black text-[#00313C]"
            >
              {{ averageScore }}
            </strong>

            <span
              class="text-sm font-bold text-[#00313C]/45"
            >
              /5
            </span>
          </div>
        </div>

        <div
          class="rounded-xl border border-[#00313C]/20 bg-[#00313C]/5 p-4"
        >
          <span
            class="text-[10px] font-black uppercase tracking-wider text-[#00313C]/60"
          >
            Progression
          </span>

          <div
            class="mt-1 flex items-baseline gap-1.5"
          >
            <strong
              class="text-3xl font-black text-[#00313C]"
            >
              {{ scorePercentage }}%
            </strong>
          </div>
        </div>

      </section>

      <!-- ===================================================
           MESSAGE VALIDATION
      ==================================================== -->

      <div
        v-if="touched && !isComplete"
        class="rounded-xl border border-[#E40046]/20 bg-[#E40046]/5 p-4"
      >
        <p
          class="text-xs font-bold leading-5 text-[#E40046]"
        >
          Veuillez répondre à toutes les questions et attribuer
          une note à chacune avant de valider l’entretien.
        </p>
      </div>

      <!-- ===================================================
           ACTIONS
      ==================================================== -->

      <div
        class="flex flex-col-reverse gap-3 border-t border-[#00313C]/20 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >

        <button
          type="button"
          class="h-10 rounded-xl border border-[#00313C]/15 bg-white px-5 text-xs font-black text-[#00313C] transition hover:border-[#E40046]/30 hover:bg-[#E40046] hover:text-white"
          @click="goBack"
        >
          ← Retour
        </button>

        <button
          type="submit"
          class="h-10 rounded-xl bg-[#00313C] px-6 text-xs font-black text-white  transition hover:-translate-y-0.5 hover:bg-[#E40046] disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="
            saving ||
            validating ||
            !isComplete ||
            !currentQuestions.length
          "
        >
          {{
            validating
              ? 'Validation...'
              : saving
                ? 'Enregistrement...'
                : 'Valider l’évaluation'
          }}

          <span
            class="ml-1.5 text-[#00313C]"
          >
            →
          </span>
        </button>

      </div>

    </form>
  </main>
</template>