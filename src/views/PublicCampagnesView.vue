<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { Calendar, BookOpen, ArrowRight, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const campaigns = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('campagnes/publiques/')
    campaigns.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des campagnes publiques', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#00313C] text-white flex flex-col relative overflow-hidden">
    <!-- Formes décoratives -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#CE0033] opacity-20 blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
    </div>

    <!-- Header -->
    <header class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 relative z-10">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold text-white tracking-wide cursor-pointer" @click="router.push('/login')">
          Sourcing<span class="text-[#CE0033]">Connect</span>
        </h1>
        <button
          @click="router.push('/login')"
          class="px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          Espace Connexion
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-12 relative z-10">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          Nos Campagnes de Recrutement Ouvertes
        </h2>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          Découvrez nos formations et postulez directement en ligne pour rejoindre l'une de nos cohortes de formation.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <Loader2 class="w-10 h-10 animate-spin text-[#CE0033]" />
      </div>

      <div v-else-if="campaigns.length === 0" class="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-lg mx-auto">
        <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-medium text-white mb-2">Aucune campagne ouverte</h3>
        <p class="text-gray-300 text-sm">Il n'y a pas de campagne de recrutement en cours pour le moment. Revenez bientôt !</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="camp in campaigns"
          :key="camp.id"
          class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-[#CE0033]/50 transition-all duration-300"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ouverte
              </span>
              <span class="text-xs text-gray-300 flex items-center">
                <Calendar class="w-3.5 h-3.5 mr-1" />
                Clôture le : {{ new Date(camp.dateCloture).toLocaleDateString('fr-FR') }}
              </span>
            </div>

            <h3 class="text-xl font-bold text-white mb-2">{{ camp.nom }}</h3>
            
            <div class="space-y-1 mb-4">
              <div class="text-sm text-gray-300 flex items-center">
                <BookOpen class="w-4 h-4 mr-1.5 text-[#CE0033]" />
                Formation : <span class="font-medium text-white ml-1">{{ camp.formation_nom }}</span>
              </div>
              <div class="text-sm text-gray-300">
                Cohorte : <span class="text-white ml-1">{{ camp.cohorte_nom }}</span>
              </div>
            </div>

            <p class="text-sm text-gray-300 line-clamp-3 mb-6">
              {{ camp.description || 'Aucune description disponible pour cette campagne de recrutement.' }}
            </p>
          </div>

          <button
            @click="router.push(`/postuler/${camp.id}`)"
            class="w-full flex items-center justify-center py-3 bg-[#CE0033] hover:bg-[#a8002a] text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-[#CE0033]/20"
          >
            Déposer ma candidature
            <ArrowRight class="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
