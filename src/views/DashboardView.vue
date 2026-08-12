<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import api from '../services/api'

const authStore = useAuthStore()

const stats = ref({
  campagnes_actives: 0,
  candidatures_en_cours: 0,
  entretiens_prevus: 0
})

const fetchStats = async () => {
  try {
    const response = await api.get('/dashboard/stats/')
    stats.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <DashboardLayout>
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900">Tableau de bord</h2>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div class="card p-6 border-l-4 border-primary-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">
          Campagnes Actives
        </h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.campagnes_actives }}</p>
      </div>

      <div class="card p-6 border-l-4 border-green-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">
          Candidatures en cours
        </h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.candidatures_en_cours }}</p>
      </div>

      <div class="card p-6 border-l-4 border-blue-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">
          Entretiens prévus
        </h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.entretiens_prevus }}</p>
      </div>
    </div>
  </DashboardLayout>
</template>
