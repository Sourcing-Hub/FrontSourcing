<script setup>
/**
 * Vue d'activation du compte utilisateur avec auto-login et redirection vers le profil.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { CheckCircle, ShieldAlert, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = route.params.token
const password = ref('')
const confirmPassword = ref('')
const isSuccess = ref(false)

onMounted(() => {
  // Sécurité: Si quelqu'un est déjà connecté (ex: un admin), on le déconnecte
  // pour éviter d'être redirigé vers le mauvais dashboard après l'activation.
  if (authStore.isAuthenticated) {
    authStore.logout()
  }
})

const activate = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = "Les mots de passe ne correspondent pas."
    return
  }
  
  const result = await authStore.activateAccount(token, password.value, confirmPassword.value)
  if (result && result.email) {
    // Connexion automatique pour fluidifier l'expérience
    const loginSuccess = await authStore.login(result.email, password.value)
    if (loginSuccess) {
      // Le guard de route dans router/index.js forcera la redirection vers /profil
      // car le profil de ce nouvel utilisateur n'est pas encore complet.
      router.push('/dashboard')
    } else {
      isSuccess.value = true
    }
  } else if (result) {
    isSuccess.value = true
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#00313C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Formes décoratives (identique au login) -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#CE0033] opacity-20 blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="flex justify-center mb-6">
        <h2 class="text-center text-3xl font-extrabold text-white">SourcingHub</h2>
      </div>
      <h2 class="mt-2 text-center text-2xl font-bold text-white">
        Activation de votre compte
      </h2>
      <p class="mt-2 text-center text-sm text-gray-300">
        Bienvenue ! Définissez votre mot de passe pour commencer.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-white/10 backdrop-blur-md py-8 px-4 sm:rounded-2xl sm:px-10 border border-white/20">
        
        <div v-if="isSuccess" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <CheckCircle class="h-6 w-6 text-emerald-600" />
          </div>
          <h3 class="text-lg font-medium text-white mb-2">Compte activé !</h3>
          <p class="text-sm text-gray-300 mb-6">
            Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter à la plateforme.
          </p>
          <button
            @click="router.push('/login')"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#CE0033] hover:bg-[#a8002a] focus:outline-none transition-colors"
          >
            Aller à la connexion
          </button>
        </div>

        <form v-else class="space-y-6" @submit.prevent="activate">
          
          <div v-if="authStore.error" class="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-md flex items-start">
            <ShieldAlert class="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <span class="text-sm text-red-200">{{ authStore.error }}</span>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-200">
              Nouveau mot de passe
            </label>
            <div class="mt-1">
              <input
                id="password"
                type="password"
                v-model="password"
                required
                class="appearance-none block w-full px-3 py-2.5 border border-white/10 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm bg-white/5 text-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-200">
              Confirmer le mot de passe
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                type="password"
                v-model="confirmPassword"
                required
                class="appearance-none block w-full px-3 py-2.5 border border-white/10 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm bg-white/5 text-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#CE0033] hover:bg-[#a8002a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#00313C] focus:ring-[#CE0033] transition-all duration-200 disabled:opacity-50"
            >
              <Loader2 v-if="authStore.loading" class="w-4 h-4 mr-2 animate-spin" />
              Activer mon compte
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
