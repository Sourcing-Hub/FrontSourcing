<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ArrowLeft, Send, Award, FileText, Check, ShieldCheck } from 'lucide-vue-next'
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
    await modalStore.error(err.response?.data?.detail || 'Impossible d\'accéder au test QCM.')
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
    await modalStore.error(err.response?.data?.detail || 'Erreur lors du démarrage du test.')
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
    await modalStore.success('Votre test QCM a été soumis avec succès !')
  } catch (err) {
    await modalStore.error(err.response?.data?.detail || 'Erreur lors de la soumission du test.')
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
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
    <!-- EN-TÊTE NAVBAR -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-[#01313E] text-white rounded-xl font-bold text-xs">
          QCM
        </div>
        <div>
          <h1 class="font-bold text-[#01313E] text-base">Étape 3 — Test Pédagogique</h1>
          <p class="text-xs text-slate-500">{{ testData?.titre || 'Chargement...' }}</p>
        </div>
      </div>

      <!-- TIMER CHRONO -->
      <div v-if="passage && !testSubmitted" class="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-900 font-mono font-bold text-lg rounded-xl border border-amber-300 shadow-xs">
        <Clock class="w-5 h-5 text-amber-600 animate-pulse"/>
        <span>{{ formattedTime }}</span>
      </div>
    </header>

    <!-- CONTENU PRINCIPAL -->
    <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
      <!-- CHARGEMENT -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-10 h-10 border-4 border-[#01313E] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-slate-600 font-medium">Chargement de votre test QCM...</p>
      </div>

      <!-- ÉCRAN DE DÉMARRAGE DU TEST -->
      <div v-else-if="!passage && !testSubmitted" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-center space-y-6">
        <div class="w-16 h-16 bg-primary-50 text-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <FileText class="w-8 h-8"/>
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-[#01313E] mb-2">{{ testData?.titre }}</h2>
          <p class="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {{ testData?.description || 'Bienvenue dans le test QCM d\'évaluation des acquis.' }}
          </p>
        </div>

        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto py-5 border-y border-slate-100">
          <div>
            <p class="text-xs text-slate-400 font-medium">Durée</p>
            <p class="font-extrabold text-slate-900 text-lg">{{ testData?.dureeMinutes }} min</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Questions</p>
            <p class="font-extrabold text-slate-900 text-lg">{{ testData?.questions?.length || 0 }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Barème</p>
            <p class="font-extrabold text-slate-900 text-lg">{{ testData?.baremeTotal }} pts</p>
          </div>
        </div>

        <div class="bg-blue-50/70 p-4 rounded-2xl text-xs text-blue-900 text-left border border-blue-100 space-y-1">
          <p class="font-bold flex items-center gap-1.5 text-blue-950">
            <ShieldCheck class="w-4 h-4 text-blue-600" />
            Informations importantes :
          </p>
          <ul class="list-disc pl-5 space-y-1 text-slate-700">
            <li>Le chronomètre démarrera dès que vous cliquerez sur le bouton ci-dessous.</li>
            <li>Ce test est destiné à évaluer vos compétences et est <strong>non-bloquant</strong> pour la suite du parcours.</li>
            <li>Une fois terminé, vos réponses sont enregistrées et vous continuerez vers l'Étape 4 (Entretiens).</li>
          </ul>
        </div>

        <button @click="startTest"
          class="px-8 py-3.5 bg-[#01313E] hover:bg-[#024456] text-white font-bold rounded-xl shadow-md transition inline-flex items-center gap-2">
          <span>Commencer le Test</span>
          <ArrowRight class="w-5 h-5"/>
        </button>
      </div>

      <!-- ÉCRAN DE SOUMISSION / RÉSULTAT COMPLÉTÉ -->
      <div v-else-if="testSubmitted" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md text-center space-y-6 animate-fade-in">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 class="w-10 h-10"/>
        </div>
        
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#01313E] mb-2">Test QCM Soumis !</h2>
          <p class="text-sm text-slate-600 max-w-lg mx-auto">
            Merci d'avoir complété votre test d'évaluation pour l'Étape 3.
          </p>
        </div>

        <!-- CARTE SCORE BIEN VISIBLE -->
        <div class="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-50 p-6 sm:p-8 rounded-3xl max-w-md mx-auto border-2 border-emerald-300 shadow-sm space-y-3">
          <p class="text-xs text-emerald-800 uppercase tracking-widest font-black">
            Score Obtenu
          </p>
          <div class="flex items-baseline justify-center gap-2">
            <span class="text-5xl font-black text-emerald-700 tracking-tight">
              {{ submitResult?.scoreObtenu !== undefined ? submitResult?.scoreObtenu : (passage?.scoreObtenu ?? 0) }}
            </span>
            <span class="text-xl font-bold text-emerald-900/60">
              / {{ submitResult?.baremeTotal || testData?.baremeTotal || 20 }} pts
            </span>
          </div>
          
          <div class="pt-2">
            <span class="inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
              <Check class="w-4 h-4 text-emerald-600 stroke-[3]" />
              Vos réponses sont bien transmises à l'Équipe Pédagogique
            </span>
          </div>
        </div>

        <p class="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
          Votre candidature passe automatiquement à l'<strong>Étape 4 : Entretien technique &amp; Motivation</strong>.
        </p>

        <div class="pt-2">
          <button @click="router.push('/candidatures')"
            class="px-8 py-3 bg-[#01313E] hover:bg-[#024456] text-white font-bold rounded-xl shadow transition inline-flex items-center gap-2">
            <span>Consulter mes candidatures</span>
            <ArrowRight class="w-4 h-4"/>
          </button>
        </div>
      </div>

      <!-- QUESTIONS INTERACTIVES EN COURS DE TEST -->
      <div v-else-if="currentQuestion" class="space-y-6">
        <!-- BARRE DE PROGRESSION -->
        <div class="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
          <span>Question {{ currentQuestionIndex + 1 }} sur {{ testData.questions.length }}</span>
          <span>{{ currentQuestion.points }} point(s)</span>
        </div>
        <div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            :style="{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }">
          </div>
        </div>

        <!-- CARTE QUESTION -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div class="flex items-start gap-3">
            <span class="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">
              {{ currentQuestion.typeQuestion === 'CHOIX_UNIQUE' ? 'Choix unique' : 'Choix multiple' }}
            </span>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-[#01313E] leading-relaxed">
            {{ currentQuestion.intitule }}
          </h3>

          <!-- PROPOSITIONS -->
          <div class="space-y-3 pt-2">
            <div
              v-for="option in currentQuestion.options"
              :key="option.id"
              @click="toggleOption(currentQuestion.id, option.id, currentQuestion.typeQuestion)"
              class="p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3.5"
              :class="isOptionSelected(currentQuestion.id, option.id) ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 shadow-xs' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'">
              <div class="w-5 h-5 rounded-md border flex items-center justify-center transition flex-shrink-0"
                :class="isOptionSelected(currentQuestion.id, option.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'">
                <Check v-if="isOptionSelected(currentQuestion.id, option.id)" class="w-3.5 h-3.5 stroke-[3]"/>
              </div>
              <span class="text-sm font-medium leading-relaxed">{{ option.texte }}</span>
            </div>
          </div>
        </div>

        <!-- NAVIGATION QUESTIONS -->
        <div class="flex items-center justify-between pt-2">
          <button @click="currentQuestionIndex--"
            :disabled="currentQuestionIndex === 0"
            class="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition">
            <ArrowLeft class="w-4 h-4 inline mr-1"/> Question précédente
          </button>
          <button v-if="currentQuestionIndex < testData.questions.length - 1"
            @click="currentQuestionIndex++"
            class="px-6 py-2.5 bg-[#01313E] hover:bg-[#024456] text-white font-bold text-sm rounded-xl transition inline-flex items-center gap-1.5">
            <span>Question suivante</span>
            <ArrowRight class="w-4 h-4"/>
          </button>
          <button v-else @click="submitTest" :disabled="submitting"
            class="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition inline-flex items-center gap-2">
            <Send class="w-4 h-4"/>
            <span>{{ submitting ? 'Soumission en cours…' : 'Soumettre le Test' }}</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>