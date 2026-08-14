<script setup>
import {
  computed,
  reactive,
  watch,
} from 'vue'

const props = defineProps({
  evaluation: {
    type: Object,
    default: null,
  },

  interview: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'save',
])

// ============================================================
// QUESTIONS TECHNIQUES
// ============================================================

const technicalQuestions = [
  {
    id: 'technical-1',
    question: 'Comment expliqueriez-vous votre démarche pour résoudre un problème technique ?',
  },
  {
    id: 'technical-2',
    question: 'Quelle est votre expérience avec les technologies utilisées dans cette formation ?',
  },
  {
    id: 'technical-3',
    question: 'Comment testez-vous et vérifiez-vous la qualité de votre code ?',
  },
  {
    id: 'technical-4',
    question: 'Comment réagissez-vous face à une erreur que vous ne comprenez pas ?',
  },
]

// ============================================================
// QUESTIONS MOTIVATION
// ============================================================

const motivationQuestions = [
  {
    id: 'motivation-1',
    question: 'Pourquoi souhaitez-vous intégrer cette formation ?',
  },
  {
    id: 'motivation-2',
    question: 'Quels sont vos objectifs professionnels ?',
  },
  {
    id: 'motivation-3',
    question: 'Qu’attendez-vous de cette formation ?',
  },
  {
    id: 'motivation-4',
    question: 'Comment comptez-vous vous investir dans la formation ?',
  },
]

// ============================================================
// QUESTIONS SELON LE TYPE D'ENTRETIEN
// ============================================================

const questions = computed(() => {
  if (props.interview?.type === 'technique') {
    return technicalQuestions
  }

  if (props.interview?.type === 'motivation') {
    return motivationQuestions
  }

  return []
})

// ============================================================
// FORMULAIRE
// ============================================================

const form = reactive({
  questions: {},

  recommendation: '',
})

// ============================================================
// INITIALISATION DES QUESTIONS
// ============================================================

function initializeQuestions() {
  form.questions = {}

  questions.value.forEach((question) => {
    form.questions[question.id] = {
      score: null,
      comment: '',
    }
  })
}

// ============================================================
// CHARGEMENT D'UNE ÉVALUATION EXISTANTE
// ============================================================

watch(
  [
    () => props.interview,
    () => props.evaluation,
  ],
  () => {
    initializeQuestions()

    if (!props.evaluation) {
      return
    }

    if (props.evaluation.questions) {
      Object.entries(
        props.evaluation.questions,
      ).forEach(
        ([questionId, value]) => {
          if (
            form.questions[questionId]
          ) {
            form.questions[questionId] = {
              score:
                value.score ?? null,

              comment:
                value.comment ?? '',
            }
          }
        },
      )
    }

    form.recommendation =
      props.evaluation.recommendation ??
      ''
  },
  {
    immediate: true,
  },
)

// ============================================================
// MODIFICATION DE LA NOTE
// ============================================================

function updateScore(
  questionId,
  value,
) {
  form.questions[questionId].score =
    value === ''
      ? null
      : Number(value)
}

// ============================================================
// MODIFICATION DU COMMENTAIRE
// ============================================================

function updateComment(
  questionId,
  value,
) {
  form.questions[questionId].comment =
    value
}

// ============================================================
// VALIDATION
// ============================================================

function validateForm() {
  for (const question of questions.value) {
    const answer =
      form.questions[question.id]

    if (
      answer.score === null ||
      answer.score === ''
    ) {
      return `Veuillez attribuer une note à la question : "${question.question}"`
    }

    if (
      !answer.comment ||
      !answer.comment.trim()
    ) {
      return `Veuillez ajouter un commentaire pour la question : "${question.question}"`
    }
  }

  if (!form.recommendation) {
    return 'Veuillez sélectionner une recommandation.'
  }

  return null
}

// ============================================================
// ENREGISTREMENT
// ============================================================

function submit() {
  const validationError =
    validateForm()

  if (validationError) {
    window.alert(validationError)
    return
  }

  emit('save', {
    interviewId:
      props.interview.id,

    interviewType:
      props.interview.type,

    questions: {
      ...form.questions,
    },

    recommendation:
      form.recommendation,
  })
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="submit"
  >

    <!-- =====================================================
         EN-TÊTE
    ====================================================== -->

    <div>
      <span
        class="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-indigo-700"
      >
        {{ interview.typeLabel }}
      </span>

      <h2
        class="mt-3 text-2xl font-black tracking-tight text-slate-950"
      >
        Évaluation de l'entretien
      </h2>

      <p
        class="mt-2 text-sm font-medium leading-6 text-slate-500"
      >
        Évaluez chaque question avec une note sur 10
        et ajoutez obligatoirement votre commentaire.
      </p>
    </div>


    <!-- =====================================================
         QUESTIONS
    ====================================================== -->

    <section class="space-y-4">

      <article
        v-for="(
          question,
          index
        ) in questions"
        :key="question.id"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >

        <!-- Question -->

        <div
          class="border-b border-slate-100 bg-slate-50/80 p-5"
        >

          <div
            class="flex items-start gap-3"
          >

            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-600 text-xs font-black text-white"
            >
              {{ index + 1 }}
            </span>

            <div>
              <span
                class="text-[11px] font-black uppercase tracking-wide text-slate-400"
              >
                Question {{ index + 1 }}
              </span>

              <h3
                class="mt-1 text-sm font-black leading-6 text-slate-900"
              >
                {{ question.question }}
              </h3>
            </div>

          </div>

        </div>


        <!-- Évaluation -->

        <div class="grid gap-5 p-5 md:grid-cols-[150px_1fr]">

          <!-- Note -->

          <div>
            <label
              class="block text-xs font-black uppercase tracking-wide text-slate-500"
            >
              Note
              <span class="text-rose-500">
                *
              </span>
            </label>

            <select
              class="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              :value="
                form.questions[question.id]?.score ?? ''
              "
              @change="
                updateScore(
                  question.id,
                  $event.target.value,
                )
              "
            >

              <option value="">
                Choisir
              </option>

              <option
                v-for="n in 10"
                :key="n"
                :value="n"
              >
                {{ n }} / 10
              </option>

            </select>
          </div>


          <!-- Commentaire -->

          <div>

            <label
              class="block text-xs font-black uppercase tracking-wide text-slate-500"
            >
              Commentaire
              <span class="text-rose-500">
                *
              </span>
            </label>

            <textarea
              class="mt-2 min-h-[100px] w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Expliquez votre appréciation pour cette réponse..."
              :value="
                form.questions[question.id]?.comment ?? ''
              "
              @input="
                updateComment(
                  question.id,
                  $event.target.value,
                )
              "
            />

            <p
              class="mt-1 text-[11px] font-medium text-slate-400"
            >
              Le commentaire est obligatoire.
            </p>

          </div>

        </div>

      </article>

    </section>


    <!-- =====================================================
         RECOMMANDATION
    ====================================================== -->

    <section
      class="rounded-3xl border border-slate-200 bg-white p-5"
    >

      <div>
        <h3
          class="text-sm font-black text-slate-900"
        >
          Recommandation finale
          <span class="text-rose-500">*</span>
        </h3>

        <p
          class="mt-1 text-xs font-medium text-slate-400"
        >
          Quelle est votre recommandation concernant ce candidat ?
        </p>
      </div>


      <div
        class="mt-4 grid gap-3 sm:grid-cols-3"
      >

        <label
          class="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition hover:border-emerald-300"
        >

          <input
            v-model="form.recommendation"
            type="radio"
            value="favorable"
            class="accent-emerald-600"
          />

          <span
            class="text-sm font-black text-emerald-700"
          >
            Favorable
          </span>

        </label>


        <label
          class="flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 transition hover:border-amber-300"
        >

          <input
            v-model="form.recommendation"
            type="radio"
            value="reserve"
            class="accent-amber-600"
          />

          <span
            class="text-sm font-black text-amber-700"
          >
            À revoir
          </span>

        </label>


        <label
          class="flex cursor-pointer items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 transition hover:border-rose-300"
        >

          <input
            v-model="form.recommendation"
            type="radio"
            value="defavorable"
            class="accent-rose-600"
          />

          <span
            class="text-sm font-black text-rose-700"
          >
            Défavorable
          </span>

        </label>

      </div>

    </section>


    <!-- =====================================================
         BOUTON
    ====================================================== -->

    <div
      class="flex justify-end border-t border-slate-100 pt-5"
    >

      <button
        type="submit"
        class="inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-600 px-7 text-sm font-black text-white shadow-lg shadow-indigo-500/15 transition hover:-translate-y-0.5 hover:bg-slate-950 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 active:scale-[0.98]"
      >
        Enregistrer l'évaluation →
      </button>

    </div>

  </form>
</template>