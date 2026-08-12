<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormulairesStore } from '../stores/formulaires'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useFormulairesStore()

const formId = route.params.id
const formResponses = ref({})

onMounted(async () => {
  await store.fetchFormulaire(formId)
  if (!store.currentFormulaire) {
    router.push('/formulaires')
  } else {
    // Initialiser les réponses vides
    store.currentFormulaire.champs.forEach(champ => {
      if (champ.type === 'CASE_A_COCHER') {
        formResponses.value[champ.id] = []
      } else {
        formResponses.value[champ.id] = ''
      }
    })
  }
})

const formulaire = computed(() => store.currentFormulaire)
const champs = computed(() => store.currentFormulaire?.champs || [])

</script>

<template>
  <div class="min-h-screen bg-[#CE0033]/5 pb-20">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center">
          <button @click="router.back()" class="p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Fermer l'aperçu">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <span class="text-sm font-semibold text-gray-900">Aperçu - {{ formulaire?.titre || 'Chargement...' }}</span>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto mt-8 px-4 relative">
      <div v-if="!formulaire && store.loading" class="flex justify-center mt-20">
        <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
      </div>

      <div v-else-if="formulaire" class="space-y-6">
        <!-- En-tête du formulaire -->
        <div class="bg-white rounded-lg shadow-sm border-t-[8px] border-[#CE0033] p-8">
          <h1 class="text-3xl font-normal text-gray-900 mb-4">{{ formulaire.titre }}</h1>
          <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ formulaire.description }}</p>
          
          <!-- Message d'information si la campagne est fermée -->
          <div v-if="formulaire.campagne && !formulaire.campagne_est_ouverte" class="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
            <span class="font-bold">Campagne clôturée :</span> Ce formulaire appartient à la campagne <strong>"{{ formulaire.campagne_nom }}"</strong> qui est actuellement fermée. Il n'est plus possible d'envoyer des réponses.
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 text-xs text-red-500">
            * Indique une question obligatoire
          </div>
        </div>

        <!-- Champs -->
        <div 
          v-for="champ in champs" 
          :key="champ.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div class="mb-4">
            <label class="text-base font-medium text-gray-900 break-words">
              {{ champ.libelle }}
              <span v-if="champ.obligatoire" class="text-red-500 ml-1">*</span>
            </label>
            <p v-if="champ.description" class="text-xs text-gray-500 mt-1">{{ champ.description }}</p>
          </div>

          <!-- Rendu des différents types -->
          <div>
            <template v-if="champ.type === 'TEXTE'">
              <input type="text" v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" :placeholder="champ.placeholderTexte || 'Votre réponse'" class="w-1/2 border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1 text-sm bg-transparent disabled:opacity-50 disabled:cursor-not-allowed" />
            </template>

            <template v-else-if="champ.type === 'ZONE_TEXTE'">
              <textarea v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" :placeholder="champ.placeholderTexte || 'Votre réponse'" rows="3" class="w-full border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1 text-sm bg-transparent resize-y disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
            </template>

            <template v-else-if="champ.type === 'CHOIX_MULTIPLES'">
              <div class="space-y-3 mt-2">
                <label v-for="opt in champ.options" :key="opt.id" class="flex items-center cursor-pointer group" :class="{'cursor-not-allowed': formulaire.campagne && !formulaire.campagne_est_ouverte}">
                  <input type="radio" :name="champ.id" :value="opt.valeur || opt.libelle" v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" class="w-5 h-5 text-[#CE0033] border-gray-300 focus:ring-[#CE0033] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
                  <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{{ opt.libelle }}</span>
                </label>
              </div>
            </template>

            <template v-else-if="champ.type === 'CASE_A_COCHER'">
              <div class="space-y-3 mt-2">
                <label v-for="opt in champ.options" :key="opt.id" class="flex items-center cursor-pointer group" :class="{'cursor-not-allowed': formulaire.campagne && !formulaire.campagne_est_ouverte}">
                  <input type="checkbox" :value="opt.valeur || opt.libelle" v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" class="w-5 h-5 rounded border-gray-300 text-[#CE0033] focus:ring-[#CE0033] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
                  <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{{ opt.libelle }}</span>
                </label>
              </div>
            </template>

            <template v-else-if="champ.type === 'LISTE_DEROULANTE'">
              <select v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" class="w-64 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CE0033] focus:border-[#CE0033] text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="" disabled selected>Choisir</option>
                <option v-for="opt in champ.options" :key="opt.id" :value="opt.valeur || opt.libelle">
                  {{ opt.libelle }}
                </option>
              </select>
            </template>

            <template v-else-if="champ.type === 'DATE'">
              <input type="date" v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" class="w-48 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CE0033] text-sm disabled:opacity-50 disabled:cursor-not-allowed" />
            </template>
            
            <template v-else-if="champ.type === 'NOMBRE'">
              <input type="number" v-model="formResponses[champ.id]" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" :placeholder="champ.placeholderTexte || 'Votre réponse'" class="w-48 border-b-2 border-gray-300 hover:border-gray-400 focus:border-[#CE0033] focus:outline-none transition-colors py-1 text-sm bg-transparent disabled:opacity-50 disabled:cursor-not-allowed" />
            </template>

            <template v-else-if="champ.type === 'FICHIER'">
              <div class="flex items-center justify-center w-full">
                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50" :class="formulaire.campagne && !formulaire.campagne_est_ouverte ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">{{ formulaire.campagne && !formulaire.campagne_est_ouverte ? 'Ajout de fichier désactivé' : 'Cliquez pour ajouter un fichier ou glissez-déposez' }}</span></p>
                  </div>
                  <input type="file" class="hidden" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" />
                </label>
              </div>
            </template>
          </div>
        </div>

        <div class="flex justify-between items-center py-4">
          <button type="button" :disabled="formulaire.campagne && !formulaire.campagne_est_ouverte" class="bg-[#CE0033] hover:bg-[#a8002a] text-white font-medium py-2 px-6 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Envoyer
          </button>
          <span class="text-xs text-gray-400">Ceci est un aperçu.</span>
        </div>
      </div>
    </main>
  </div>
</template>
