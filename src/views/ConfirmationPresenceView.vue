<script setup>
import { onMounted, ref } from 'vue'
import { CheckCircle2, XCircle, Loader2, HelpCircle, ArrowRight, X, AlertCircle } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const data = ref(null)
const error = ref('')
const loading = ref(true)
const submitting = ref(false)
const confirmedChoice = ref(null) // true (continuer) | false (arreter) | null
const showStopConfirm = ref(false)

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get(`evaluations/confirmation-presence/${route.params.token}/`)
    data.value = res.data
    if (data.value.repondu) {
      confirmedChoice.value = data.value.choix
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Ce lien est invalide ou a expiré.'
  } finally {
    loading.value = false
  }
}

const sendChoice = async (continuer) => {
  submitting.value = true
  error.value = ''
  try {
    await api.post(`evaluations/confirmation-presence/${route.params.token}/`, { continuer })
    confirmedChoice.value = continuer
    if (data.value) {
      data.value.repondu = true
      data.value.choix = continuer
    }
    showStopConfirm.value = false
  } catch (err) {
    error.value = err.response?.data?.detail || 'Une erreur est survenue lors de l’enregistrement de votre choix.'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
    <section class="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200">
      
      <!-- Chargement -->
      <div v-if="loading" class="py-12 text-center">
        <Loader2 class="mx-auto h-9 w-9 animate-spin text-primary-600" />
        <p class="mt-3 text-sm text-slate-500 font-medium">Chargement de votre dossier...</p>
      </div>

      <!-- Erreur globale -->
      <div v-else-if="error && !data" class="text-center py-6">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle class="h-6 w-6" />
        </div>
        <h1 class="mt-4 text-xl font-bold text-slate-900">Lien indisponible</h1>
        <p class="mt-2 text-sm text-slate-600">{{ error }}</p>
      </div>

      <!-- Contenu principal -->
      <div v-else-if="data">
        
        <!-- En-tête -->
        <div class="border-b border-slate-100 pb-5 text-center">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            SourcingHub · Sélection
          </span>
          <h1 class="mt-3 text-2xl font-bold text-[#00313C]">Poursuite de candidature</h1>
          <p class="mt-2 text-sm text-slate-600">
            Bonjour <strong class="text-slate-800">{{ data.nom }}</strong>, vous avez participé à la réunion d'information « <strong class="text-slate-800">{{ data.etapeNom }}</strong> ».
          </p>
        </div>

        <!-- Erreur d'action (s'il y en a une) -->
        <div v-if="error" class="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {{ error }}
        </div>

        <!-- Cas 1 : Le candidat n'a pas encore répondu -->
        <div v-if="!data.repondu && confirmedChoice === null" class="mt-6 space-y-6">
          <div class="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <h2 class="text-base font-semibold text-slate-800">
              Souhaitez-vous continuer la procédure de candidature ?
            </h2>
            <ul class="mt-3 space-y-2 text-xs text-slate-600">
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span><strong>Si vous continuez :</strong> Vous serez qualifié(e) pour l'étape suivante (Test de sélection) et recevrez l'accès dès qu'il sera programmé.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-slate-400 font-bold">✕</span>
                <span><strong>Si vous ne continuez pas :</strong> Votre parcours de candidature prendra fin à cette réunion d'information.</span>
              </li>
            </ul>
          </div>

          <!-- Actions de choix -->
          <div v-if="!showStopConfirm" class="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
              :disabled="submitting"
              @click="sendChoice(true)"
            >
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              <CheckCircle2 v-else class="h-4 w-4" />
              Oui, je souhaite continuer
            </button>

            <button 
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
              :disabled="submitting"
              @click="showStopConfirm = true"
            >
              <X class="h-4 w-4 text-slate-400" />
              Arrêter ma candidature
            </button>
          </div>

          <!-- Confirmation pour l'arrêt -->
          <div v-else class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p class="text-xs font-semibold text-amber-900">
              Êtes-vous sûr(e) de vouloir arrêter votre candidature ? Cette action est définitive.
            </p>
            <div class="flex gap-2 justify-end">
              <button 
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                :disabled="submitting"
                @click="showStopConfirm = false"
              >
                Annuler
              </button>
              <button 
                class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                :disabled="submitting"
                @click="sendChoice(false)"
              >
                <Loader2 v-if="submitting" class="inline mr-1 h-3.5 w-3.5 animate-spin" />
                Confirmer l'arrêt
              </button>
            </div>
          </div>
        </div>

        <!-- Cas 2 : Choix OUI validé -->
        <div v-else-if="confirmedChoice === true || (data.repondu && data.choix === true)" class="mt-6 text-center space-y-4">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 class="h-8 w-8" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Poursuite de candidature validée</h2>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Votre décision de continuer la procédure a bien été enregistrée. Vous recevrez une notification par email avec le lien du test dès qu'il sera disponible.
            </p>
          </div>
          <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-800 font-medium">
            Prochaine étape : Test de sélection
          </div>
        </div>

        <!-- Cas 3 : Choix NON validé -->
        <div v-else-if="confirmedChoice === false || (data.repondu && data.choix === false)" class="mt-6 text-center space-y-4">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <XCircle class="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Candidature clôturée</h2>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Votre décision d'arrêter votre candidature a bien été prise en compte. Votre parcours s'est arrêté à la réunion d'information.
            </p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
            Nous vous remercions pour l'intérêt que vous avez porté à notre programme.
          </div>
        </div>

      </div>
    </section>
  </main>
</template>
