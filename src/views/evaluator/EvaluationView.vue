<script setup>
import {
  computed,
  ref,
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

const emit = defineEmits(['save'])

// ============================================================
// TYPES D'ENTRETIEN
// ============================================================

const interviewTypes = [
  {
    value: 'motivation',
    label: 'Entretien motivation',
    description:
      'Évaluer la motivation, le projet et la capacité du candidat à se projeter.',
  },
  {
    value: 'technique',
    label: 'Entretien technique',
    description:
      'Évaluer les compétences techniques et la maîtrise des connaissances.',
  },
  {
    value: 'final',
    label: 'Entretien final',
    description:
      'Évaluation finale avant la décision de sélection.',
  },
]

// ============================================================
// QUESTIONS
// ============================================================

const questions = {
  motivation: [
    {
      id: 'motivation-1',
      text: 'Pourquoi souhaitez-vous rejoindre cette formation ?',
    },
    {
      id: 'motivation-2',
      text: 'Quel est votre projet professionnel ?',
    },
    {
      id: 'motivation-3',
      text: 'Pourquoi avez-vous choisi ce domaine ?',
    },
    {
      id: 'motivation-4',
      text: 'Comment réagissez-vous face aux difficultés ?',
    },
    {
      id: 'motivation-5',
      text: 'Qu’attendez-vous de cette formation ?',
    },
  ],

  technique: [
    {
      id: 'technique-1',
      text: 'Expliquez une réalisation technique dont vous êtes fier.',
    },
    {
      id: 'technique-2',
      text: 'Quelle est votre manière de résoudre un problème technique ?',
    },
    {
      id: 'technique-3',
      text: 'Comment apprenez-vous une nouvelle technologie ?',
    },
    {
      id: 'technique-4',
      text: 'Comment travaillez-vous avec Git et GitHub ?',
    },
    {
      id: 'technique-5',
      text: 'Comment testez-vous votre code avant de le livrer ?',
    },
  ],

  final: [
    {
      id: 'final-1',
      text: 'Pourquoi pensez-vous être un bon candidat pour cette opportunité ?',
    },
    {
      id: 'final-2',
      text: 'Quelles sont vos principales forces ?',
    },
    {
      id: 'final-3',
      text: 'Quels sont les points que vous souhaitez encore améliorer ?',
    },
    {
      id: 'final-4',
      text: 'Comment vous projetez-vous dans les prochaines années ?',
    },
    {
      id: 'final-5',
      text: 'Avez-vous des questions ou remarques avant la fin de l’entretien ?',
    },
  ],
}

// ============================================================
// ÉTAT
// ============================================================

const selectedType = ref(
  props.interview?.type ||
  props.evaluation?.type ||
  '',
)

const answers = ref({})
const notes = ref({})
const globalComment = ref('')

const touched = ref(false)

// ============================================================
// INITIALISATION
// ============================================================

function initializeEvaluation() {
  if (!props.evaluation) {
    return
  }

  selectedType.value =
    props.evaluation.type ||
    props.interview?.type ||
    ''

  globalComment.value =
    props.evaluation.comment ||
    props.evaluation.globalComment ||
    ''

  if (props.evaluation.answers) {
    answers.value = {
      ...props.evaluation.answers,
    }
  }

  if (props.evaluation.notes) {
    notes.value = {
      ...props.evaluation.notes,
    }
  }
}

initializeEvaluation()

watch(
  () => props.evaluation,
  initializeEvaluation,
  {
    deep: true,
  },
)

// ============================================================
// QUESTIONS ACTUELLES
// ============================================================

const currentQuestions = computed(() => {
  if (!selectedType.value) {
    return []
  }

  return questions[selectedType.value] || []
})

// ============================================================
// SCORE
// ============================================================

const answeredQuestions = computed(() => {
  return currentQuestions.value.filter(
    (question) =>
      notes.value[question.id] !== undefined &&
      notes.value[question.id] !== null &&
      notes.value[question.id] !== '',
  )
})

const totalScore = computed(() => {
  if (!answeredQuestions.value.length) {
    return 0
  }

  const total = answeredQuestions.value.reduce(
    (sum, question) => {
      return (
        sum +
        Number(notes.value[question.id] || 0)
      )
    },
    0,
  )

  return Math.round(
    (total /
      (currentQuestions.value.length * 5)) *
      100,
  )
})

const averageScore = computed(() => {
  if (!answeredQuestions.value.length) {
    return 0
  }

  const total = answeredQuestions.value.reduce(
    (sum, question) => {
      return (
        sum +
        Number(notes.value[question.id] || 0)
      )
    },
    0,
  )

  return (
    total /
    answeredQuestions.value.length
  ).toFixed(1)
})

// ============================================================
// PROGRESSION
// ============================================================

const progress = computed(() => {
  if (!currentQuestions.value.length) {
    return 0
  }

  return Math.round(
    (answeredQuestions.value.length /
      currentQuestions.value.length) *
      100,
  )
})

// ============================================================
// CHANGEMENT DU TYPE
// ============================================================

function selectType(type) {
  selectedType.value = type
  touched.value = false
}

// ============================================================
// NOTE
// ============================================================

function setNote(questionId, note) {
  notes.value = {
    ...notes.value,
    [questionId]: note,
  }
}

// ============================================================
// VALIDATION
// ============================================================

const isComplete = computed(() => {
  if (!selectedType.value) {
    return false
  }

  if (!currentQuestions.value.length) {
    return false
  }

  return (
    answeredQuestions.value.length ===
    currentQuestions.value.length
  )
})

// ============================================================
// ENREGISTREMENT
// ============================================================

function submit() {
  touched.value = true

  if (!selectedType.value) {
    return
  }

  if (!isComplete.value) {
    return
  }

  emit('save', {
    type: selectedType.value,

    answers: {
      ...answers.value,
    },

    notes: {
      ...notes.value,
    },

    score: totalScore.value,

    averageScore:
      Number(averageScore.value),

    comment: globalComment.value,
  })
}
</script>

<template>
  <form
    class="space-y-6 p-10" 
    @submit.prevent="submit"
  >

    <!-- ======================================================
         TITRE
         ====================================================== -->

    <div>
      <span
        class="inline-flex rounded-full bg-[#E40046]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20 sm:px-4 sm:py-2 sm:text-xs"
      >
        ÉVALUATION
      </span>

      <h2
        class="mt-3 text-2xl font-black tracking-tight text-[#00313C] sm:text-3xl"
      >
        Évaluer le candidat
      </h2>

      <p
        class="mt-2 max-w-2xl text-xs font-semibold leading-5 text-[#00313C]/55 sm:text-sm sm:leading-6"
      >
        Choisissez le type d’entretien pour afficher les questions
        correspondantes.
      </p>
    </div>


    <!-- ======================================================
         TYPE D'ENTRETIEN
         ====================================================== -->

    <section>
      <div class="mb-3">
        <h3
          class="text-xs font-black uppercase tracking-wider text-[#00313C] sm:text-sm"
        >
          Type d’entretien
        </h3>

        <p
          class="mt-1 text-xs font-medium text-[#00313C]/50"
        >
          Sélectionnez le type d’évaluation.
        </p>
      </div>


      <!-- CARTES TYPE -->

      <div
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >

        <!-- MOTIVATION -->

        <button
          type="button"
          class="group min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4"
          :class="
            selectedType === 'motivation'
              ? 'border-[#E40046] bg-[#E40046]/5 shadow-md shadow-[#E40046]/10 ring-2 ring-[#E40046]/10'
              : 'border-[#64CCC9]/20 bg-white hover:-translate-y-0.5 hover:border-[#64CCC9]/40 hover:shadow-md'
          "
          @click="selectType('motivation')"
        >

          <div
            class="mb-3 grid h-9 w-9 place-items-center rounded-lg"
            :class="
              selectedType === 'motivation'
                ? 'bg-[#E40046] text-white'
                : 'bg-[#E40046]/10 text-[#E40046]'
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z"
              />
            </svg>
          </div>

          <h4 class="text-sm font-black text-[#00313C]">
            Motivation
          </h4>

          <p
            class="mt-1.5 text-[11px] font-semibold leading-4 text-[#00313C]/50"
          >
            Motivation, projet professionnel et engagement.
          </p>
        </button>


        <!-- TECHNIQUE -->

        <button
          type="button"
          class="group min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4"
          :class="
            selectedType === 'technique'
              ? 'border-[#00313C] bg-[#00313C]/5 shadow-md shadow-[#00313C]/10 ring-2 ring-[#00313C]/10'
              : 'border-[#64CCC9]/20 bg-white hover:-translate-y-0.5 hover:border-[#64CCC9]/40 hover:shadow-md'
          "
          @click="selectType('technique')"
        >

          <div
            class="mb-3 grid h-9 w-9 place-items-center rounded-lg"
            :class="
              selectedType === 'technique'
                ? 'bg-[#00313C] text-white'
                : 'bg-[#64CCC9]/15 text-[#00313C]'
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8 9 3-3 3 3-3 3-3-3Z"
              />

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14 15 3-3 3 3-3 3-3-3Z"
              />

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 19h14"
              />
            </svg>
          </div>

          <h4 class="text-sm font-black text-[#00313C]">
            Technique
          </h4>

          <p
            class="mt-1.5 text-[11px] font-semibold leading-4 text-[#00313C]/50"
          >
            Compétences techniques et résolution de problèmes.
          </p>
        </button>


        <!-- FINAL -->

        <button
          type="button"
          class="group min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4"
          :class="
            selectedType === 'final'
              ? 'border-[#64CCC9] bg-[#64CCC9]/10 shadow-md shadow-[#64CCC9]/10 ring-2 ring-[#64CCC9]/20'
              : 'border-[#64CCC9]/20 bg-white hover:-translate-y-0.5 hover:border-[#64CCC9]/40 hover:shadow-md'
          "
          @click="selectType('final')"
        >

          <div
            class="mb-3 grid h-9 w-9 place-items-center rounded-lg"
            :class="
              selectedType === 'final'
                ? 'bg-[#64CCC9] text-[#00313C]'
                : 'bg-[#64CCC9]/15 text-[#00313C]'
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5 12 4 4L19 6"
              />
            </svg>
          </div>

          <h4 class="text-sm font-black text-[#00313C]">
            Final
          </h4>

          <p
            class="mt-1.5 text-[11px] font-semibold leading-4 text-[#00313C]/50"
          >
            Synthèse et dernière évaluation du candidat.
          </p>
        </button>

      </div>
    </section>


    <!-- ======================================================
         MESSAGE SI AUCUN TYPE
         ====================================================== -->

    <div
      v-if="!selectedType"
      class="rounded-xl border border-dashed border-[#64CCC9]/30 bg-[#64CCC9]/5 p-6 text-center"
    >
      <p
        class="text-sm font-bold text-[#00313C]/60"
      >
        Sélectionnez un type d’entretien pour commencer.
      </p>
    </div>


    <!-- ======================================================
         QUESTIONS
         ====================================================== -->

    <section
      v-else
      class="space-y-4"
    >

      <!-- EN-TÊTE QUESTIONS -->

      <div
        class="flex flex-col gap-3 rounded-xl border border-[#64CCC9]/20 bg-[#64CCC9]/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      >

        <div class="min-w-0">
          <h3
            class="text-sm font-black text-[#00313C]"
          >
            Questions — {{ selectedType }}
          </h3>

          <p
            class="mt-1 text-xs font-semibold text-[#00313C]/50"
          >
            Notez chaque réponse de 0 à 5.
          </p>
        </div>


        <!-- PROGRESSION -->

        <div class="w-full sm:w-[160px] sm:shrink-0">

          <div
            class="mb-1.5 flex justify-between text-[10px] font-black"
          >
            <span class="text-[#00313C]/50">
              Progression
            </span>

            <span class="text-[#E40046]">
              {{ answeredQuestions.length }}/{{ currentQuestions.length }}
            </span>
          </div>

          <div
            class="h-1.5 overflow-hidden rounded-full bg-[#00313C]/10"
          >
            <div
              class="h-full rounded-full bg-[#E40046] transition-all duration-300"
              :style="{ width: `${progress}%` }"
            />
          </div>

        </div>

      </div>


      <!-- ====================================================
           QUESTION
           ==================================================== -->

      <article
        v-for="(question, index) in currentQuestions"
        :key="question.id"
        class="rounded-xl border border-[#64CCC9]/20 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#64CCC9]/40 hover:shadow-md sm:p-5"
      >

        <div
          class="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >

          <!-- QUESTION -->

          <div class="min-w-0 flex-1">

            <div class="mb-2.5 flex items-center gap-2">

              <span
                class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#00313C] text-[10px] font-black text-white"
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
              {{ question.text }}
            </p>


            <!-- RÉPONSE -->

            <textarea
              v-model="answers[question.id]"
              rows="3"
              placeholder="Saisissez les observations et la réponse du candidat..."
              class="mt-3 w-full resize-none rounded-xl border border-[#64CCC9]/25 bg-[#64CCC9]/5 px-3.5 py-2.5 text-xs font-medium text-[#00313C] outline-none transition-all placeholder:text-[#00313C]/35 focus:border-[#E40046] focus:bg-white focus:ring-4 focus:ring-[#E40046]/10 sm:text-sm"
            />
          </div>


          <!-- NOTE -->

          <div
            class="w-full shrink-0 rounded-xl border border-[#E40046]/15 bg-[#E40046]/5 p-3 lg:w-[180px]"
          >

            <div
              class="mb-2.5 flex items-center justify-between"
            >

              <span
                class="text-[10px] font-black uppercase tracking-wider text-[#00313C]"
              >
                Note
              </span>

              <span
                class="text-[10px] font-black text-[#00313C]/45"
              >
                /5
              </span>

            </div>


            <!-- NOTES -->

            <div
              class="flex gap-1.5"
            >

              <button
                v-for="note in 5"
                :key="note"
                type="button"
                class="grid h-8 w-8 place-items-center rounded-lg border text-xs font-black transition-all duration-150"
                :class="
                  Number(notes[question.id]) >= note
                    ? 'border-[#E40046] bg-[#E40046] text-white shadow-sm shadow-[#E40046]/20'
                    : 'border-[#E40046]/20 bg-white text-[#E40046] hover:border-[#E40046]/50 hover:bg-[#E40046]/10'
                "
                @click="setNote(question.id, note)"
              >
                {{ note }}
              </button>

            </div>


            <p
              class="mt-2 text-[10px] font-semibold text-[#00313C]/45"
            >
              1 = faible · 5 = excellent
            </p>

          </div>

        </div>

      </article>


      <!-- ====================================================
           COMMENTAIRE GLOBAL
           ==================================================== -->

      <section
        class="rounded-xl border border-[#64CCC9]/20 bg-white p-4 shadow-sm sm:p-5"
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
          rows="3"
          placeholder="Votre appréciation générale..."
          class="mt-3 w-full resize-none rounded-xl border border-[#64CCC9]/25 bg-[#64CCC9]/5 px-3.5 py-2.5 text-xs font-medium text-[#00313C] outline-none transition-all placeholder:text-[#00313C]/35 focus:border-[#E40046] focus:bg-white focus:ring-4 focus:ring-[#E40046]/10 sm:text-sm"
        />

      </section>


      <!-- ====================================================
           RÉSUMÉ DU SCORE
           ==================================================== -->

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

      </section>


      <!-- ====================================================
           MESSAGE ERREUR
           ==================================================== -->

      <div
        v-if="touched && !isComplete"
        class="rounded-xl border border-[#E40046]/20 bg-[#E40046]/5 p-3"
      >

        <p
          class="text-xs font-bold leading-5 text-[#E40046]"
        >
          Veuillez répondre à toutes les questions et attribuer
          une note à chacune avant de valider l’entretien.
        </p>

      </div>


      <!-- ====================================================
           ACTION
           ==================================================== -->

      <div
        class="flex flex-col-reverse gap-3 border-t border-[#64CCC9]/20 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >

        <button
          type="button"
          class="h-10 rounded-xl border border-[#00313C]/15 bg-white px-5 text-xs font-black text-[#00313C] transition-all duration-200 hover:border-[#E40046]/30 hover:bg-[#E40046] hover:text-white"
          @click="$router.back()"
        >
          ← Retour
        </button>


        <button
          type="submit"
          class="h-10 rounded-xl bg-[#00313C] px-6 text-xs font-black text-white shadow-md shadow-[#00313C]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E40046] hover:shadow-lg hover:shadow-[#E40046]/20 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!isComplete"
        >
          Valider l’évaluation

          <span class="ml-1.5 text-[#64CCC9]">
            →
          </span>
        </button>

      </div>

    </section>

  </form>
</template>