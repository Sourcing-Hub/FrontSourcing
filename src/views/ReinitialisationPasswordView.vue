<script setup>
/**
 * Vue permettant de réinitialiser le mot de passe après avoir cliqué sur le lien reçu par e-mail.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { Key, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const token = ref(route.params.token || '')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  error.value = ''
  success.value = false

  if (!token.value) {
    error.value = "Le lien de réinitialisation est invalide."
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Les deux mots de passe ne correspondent pas."
    return
  }

  if (newPassword.value.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères."
    return
  }

  loading.value = true

  try {
    await api.post('auth/reinit-mdp/confirmer/', {
      token: token.value,
      nouveau_mot_de_passe: newPassword.value,
      confirmation: confirmPassword.value,
    })
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.token || err.response?.data?.nouveau_mot_de_passe || err.response?.data?.detail || "Le lien a expiré ou est invalide."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50/60 p-4 sm:p-6 lg:p-8">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-red-50 text-[#CE0033] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Key class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Nouveau Mot de Passe</h2>
        <p class="text-xs text-gray-500 max-w-xs mx-auto">
          Définissez un nouveau mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <div v-if="success" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-xs space-y-3">
        <div class="flex items-center gap-2 font-bold text-emerald-700 text-sm">
          <CheckCircle2 class="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Mot de passe modifié avec succès !</span>
        </div>
        <p class="text-emerald-700">
          Votre mot de passe a été réinitialisé. Vous pouvez désormais vous connecter avec votre nouveau mot de passe.
        </p>
        <button
          @click="router.push('/login')"
          class="w-full mt-2 py-3 bg-[#002B35] hover:bg-[#001D24] text-white rounded-xl text-xs font-bold transition-colors"
        >
          Se connecter
        </button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Nouveau mot de passe</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="newPassword"
              required
              placeholder="Au moins 8 caractères"
              class="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Confirmer le mot de passe</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              required
              placeholder="Répétez le mot de passe"
              class="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 bg-[#002B35] hover:bg-[#001D24] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span>Valider le nouveau mot de passe</span>
        </button>
      </form>
    </div>
  </div>
</template>
