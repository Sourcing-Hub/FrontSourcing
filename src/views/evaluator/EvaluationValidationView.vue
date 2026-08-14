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

import EvaluationSummary
  from '@/components/evaluator/EvaluationSummary.vue'

import {
  fetchInterview,
  fetchCandidate,
  fetchEvaluation,
  validateEvaluation,
} from '@/api/evaluator'

const route = useRoute()
const router = useRouter()

const interview = ref(null)
const candidate = ref(null)
const evaluation = ref(null)

const loading = ref(true)
const validating = ref(false)
const error = ref('')

const isValidated = computed(
  () => evaluation.value?.validated,
)

async function loadData() {
  loading.value = true

  try {
    const interviewData =
      await fetchInterview(
        route.params.interviewId,
      )

    const [
      candidateData,
      evaluationData,
    ] = await Promise.all([
      fetchCandidate(
        interviewData.candidateId,
      ),

      fetchEvaluation(
        route.params.interviewId,
      ),
    ])

    interview.value =
      interviewData

    candidate.value =
      candidateData

    evaluation.value =
      evaluationData
  } catch (err) {
    error.value =
      'Impossible de charger les données.'
  } finally {
    loading.value = false
  }
}

async function validate() {
  validating.value = true
  error.value = ''

  try {
    const response =
      await validateEvaluation(
        route.params.interviewId,
      )

    evaluation.value =
      response.evaluation

    router.push({
      name: 'evaluator-interviews',
    })
  } catch (err) {
    error.value =
      'Impossible de valider l’évaluation.'
  } finally {
    validating.value = false
  }
}

function editEvaluation() {
  router.push({
    name: 'evaluator-evaluation',
    params: {
      interviewId:
        route.params.interviewId,
    },
  })
}

onMounted(loadData)
</script>

<template>
  <main class="page">

    <div
      v-if="loading"
      class="loading"
    >
      Chargement...
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <template v-else>

      <header class="header">

        <div>
          <span class="eyebrow">
            VALIDATION
          </span>

          <h1>
            Vérifier l'évaluation
          </h1>

          <p>
            {{ candidate.firstName }}
            {{ candidate.lastName }}
          </p>
        </div>

      </header>


      <section class="validation-layout">

        <div class="card">

          <div class="check">

            <span class="icon">
              ✓
            </span>

            <div>
              <strong>
                Évaluation complétée
              </strong>

              <p>
                Vérifiez les informations avant
                de valider définitivement.
              </p>
            </div>

          </div>


          <EvaluationSummary
            :evaluation="evaluation"
          />

        </div>


        <aside class="actions">

          <button
            type="button"
            class="secondary"
            @click="editEvaluation"
          >
            Modifier l'évaluation
          </button>

          <button
            type="button"
            class="primary"
            :disabled="
              validating ||
              isValidated
            "
            @click="validate"
          >
            {{
              isValidated
                ? 'Évaluation validée'
                : validating
                  ? 'Validation...'
                  : 'Valider l’évaluation'
            }}
          </button>

        </aside>

      </section>

    </template>

  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;

  padding: 36px 42px;

  background: #f6f8fb;
}

.header {
  margin-bottom: 25px;
}

.eyebrow {
  color: #6372be;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 0.12em;
}

h1 {
  margin: 8px 0 0;

  color: #172033;

  font-size: 28px;
}

.header p {
  margin: 7px 0 0;

  color: #7d8797;

  font-size: 11px;
}

.validation-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    260px;

  gap: 18px;
}

.card,
.actions {
  padding: 22px;

  border: 1px solid #e7ebf0;

  border-radius: 16px;

  background: #fff;
}

.check {
  display: flex;

  align-items: center;

  gap: 13px;

  padding-bottom: 20px;

  margin-bottom: 20px;

  border-bottom: 1px solid #edf0f4;
}

.icon {
  width: 40px;
  height: 40px;

  display: flex;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background: #eaf8f0;

  color: #2d8a59;

  font-weight: 800;
}

.check strong {
  color: #344054;

  font-size: 12px;
}

.check p {
  margin: 5px 0 0;

  color: #939baa;

  font-size: 9px;
}

.actions {
  align-self: start;

  display: flex;

  flex-direction: column;

  gap: 10px;
}

.actions button {
  height: 42px;

  border-radius: 9px;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
}

.secondary {
  border: 1px solid #dfe4eb;

  background: white;

  color: #596477;
}

.primary {
  border: 0;

  background: #3046a7;

  color: white;
}

.primary:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}

.loading,
.error {
  padding: 60px;

  text-align: center;
}

.error {
  color: #a64d4d;
}

@media (max-width: 800px) {
  .page {
    padding: 25px 18px;
  }

  .validation-layout {
    grid-template-columns: 1fr;
  }
}
</style>