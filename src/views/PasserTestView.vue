<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ArrowLeft, Send, Award, FileText } from 'lucide-vue-next'
import api from '../services/api'
import { useModalStore } from '../stores/modal'

const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()

const participationId = computed(() => route.params.participationId)

const loading = ref(true)
const submitting = ref(false)
const testData = ref(null)
const passage = ref(null)
const answers = ref({}) // { questionId: [optionId1, ...] }
const currentQuestionIndex = ref(0)
const testSubmitted = ref(false)
const submitResult = ref(null)
const timeRemainingSeconds = ref(0)
let timerInterval = null

const currentQuestion = computed(() => {
  if (!testData.value?.questions) return null
  return testData.value.questions[currentQuestionIndex.value]
})

const fetchTestDetails = async () => {
  loading.value = true
  try {
    const res = await api.get(`evaluations/participations/${participationId.value}/test-details/`)
    testData.value = res.data.test
    passage.value = res.data.passage
    if (passage.value && passage.value.statut === 'SOUMIS') {
      testSubmitted.value = true
      submitResult.value = {
        scoreObtenu: passage.value.scoreObtenu,
        baremeTotal: testData.value.baremeTotal,
        estAdmis: passage.value.estAdmis
      }
    }
  } catch (err) {
    modalStore.error(err.response?.data?.detail || 'Impossible d\'accéder au test QCM.')
  } finally {
    loading.value = false
  }
}

const startTest = async () => {
  try {
    const res = await api.post(`evaluations/participations/${participationId.value}/commencer-test/`)
    passage.value = {
      id: res.data.passageId,
      statut: res.data.statut,
      dateDebut: res.data.dateDebut
    }
    const dureeMinutes = res.data.dureeMinutes || 30
    timeRemainingSeconds.value = dureeMinutes * 60
    startTimer()
  } catch (err) {
    modalStore.error(err.response?.data?.detail || 'Erreur lors du démarrage du test.')
  }
}

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timeRemainingSeconds.value > 0) {
      timeRemainingSeconds.value--
    } else {
      clearInterval(timerInterval)
      modalStore.warning('Temps écoulé ! Vos réponses vont être soumises automatiquement.')
      submitTest()
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const m = Math.floor(timeRemainingSeconds.value / 60)
  const s = timeRemainingSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const toggleOption = (questionId, optionId, typeQuestion) => {
  if (testSubmitted.value) return
  if (!answers.value[questionId]) {
    answers.value[questionId] = []
  }
  if (typeQuestion === 'CHOIX_UNIQUE') {
    answers.value[questionId] = [optionId]
  } else {
    const idx = answers.value[questionId].indexOf(optionId)
    if (idx > -1) {
      answers.value[questionId].splice(idx, 1)
    } else {
      answers.value[questionId].push(optionId)
    }
  }
}

const isOptionSelected = (questionId, optionId) => {
  return answers.value[questionId]?.includes(optionId) || false
}

const submitTest = async () => {
  if (submitting.value || testSubmitted.value) return
  const confirm = await modalStore.confirm(
    'Soumettre votre test QCM ?',
    'Vous ne pourrez plus modifier vos réponses une fois la soumission effectuée.'
  )
  if (!confirm) return

  submitting.value = true
  if (timerInterval) clearInterval(timerInterval)

  // Préparation du payload
  const reponsesPayload = (testData.value.questions || []).map(q => ({
    questionId: q.id,
    optionIds: answers.value[q.id] || []
  }))

  try {
    const res = await api.post(`evaluations/participations/${participationId.value}/soumettre-test/`, {
      reponses: reponsesPayload
    })
    testSubmitted.value = true
    submitResult.value = res.data
    modalStore.success('Votre test QCM a été soumis avec succès !')
  } catch (err) {
    modalStore.error(err.response?.data?.detail || 'Erreur lors de la soumission du test.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTestDetails()
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#01313E] text-[#01313E] dark:text-white flex flex-col justify-between">
    <!-- EN-TÊTE NAVBAR -->
    <header class="bg-white dark:bg-[#01313E] border-b border-[#01313E]/10 dark:border-[#01313E] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-[#01313E] text-white rounded-xl font-bold text-sm">
          QCM
        </div>
        <div>
          <h1 class="font-bold text-[#01313E] dark:text-white text-base">Étape 3 — Test Pédagogique</h1>
          <p class="text-xs text-[#01313E]/60">{{ testData?.titre || 'Chargement...' }}</p>
        </div>
      </div>

      <!-- TIMER CHRONO -->
      <div v-if="passage && !testSubmitted" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#01313E]/30 text-[#01313E] dark:text-[#01313E] font-mono font-bold text-lg rounded-xl border border-[#01313E] dark:border-[#01313E]">
        <Clock class="w-5 h-5 animate-pulse"/>
        <span>{{ formattedTime }}</span>
      </div>
    </header>

    <!-- CONTENU PRINCIPAL -->
    <main class="flex-1 max-w-4xl w-full mx-auto p-6">
      <!-- CHARGEMENT -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-10 h-10 border-4 border-[#01313E] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-[#01313E]/60">Chargement de votre test QCM...</p>
      </div>

      <!-- ÉCRAN DE DÉMARRAGE DU TEST -->
      <div v-else-if="!passage && !testSubmitted" class="bg-white dark:bg-[#01313E] rounded-2xl p-8 border border-[#01313E]/10 dark:border-[#01313E] text-center space-y-6">
        <div class="w-16 h-16 bg-white dark:bg-[#01313E]/30 text-[#01313E] dark:text-[#01313E] rounded-2xl flex items-center justify-center mx-auto">
          <FileText class="w-8 h-8"/>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-[#01313E] dark:text-white mb-2">{{ testData.titre }}</h2>
          <p class="text-sm text-[#01313E]/60 max-w-xl mx-auto">{{ testData.description || 'Bienvenue dans le test QCM de l\'Étape 3.' }}</p>
        </div>

        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto py-4 border-y dark:border-[#01313E]">
          <div>
            <p class="text-xs text-[#01313E]/60">Durée</p>
            <p class="font-bold text-[#01313E] dark:text-white">{{ testData.dureeMinutes }} min</p>
          </div>
          <div>
            <p class="text-xs text-[#01313E]/60">Questions</p>
            <p class="font-bold text-[#01313E] dark:text-white">{{ testData.questions?.length || 0 }}</p>
          </div>
          <div>
            <p class="text-xs text-[#01313E]/60">Barème</p>
            <p class="font-bold text-[#01313E] dark:text-white">{{ testData.baremeTotal }} pts</p>
          </div>
        </div>

        <div class="bg-white dark:bg-blue-950/40 p-4 rounded-xl text-xs text-[#01313E] dark:text-[#01313E] text-left border border-[#01313E] dark:border-[#01313E]">
          <p class="font-semibold mb-1">Informations importantes :</p>
          <ul class="list-disc pl-4 space-y-1">
            <li>Le chronomètre démarrera dès que vous cliquerez sur le bouton ci-dessous.</li>
            <li>Ce test est destiné à évaluer vos acquis et est <strong>non-bloquant</strong> pour la suite de votre sélection.</li>
            <li>Vos résultats enregistrés vous permettront de poursuivre vers l'Étape 4 (Entretien technique &amp; Motivation).</li>
          </ul>
        </div>

        <button @click="startTest"
          class="px-8 py-3 bg-[#01313E] hover:bg-[#01313E] text-white font-bold rounded-xl transition inline-flex items-center gap-2">
          <span>Commencer le Test</span>
          <ArrowRight class="w-5 h-5"/>
        </button>
      </div>

      <!-- ÉCRAN DE SOUMISSION / RÉSULTAT COMPLÉTÉ -->
      <div v-else-if="testSubmitted" class="bg-white dark:bg-[#01313E] rounded-2xl p-8 border border-[#01313E]/10 dark:border-[#01313E] text-center space-y-6">
        <div class="w-16 h-16 bg-white dark:bg-[#01313E]/30 text-[#01313E] dark:text-[#01313E] rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 class="w-10 h-10"/>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-[#01313E] dark:text-white mb-2">Test QCM Soumis !</h2>
          <p class="text-sm text-[#01313E]/60">
            Merci d'avoir complété votre test d'évaluation de l'Étape 3.
          </p>
        </div>
        <div class="bg-white dark:bg-[#01313E]/40 p-6 rounded-2xl max-w-sm mx-auto border border-[#01313E]/10 dark:border-[#01313E]">
          <p class="text-xs text-[#01313E]/60 uppercase tracking-wider font-semibold mb-1">Score Obtenu</p>
          <p class="text-3xl font-extrabold text-[#01313E] dark:text-[#01313E]">
            {{ submitResult?.scoreObtenu }} / {{ submitResult?.baremeTotal || testData?.baremeTotal }}
          </p>
          <p class="text-xs text-[#01313E] dark:text-[#01313E] mt-2 font-medium">
            ✓ Vos réponses sont bien transmises à l'Équipe Pédagogique.
          </p>
        </div>
        <p class="text-sm text-[#01313E]/80 dark:text-white">
          Votre candidature passe automatiquement à l'<strong>Étape 4 : Entretien technique &amp; Motivation</strong>.
        </p>
        <button @click="router.push('/profil')"
          class="px-6 py-2.5 bg-[#01313E] hover:bg-[#01313E] text-white font-medium rounded-xl transition">
          Retourner à mon Profil
        </button>
      </div>

      <!-- QUESTIONS INTERACTIVES EN COURS DE TEST -->
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- BARRE DE PROGRESSION -->
        <div class="flex items-center justify-between text-xs text-[#01313E]/60 mb-2">
          <span>Question {{ currentQuestionIndex + 1 }} sur {{ testData.questions.length }}</span>
          <span>{{ currentQuestion.points }} point(s)</span>
        </div>
        <div class="w-full h-2 bg-white dark:bg-[#01313E] rounded-full overflow-hidden">
          <div class="h-full bg-[#01313E] transition-all duration-300"
            :style="{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }">
          </div>
        </div>

        <!-- CARTE QUESTION -->
        <div class="bg-white dark:bg-[#01313E] rounded-2xl p-6 border border-[#01313E]/10 dark:border-[#01313E] space-y-4">
          <div class="flex items-start gap-3">
            <span class="px-2.5 py-1 bg-white text-[#01313E] dark:bg-[#01313E]/40 dark:text-[#01313E] font-bold text-xs rounded-lg">
              {{ currentQuestion.typeQuestion === 'CHOIX_UNIQUE' ? 'Choix unique' : 'Choix multiple' }}
            </span>
          </div>
          <h3 class="text-lg font-bold text-[#01313E] dark:text-white leading-relaxed">
            {{ currentQuestion.intitule }}
          </h3>

          <!-- PROPOSITIONS -->
          <div class="space-y-3 pt-2">
            <div
              v-for="option in currentQuestion.options"
              :key="option.id"
              @click="toggleOption(currentQuestion.id, option.id, currentQuestion.typeQuestion)"
              class="p-4 rounded-xl border-2 transition cursor-pointer flex items-center gap-3"
              :class="isOptionSelected(currentQuestion.id, option.id) ? 'border-[#01313E] bg-white/50 dark:bg-[#01313E]/20 text-[#01313E] dark:text-white' : 'border-[#01313E]/10 dark:border-[#01313E] hover:border-[#01313E]/10 dark:hover:border-[#01313E] text-[#01313E]/80 dark:text-white'">
              <div class="w-5 h-5 rounded-md border flex items-center justify-center transition"
                :class="isOptionSelected(currentQuestion.id, option.id) ? 'bg-[#01313E] border-[#01313E] text-white' : 'border-[#01313E]/10 dark:border-[#01313E]'">
                <CheckCircle2 v-if="isOptionSelected(currentQuestion.id, option.id)" class="w-4 h-4"/>
              </div>
              <span class="text-sm font-medium">{{ option.texte }}</span>
            </div>
          </div>
        </div>

        <!-- NAVIGATION QUESTIONS -->
        <div class="flex items-center justify-between pt-2">
          <button @click="currentQuestionIndex--"
            :disabled="currentQuestionIndex === 0"
            class="px-4 py-2 border rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-[#01313E]">
            <ArrowLeft class="w-4 h-4 inline mr-1"/> Question précédente
          </button>
          <button v-if="currentQuestionIndex < testData.questions.length - 1"
            @click="currentQuestionIndex++"
            class="px-5 py-2 bg-[#01313E] hover:bg-[#01313E] text-white font-medium text-sm rounded-xl">
            Question suivante <ArrowRight class="w-4 h-4 inline ml-1"/>
          </button>
          <button v-else @click="submitTest" :disabled="submitting"
            class="px-6 py-2.5 bg-[#01313E] hover:bg-[#01313E] text-white font-bold text-sm rounded-xl">
            <Send class="w-4 h-4 inline mr-1"/> Soumettre le Test
          </button>
        </div>
      </div>
    </main>
  </div>
</template>