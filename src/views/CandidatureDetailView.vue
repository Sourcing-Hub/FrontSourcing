<script setup>
/**
 * Vue détaillée d'une candidature : réponses aux formulaires, pièces jointes et étapes d'évaluation.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCandidaturesStore } from '../stores/candidatures'
import { useAuthStore } from '../stores/auth'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { ArrowLeft, Loader2, Calendar, FileText, Download, CheckCircle, Clock } from 'lucide-vue-next'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const store = useCandidaturesStore()
const authStore = useAuthStore()

const id = route.params.id

onMounted(async () => {
  await store.fetchCandidature(id)
})

const getDownloadUrl = (filePath) => {
  // If the file path is a full url, return it. Otherwise prefix with backend URL
  if (filePath.startsWith('http')) return filePath
  const baseUrl = api.defaults.baseURL.replace('/api/', '')
  return `${baseUrl}${filePath}`
}
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center">
        <button @click="router.back()" class="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-semibold text-gray-900">
          Candidature {{ store.currentCandidature?.numero }}
        </h2>
      </div>
    </template>

    <div v-if="store.loading || !store.currentCandidature" class="flex justify-center items-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Section Gauche : Détails & Statut -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Détails de la candidature -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Informations de Candidature</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Campagne</span>
              <span class="text-sm font-medium text-gray-900 mt-1 block">
                {{ store.currentCandidature.campagne_details?.nom }}
              </span>
            </div>
            <div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Formation</span>
              <span class="text-sm font-medium text-gray-900 mt-1 block">
                {{ store.currentCandidature.formation_nom }}
              </span>
            </div>
            <div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Cohorte</span>
              <span class="text-sm font-medium text-gray-900 mt-1 block">
                {{ store.currentCandidature.cohorte_nom }}
              </span>
            </div>
            <div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Date de soumission</span>
              <span class="text-sm font-medium text-gray-900 mt-1 block">
                {{ new Date(store.currentCandidature.dateSoumission).toLocaleString('fr-FR') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Réponses du Formulaire -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Réponses au Formulaire</h3>
          
          <div class="space-y-6">
            <div v-for="rep in store.currentCandidature.reponses" :key="rep.id" class="border-b border-gray-50 pb-4 last:border-b-0">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                {{ rep.champ_libelle }}
              </span>
              
              <span class="text-sm text-gray-900 mt-1 block font-medium">
                <!-- Si la réponse est un fichier, on indique sa valeur -->
                <template v-if="rep.champ_type === 'FICHIER'">
                  <span class="flex items-center text-primary-600">
                    <FileText class="w-4 h-4 mr-1.5" />
                    Document joint : {{ rep.valeur }}
                  </span>
                </template>
                <template v-else>
                  {{ rep.valeur || 'Non renseigné' }}
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Droite : Candidat & Documents -->
      <div class="space-y-6">
        
        <!-- Statut global -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Statut Actuel</span>
          
          <div class="inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm"
               :class="{
                 'bg-amber-50 text-amber-800 border border-amber-200': store.currentCandidature.statut === 'EN_ATTENTE',
                 'bg-blue-50 text-blue-800 border border-blue-200': store.currentCandidature.statut === 'EN_COURS',
                 'bg-emerald-50 text-emerald-800 border border-emerald-200': store.currentCandidature.statut === 'TERMINEE'
               }">
            <Clock v-if="store.currentCandidature.statut === 'EN_ATTENTE'" class="w-4 h-4 mr-1.5" />
            <Clock v-if="store.currentCandidature.statut === 'EN_COURS'" class="w-4 h-4 mr-1.5" />
            <CheckCircle v-if="store.currentCandidature.statut === 'TERMINEE'" class="w-4 h-4 mr-1.5" />
            {{ store.currentCandidature.statut === 'EN_ATTENTE' ? 'En attente' : store.currentCandidature.statut === 'EN_COURS' ? 'En cours' : 'Terminée' }}
          </div>
        </div>

        <!-- Informations Candidat -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h4 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Profil du Candidat</h4>
          
          <div class="space-y-3">
            <div>
              <span class="text-xs text-gray-400 block">Nom & Prénom</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ store.currentCandidature.candidat?.first_name }} {{ store.currentCandidature.candidat?.last_name }}
              </span>
            </div>
            <div>
              <span class="text-xs text-gray-400 block">Adresse Email</span>
              <span class="text-sm font-semibold text-gray-900">{{ store.currentCandidature.candidat?.email }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400 block">Téléphone</span>
              <span class="text-sm font-semibold text-gray-900">{{ store.currentCandidature.candidat?.telephone }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400 block">Sexe</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ store.currentCandidature.candidat?.sexe === 'HOMME' ? 'Homme' : 'Femme' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Documents Téléchargeables -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h4 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Documents Joints</h4>
          
          <div v-if="store.currentCandidature.documents.length === 0" class="text-center py-4 text-xs text-gray-400">
            Aucun fichier joint à cette candidature.
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="doc in store.currentCandidature.documents" 
              :key="doc.id"
              class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center overflow-hidden">
                <FileText class="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                <span class="text-xs text-gray-700 truncate font-medium">{{ doc.nom }}</span>
              </div>
              <a 
                :href="getDownloadUrl(doc.chemin)" 
                download
                target="_blank"
                class="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100 flex-shrink-0 transition-colors"
                title="Télécharger"
              >
                <Download class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
