<script setup>
/**
 * Vue de consultation et mise à jour du profil utilisateur (nom, prénom, téléphone, sexe).
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Loader2, ShieldAlert, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  prenom: '',
  nom: '',
  telephone: '',
  sexe: 'HOMME', // Par défaut
  profilComplet: true // On le met à true pour valider l'étape
})

const isSuccess = ref(false)

const submitProfile = async () => {
  const success = await authStore.updateProfile(formData.value)
  if (success) {
    isSuccess.value = true
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
}
</script>

<template>
  <!-- Si profil non complet, on affiche sans sidebar pour focaliser l'attention -->
  <div v-if="!authStore.user?.profilComplet" class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <img src="/images/logo.png" alt="Logo" class="h-16 w-auto" onerror="this.style.display='none'" />
      </div>
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        Compléter votre profil
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Avant d'accéder à la plateforme, nous avons besoin de quelques informations.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
        <form @submit.prevent="submitProfile" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" v-model="formData.prenom" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" v-model="formData.nom" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Téléphone</label>
            <input type="tel" v-model="formData.telephone" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" />
          </div>
          <div>
            <button type="submit" :disabled="authStore.loading" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#CE0033] hover:bg-[#a8002a] focus:outline-none transition-colors disabled:opacity-50">
              <Loader2 v-if="authStore.loading" class="w-4 h-4 mr-2 animate-spin" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Si profil complet, on affiche dans le DashboardLayout -->
  <DashboardLayout v-else>
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p class="text-sm text-gray-600 mt-1">Gérez vos informations personnelles.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-8">
          
          <div v-if="isSuccess" class="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded flex items-start">
            <CheckCircle class="w-5 h-5 text-emerald-500 mr-2 mt-0.5" />
            <span class="text-sm text-emerald-700">Profil mis à jour avec succès.</span>
          </div>

          <form @submit.prevent="submitProfile" class="space-y-6">
            
            <div v-if="authStore.error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start">
              <ShieldAlert class="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <span class="text-sm text-red-700">{{ authStore.error }}</span>
            </div>

            <!-- Email en lecture seule -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Adresse Email</label>
              <input
                type="email"
                :value="authStore.user?.email"
                disabled
                class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
              />
              <p v-if="!authStore.isAdmin" class="mt-1 text-xs text-gray-500">
                Seul l'Administrateur peut modifier votre adresse email.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  v-model="formData.prenom"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  v-model="formData.nom"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                v-model="formData.telephone"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Sexe</label>
              <select
                v-model="formData.sexe"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm"
              >
                <option value="HOMME">Homme</option>
                <option value="FEMME">Femme</option>
              </select>
            </div>

            <div class="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                :disabled="authStore.loading"
                class="flex justify-center items-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#CE0033] hover:bg-[#a8002a] focus:outline-none transition-colors disabled:opacity-50"
              >
                <Loader2 v-if="authStore.loading" class="w-4 h-4 mr-2 animate-spin" />
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
