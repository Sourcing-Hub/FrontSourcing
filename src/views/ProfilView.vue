<script setup>
/**
 * Vue de consultation et mise à jour du profil utilisateur (nom, prénom, téléphone, sexe)
 * et gestion du changement de mot de passe.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Loader2, ShieldAlert, CheckCircle, Key, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  prenom: authStore.user?.prenom || '',
  nom: authStore.user?.nom || '',
  telephone: authStore.user?.telephone || '',
  sexe: authStore.user?.sexe || 'HOMME',
  profilComplet: true
})

const passwordData = ref({
  ancien_mot_de_passe: '',
  nouveau_mot_de_passe: '',
  confirmation: ''
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isProfileSuccess = ref(false)
const isPasswordSuccess = ref(false)
const passwordError = ref('')
const passwordLoading = ref(false)

const submitProfile = async () => {
  const success = await authStore.updateProfile(formData.value)
  if (success) {
    isProfileSuccess.value = true
    setTimeout(() => {
      if (!authStore.user?.profilComplet) {
        router.push('/')
      } else {
        isProfileSuccess.value = false
      }
    }, 2000)
  }
}

const submitPasswordChange = async () => {
  passwordError.value = ''
  isPasswordSuccess.value = false

  if (passwordData.value.nouveau_mot_de_passe !== passwordData.value.confirmation) {
    passwordError.value = "Les deux mots de passe ne correspondent pas."
    return
  }

  if (passwordData.value.nouveau_mot_de_passe.length < 8) {
    passwordError.value = "Le nouveau mot de passe doit contenir au moins 8 caractères."
    return
  }

  passwordLoading.value = true
  const success = await authStore.changePassword(
    passwordData.value.ancien_mot_de_passe,
    passwordData.value.nouveau_mot_de_passe,
    passwordData.value.confirmation
  )

  passwordLoading.value = false

  if (success) {
    isPasswordSuccess.value = true
    passwordData.value = { ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmation: '' }
    setTimeout(() => { isPasswordSuccess.value = false }, 4000)
  } else {
    passwordError.value = authStore.error || "Impossible de modifier le mot de passe."
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
    <div class="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Mon Profil</h1>
        <p class="text-sm text-gray-600 mt-1">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <!-- Carte 1 : Informations Personnelles -->
      <div class="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
        <div class="p-6 sm:p-8 space-y-6">
          <h2 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Informations Personnelles</h2>
          
          <div v-if="isProfileSuccess" class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center text-emerald-800 text-xs font-semibold gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-600" />
            <span>Profil mis à jour avec succès.</span>
          </div>

          <form @submit.prevent="submitProfile" class="space-y-5">
            <div v-if="authStore.error && !passwordError" class="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center text-red-700 text-xs gap-2">
              <ShieldAlert class="w-4 h-4 text-red-500" />
              <span>{{ authStore.error }}</span>
            </div>

            <!-- Email en lecture seule -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Adresse Email</label>
              <input
                type="email"
                :value="authStore.user?.email"
                disabled
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  v-model="formData.prenom"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  v-model="formData.nom"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  v-model="formData.telephone"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Sexe</label>
                <select
                  v-model="formData.sexe"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                >
                  <option value="HOMME">Homme</option>
                  <option value="FEMME">Femme</option>
                </select>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                :disabled="authStore.loading"
                class="px-5 py-2.5 bg-[#CE0033] hover:bg-[#a8002a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" />
                Enregistrer le profil
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Carte 2 : Changement de Mot de Passe -->
      <div class="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
        <div class="p-6 sm:p-8 space-y-6">
          <div class="flex items-center gap-2.5 border-b border-gray-100 pb-3">
            <Key class="w-5 h-5 text-[#002B35]" />
            <h2 class="text-lg font-bold text-gray-900">Sécurité & Mot de Passe</h2>
          </div>

          <div v-if="isPasswordSuccess" class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center text-emerald-800 text-xs font-bold gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Votre mot de passe a été modifié avec succès !</span>
          </div>

          <div v-if="passwordError" class="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center text-red-700 text-xs font-medium gap-2">
            <ShieldAlert class="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{{ passwordError }}</span>
          </div>

          <form @submit.prevent="submitPasswordChange" class="space-y-4">
            <!-- Ancien mot de passe -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Ancien mot de passe</label>
              <div class="relative">
                <input
                  :type="showOldPassword ? 'text' : 'password'"
                  v-model="passwordData.ancien_mot_de_passe"
                  required
                  placeholder="••••••••"
                  class="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                />
                <button
                  type="button"
                  @click="showOldPassword = !showOldPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <EyeOff v-if="showOldPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Nouveau mot de passe -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Nouveau mot de passe</label>
                <div class="relative">
                  <input
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model="passwordData.nouveau_mot_de_passe"
                    required
                    placeholder="Au moins 8 caractères"
                    class="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <div class="relative">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="passwordData.confirmation"
                    required
                    placeholder="Répétez le nouveau mot de passe"
                    class="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                :disabled="passwordLoading"
                class="px-5 py-2.5 bg-[#002B35] hover:bg-[#001D24] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Loader2 v-if="passwordLoading" class="w-4 h-4 animate-spin" />
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
