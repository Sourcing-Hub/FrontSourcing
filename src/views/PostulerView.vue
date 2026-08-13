<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCandidaturesStore } from '../stores/candidatures'
import { useModalStore } from '../stores/modal'
import api from '../services/api'
import { ArrowLeft, Loader2, CheckCircle, ShieldAlert } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const store = useCandidaturesStore()
const modalStore = useModalStore()

const campagneId = route.params.campagneId
const campaignDetails = ref(null)
const formulaire = ref(null)
const champs = ref([])
const loading = ref(true)

const userProfile = ref(null)
const formResponses = ref({})
const filesMap = ref({})
const submitSuccess = ref(false)
const submissionResult = ref(null)

onMounted(async () => {
  try {
    // 1. Fetch campagne details publicly
    const campRes = await api.get(`campagnes/publiques/${campagneId}/`)
    campaignDetails.value = campRes.data

    // 2. Fetch associated form
    const formRes = await api.get(`formulaires/publique/campagne/${campagneId}/`)
    formulaire.value = formRes.data
    champs.value = formRes.data.champs || []

    // 3. Fetch user profile if logged in
    if (authStore.isAuthenticated) {
      try {
        const profileRes = await api.get('utilisateurs/mon-profil/')
        userProfile.value = profileRes.data
      } catch (err) {
        console.error('Erreur lors de la récupération du profil connecté', err)
      }
    }

    // 4. Initialize responses
    champs.value.forEach(champ => {
      if (champ.type === 'CASE_A_COCHER') {
        formResponses.value[champ.id] = []
      } else {
        formResponses.value[champ.id] = ''
      }

      // Pre-fill profile fields if authenticated
      if (authStore.isAuthenticated && userProfile.value) {
        const libelle = champ.libelle.toLowerCase()
        if (libelle === 'prénom') {
          formResponses.value[champ.id] = userProfile.value.first_name || ''
        } else if (libelle === 'nom') {
          formResponses.value[champ.id] = userProfile.value.last_name || ''
        } else if (libelle === 'adresse email') {
          formResponses.value[champ.id] = userProfile.value.email || ''
        } else if (libelle === 'téléphone') {
          formResponses.value[champ.id] = userProfile.value.telephone || ''
        } else if (libelle === 'genre') {
          formResponses.value[champ.id] = userProfile.value.sexe === 'HOMME' ? 'Homme' : 'Femme'
        }
      }
    })
  } catch (error) {
    console.error('Erreur lors du chargement des données de candidature', error)
    await modalStore.showAlert(
      error.response?.data?.detail || "Impossible d'accéder à cette candidature.",
      "Erreur de chargement",
      "danger"
    )
    router.push('/postuler')
  } finally {
    loading.value = false
  }
})

const handleFileChange = (champId, event) => {
  const file = event.target.files[0]
  if (file) {
    filesMap.value[champId] = file
    formResponses.value[champId] = file.name
  }
}

const isProfileField = (champ) => {
  if (!authStore.isAuthenticated) return false
  const libelle = champ.libelle.toLowerCase()
  return ['prénom', 'nom', 'adresse email', 'téléphone', 'genre'].includes(libelle)
}

const getSubmittedEmail = () => {
  const emailChamp = champs.value.find(c => c.libelle.toLowerCase() === 'adresse email')
  return emailChamp ? formResponses.value[emailChamp.id] : ''
}

const submitApplication = async () => {
  store.error = null

  // Validate dynamic questions
  for (const champ of champs.value) {
    const response = formResponses.value[champ.id]
    if (champ.obligatoire) {
      if (champ.type === 'CASE_A_COCHER' && (!response || response.length === 0)) {
        store.error = `Le champ "${champ.libelle}" est obligatoire.`
        return
      }
      if (champ.type !== 'CASE_A_COCHER' && !response) {
        store.error = `Le champ "${champ.libelle}" est obligatoire.`
        return
      }
    }
  }

  // Prepare payload
  const formattedResponses = Object.entries(formResponses.value).map(([champId, valeur]) => {
    return {
      champ_id: champId,
      valeur: Array.isArray(valeur) ? valeur.join(', ') : valeur
    }
  })

  const payload = {
    campagne: campagneId,
    reponses: formattedResponses
  }

  const result = await store.soumettreCandidature(payload, filesMap.value)
  if (result) {
    submissionResult.value = result
    submitSuccess.value = true
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center">
          <button @click="router.back()" class="p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <span class="text-sm font-semibold text-gray-900">Postuler à la campagne</span>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto mt-8 px-4">
      <div v-if="loading" class="flex justify-center py-20">
        <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
      </div>

      <div v-else-if="submitSuccess" class="bg-white rounded-xl shadow-lg border-t-8 border-emerald-500 p-8 text-center animate-fade-in">
        <CheckCircle class="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Candidature Soumise !</h2>
        <p class="text-sm text-gray-600 mb-6">
          Votre dossier a été enregistré avec succès sous le numéro <strong>{{ submissionResult?.numero }}</strong>.
        </p>

        <div v-if="!authStore.isAuthenticated" class="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-left mb-6 max-w-lg mx-auto">
          <h4 class="font-bold text-emerald-900 mb-1">Activation du compte requise</h4>
          <p class="text-xs text-emerald-800 leading-relaxed">
            Un email contenant un lien sécurisé d'activation a été envoyé à l'adresse <strong>{{ getSubmittedEmail() }}</strong>. Veuillez activer votre compte pour pouvoir vous connecter et suivre l'avancement de votre candidature.
          </p>
        </div>

        <div class="flex justify-center space-x-4">
          <button
            @click="router.push('/login')"
            class="px-6 py-2.5 bg-[#CE0033] hover:bg-[#a8002a] text-white font-medium rounded-lg transition-colors text-sm"
          >
            Se connecter
          </button>
          <button
            @click="router.push('/postuler')"
            class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Retourner aux campagnes
          </button>
        </div>
      </div>

      <div v-else class="space-y-6 animate-fade-in">
        <!-- Infos campagne -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ campaignDetails?.nom }}</h2>
          <p class="text-sm text-gray-600 mb-4">{{ campaignDetails?.description }}</p>
          <div class="text-xs text-gray-500 flex justify-between pt-4 border-t border-gray-100">
            <span>Formation : <strong>{{ campaignDetails?.cohorte_detail?.formation_nom }}</strong></span>
            <span>Cohorte : <strong>{{ campaignDetails?.cohorte_detail?.nom }}</strong></span>
          </div>
        </div>

        <!-- Formulaire principal -->
        <form @submit.prevent="submitApplication" class="space-y-6">
          
          <!-- Erreurs -->
          <div v-if="store.error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start">
            <ShieldAlert class="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <span class="text-sm text-red-700">{{ store.error }}</span>
          </div>

          <!-- Questions Dynamiques -->
          <div 
            v-for="champ in champs" 
            :key="champ.id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <div class="mb-4">
              <label class="text-base font-semibold text-gray-900">
                {{ champ.libelle }}
                <span v-if="champ.obligatoire" class="text-red-500 ml-1">*</span>
              </label>
              <p v-if="champ.description" class="text-xs text-gray-500 mt-1">{{ champ.description }}</p>
            </div>

            <div>
              <template v-if="champ.type === 'TEXTE' || champ.type === 'EMAIL' || champ.type === 'TELEPHONE'">
                <input :type="champ.type === 'EMAIL' ? 'email' : (champ.type === 'TELEPHONE' ? 'tel' : 'text')" :disabled="isProfileField(champ)" v-model="formResponses[champ.id]" :placeholder="champ.placeholderTexte || 'Votre réponse'" class="w-full sm:w-1/2 border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1.5 text-sm bg-transparent" />
              </template>

              <template v-else-if="champ.type === 'ZONE_TEXTE'">
                <textarea :disabled="isProfileField(champ)" v-model="formResponses[champ.id]" :placeholder="champ.placeholderTexte || 'Votre réponse'" rows="3" class="w-full border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1.5 text-sm bg-transparent resize-y"></textarea>
              </template>

              <template v-else-if="champ.type === 'CHOIX_MULTIPLES'">
                <div class="space-y-3 mt-2">
                  <label v-for="opt in champ.options" :key="opt.id" class="flex items-center cursor-pointer group">
                    <input type="radio" :disabled="isProfileField(champ)" :name="champ.id" :value="opt.valeur || opt.libelle" v-model="formResponses[champ.id]" class="w-5 h-5 text-[#CE0033] border-gray-300 focus:ring-[#CE0033] cursor-pointer" />
                    <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{{ opt.libelle }}</span>
                  </label>
                </div>
              </template>

              <template v-else-if="champ.type === 'CASE_A_COCHER'">
                <div class="space-y-3 mt-2">
                  <label v-for="opt in champ.options" :key="opt.id" class="flex items-center cursor-pointer group">
                    <input type="checkbox" :disabled="isProfileField(champ)" :value="opt.valeur || opt.libelle" v-model="formResponses[champ.id]" class="w-5 h-5 rounded border-gray-300 text-[#CE0033] focus:ring-[#CE0033] cursor-pointer" />
                    <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{{ opt.libelle }}</span>
                  </label>
                </div>
              </template>

              <template v-else-if="champ.type === 'LISTE_DEROULANTE'">
                <select :disabled="isProfileField(champ)" v-model="formResponses[champ.id]" class="w-full sm:w-64 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CE0033] focus:border-[#CE0033] text-sm bg-white">
                  <option value="" disabled selected>Choisir</option>
                  <option v-for="opt in champ.options" :key="opt.id" :value="opt.valeur || opt.libelle">
                    {{ opt.libelle }}
                  </option>
                </select>
              </template>

              <template v-else-if="champ.type === 'DATE'">
                <input type="date" :disabled="isProfileField(champ)" v-model="formResponses[champ.id]" class="w-full sm:w-48 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CE0033] text-sm" />
              </template>
              
              <template v-else-if="champ.type === 'NOMBRE'">
                <input type="number" :disabled="isProfileField(champ)" v-model="formResponses[champ.id]" :placeholder="champ.placeholderTexte || 'Votre réponse'" class="w-full sm:w-48 border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1.5 text-sm bg-transparent" />
              </template>

              <template v-else-if="champ.type === 'FICHIER'">
                <div class="flex items-center justify-center w-full">
                  <label :class="{'pointer-events-none opacity-50 bg-gray-200': isProfileField(champ)}" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">
                          {{ filesMap[champ.id] ? 'Fichier choisi : ' + filesMap[champ.id].name : 'Cliquez pour ajouter un fichier' }}
                        </span>
                      </p>
                      <p class="text-xs text-gray-400" v-if="champ.typesMimeAutorises">Extensions : {{ champ.typesMimeAutorises }}</p>
                      <p class="text-xs text-gray-400" v-if="champ.tailleMaxMo">Taille Max : {{ champ.tailleMaxMo }} Mo</p>
                    </div>
                    <input type="file" :disabled="isProfileField(champ)" class="hidden" @change="handleFileChange(champ.id, $event)" />
                  </label>
                </div>
              </template>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="store.loading"
              class="flex justify-center items-center py-3 px-8 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-[#CE0033] hover:bg-[#a8002a] focus:outline-none transition-colors disabled:opacity-50"
            >
              <Loader2 v-if="store.loading" class="w-4 h-4 mr-2 animate-spin" />
              Soumettre ma candidature
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
