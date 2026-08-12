<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCandidaturesStore } from '../stores/candidatures'
import api from '../services/api'
import { ArrowLeft, Loader2, CheckCircle, ShieldAlert } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const store = useCandidaturesStore()

const campagneId = route.params.campagneId
const campaignDetails = ref(null)
const formulaire = ref(null)
const champs = ref([])
const loading = ref(true)

const personalInfo = ref({
  email: '',
  prenom: '',
  nom: '',
  telephone: '',
  sexe: 'HOMME'
})

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

    // 3. Initialize responses
    champs.value.forEach(champ => {
      if (champ.type === 'CASE_A_COCHER') {
        formResponses.value[champ.id] = []
      } else {
        formResponses.value[champ.id] = ''
      }
    })
  } catch (error) {
    console.error('Erreur lors du chargement des données de candidature', error)
    alert(error.response?.data?.detail || "Impossible d'accéder à cette candidature.")
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

const submitApplication = async () => {
  store.error = null

  // Validate personal info if anonymous
  if (!authStore.isAuthenticated) {
    const { email, prenom, nom, telephone, sexe } = personalInfo.value
    if (!email || !prenom || !nom || !telephone || !sexe) {
      store.error = "Veuillez renseigner toutes vos informations personnelles de base."
      return
    }
  }

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

  if (!authStore.isAuthenticated) {
    Object.assign(payload, personalInfo.value)
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
            Un email contenant un lien sécurisé d'activation a été envoyé à l'adresse <strong>{{ personalInfo.email }}</strong>. Veuillez activer votre compte pour pouvoir vous connecter et suivre l'avancement de votre candidature.
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

          <!-- Partie Infos Personnelles (si non connecté) -->
          <div v-if="!authStore.isAuthenticated" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h3 class="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">Informations Personnelles</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Prénom <span class="text-red-500">*</span></label>
                <input type="text" v-model="personalInfo.prenom" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom <span class="text-red-500">*</span></label>
                <input type="text" v-model="personalInfo.nom" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Adresse Email <span class="text-red-500">*</span></label>
              <input type="email" v-model="personalInfo.email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Téléphone <span class="text-red-500">*</span></label>
              <input type="tel" v-model="personalInfo.telephone" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Genre <span class="text-red-500">*</span></label>
              <select v-model="personalInfo.sexe" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm">
                <option value="HOMME">Homme</option>
                <option value="FEMME">Femme</option>
              </select>
            </div>
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
              <template v-if="champ.type === 'TEXTE'">
                <input type="text" v-model="formResponses[champ.id]" :placeholder="champ.placeholderTexte || 'Votre réponse'" class="w-full sm:w-1/2 border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1.5 text-sm bg-transparent" />
              </template>

              <template v-else-if="champ.type === 'ZONE_TEXTE'">
                <textarea v-model="formResponses[champ.id]" :placeholder="champ.placeholderTexte || 'Votre réponse'" rows="3" class="w-full border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1.5 text-sm bg-transparent resize-y"></textarea>
              </template>

              <template v-else-if="champ.type === 'CHOIX_MULTIPLES'">
                <div class="space-y-3 mt-2">
                  <label v-for="opt in champ.options" :key="opt.id" class="flex items-center cursor-pointer group">
                    <input type="radio" :name="champ.id" :value="opt.valeur || opt.libelle" v-model="formResponses[champ.id]" class="w-5 h-5 text-[#CE0033] border-gray-300 focus:ring-[#CE0033] cursor-pointer" />
                    <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{{ opt.libelle }}</span>
                  </label>
                </div>
              </template>

              <template v-else-if="champ.type === 'CASE_A_COCHER'">
                <div class="space-y-3 mt-2">
                  <label v-for="opt in champ.options" :key="opt.id" class="flex items-center cursor-pointer group">
                    <input type="checkbox" :value="opt.valeur || opt.libelle" v-model="formResponses[champ.id]" class="w-5 h-5 rounded border-gray-300 text-[#CE0033] focus:ring-[#CE0033] cursor-pointer" />
                    <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{{ opt.libelle }}</span>
                  </label>
                </div>
              </template>

              <template v-else-if="champ.type === 'LISTE_DEROULANTE'">
                <select v-model="formResponses[champ.id]" class="w-full sm:w-64 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CE0033] focus:border-[#CE0033] text-sm bg-white">
                  <option value="" disabled selected>Choisir</option>
                  <option v-for="opt in champ.options" :key="opt.id" :value="opt.valeur || opt.libelle">
                    {{ opt.libelle }}
                  </option>
                </select>
              </template>

              <template v-else-if="champ.type === 'DATE'">
                <input type="date" v-model="formResponses[champ.id]" class="w-full sm:w-48 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CE0033] text-sm" />
              </template>
              
              <template v-else-if="champ.type === 'NOMBRE'">
                <input type="number" v-model="formResponses[champ.id]" :placeholder="champ.placeholderTexte || 'Votre réponse'" class="w-full sm:w-48 border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1.5 text-sm bg-transparent" />
              </template>

              <template v-else-if="champ.type === 'FICHIER'">
                <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">
                          {{ filesMap[champ.id] ? 'Fichier choisi : ' + filesMap[champ.id].name : 'Cliquez pour ajouter un fichier' }}
                        </span>
                      </p>
                      <p class="text-xs text-gray-400" v-if="champ.typesMimeAutorises">Extensions : {{ champ.typesMimeAutorises }}</p>
                      <p class="text-xs text-gray-400" v-if="champ.tailleMaxMo">Taille Max : {{ champ.tailleMaxMo }} Mo</p>
                    </div>
                    <input type="file" class="hidden" @change="handleFileChange(champ.id, $event)" />
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
