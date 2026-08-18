<script setup>
/**
 * Page de connexion (Login) combinant l'arrière-plan esthétique (split image + blobs #00313C)
 * et les fonctionnalités complètes du formulaire.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { Mail, Lock, Loader2, CheckCircle2, AlertCircle, X, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// Modal "Mot de passe oublié / Lien par email"
const showResetModal = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetSuccess = ref(false)
const resetError = ref('')

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}

const openResetModal = () => {
  resetEmail.value = email.value
  resetError.value = ''
  resetSuccess.value = false
  showResetModal.value = true
}

const handleResetPassword = async () => {
  if (!resetEmail.value) {
    resetError.value = "Veuillez saisir votre adresse e-mail."
    return
  }
  resetLoading.value = true
  resetError.value = ''
  try {
    await api.post('auth/reinit-mdp/', { email: resetEmail.value })
    resetSuccess.value = true
  } catch (err) {
    resetError.value = err.response?.data?.detail || "Une erreur est survenue lors de l'envoi de l'e-mail."
  } finally {
    resetLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Section Image & Dégradé (Gauche) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
      <img
        src="/images/login-bg.png"
        alt="Sourcing Connect Team"
        class="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
        onerror="this.src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      <div class="absolute bottom-12 left-12 right-12 text-white z-10">
        <h2 class="text-4xl font-bold mb-4 tracking-tight">Rejoignez Sourcing Connect</h2>
        <p class="text-lg text-gray-200 leading-relaxed">
          Trouvez les meilleurs talents ou la meilleure formation avec notre plateforme intégrée de sourcing.
        </p>
      </div>
    </div>

    <!-- Section Formulaire avec fond clair #FAFAFA et motif de petits cubes (Droite) -->
    <div
      class="flex-1 flex items-center justify-center bg-[#FAFAFA] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <!-- Blobs animés doux en arrière-plan -->
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-[#CE0033]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-[#002B35]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
      ></div>

      <!-- Carte du formulaire -->
      <div class="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 space-y-6 relative z-10">
        
        <!-- En-tête / Logo -->
        <div class="flex flex-col items-center text-center">
          <img
            src="/images/logo1.png"
            alt="Sourcing Connect Logo"
            class="h-14 w-auto mb-3"
            onerror="this.style.display='none'; document.getElementById('fallback-title').style.display='block';"
          />
          <h2 id="fallback-title" class="hidden text-center text-2xl font-extrabold text-[#002B35] tracking-tight">
            Sourcing<span class="text-[#CE0033]">Connect</span>
          </h2>
          
          <h3 class="text-2xl font-extrabold text-[#002B35] tracking-tight mt-1">Connexion à votre espace</h3>
          <p class="text-xs text-gray-400 font-medium mt-1">Simplon Sourcing Connect</p>
        </div>

        <!-- Formulaire de Connexion -->
        <form @submit.prevent="handleLogin" class="space-y-4 pt-1">
          
          <!-- Champ Email -->
          <div class="space-y-1.5">
            <label for="email" class="block text-xs font-bold text-gray-700">Email</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                v-model="email"
                required
                placeholder="nom@gmail.com"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <!-- Champ Mot de passe avec lien aligné à droite et icône œil -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="password" class="block text-xs font-bold text-gray-700">Mot de passe</label>
              <button
                type="button"
                @click="openResetModal()"
                class="text-xs font-semibold text-gray-500 hover:text-[#CE0033] transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033] transition-all"
                :class="{ 'border-[#CE0033] ring-2 ring-[#CE0033]/10': authStore.error }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition-colors"
                :title="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>

            <!-- Message d'erreur rouge directement sous le mot de passe -->
            <p v-if="authStore.error" class="text-xs text-[#CE0033] font-semibold pt-0.5">
              {{ authStore.error.toLowerCase().includes('identifiant') || authStore.error.toLowerCase().includes('invalide') ? 'mot de passe incorrect' : authStore.error }}
            </p>
          </div>

          <!-- Case Se souvenir de moi -->
          <div class="flex items-center pt-1">
            <input
              id="remember-me"
              type="checkbox"
              v-model="rememberMe"
              class="h-4 w-4 text-[#002B35] focus:ring-[#002B35] border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2.5 block text-xs font-semibold text-gray-600">
              Se souvenir de moi
            </label>
          </div>

          <!-- Bouton Se connecter -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3.5 px-4 bg-[#002B35] hover:bg-[#001D24] text-white text-sm font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" />
            <span>Se connecter</span>
          </button>

          <!-- État "Traitement en cours..." lorsque la connexion est en cours -->
          <div
            v-if="authStore.loading"
            class="w-full py-3 px-4 bg-gray-200/80 text-gray-600 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 animate-pulse"
          >
            <Loader2 class="w-4 h-4 animate-spin text-gray-600" />
            <span>Traitement en cours...</span>
          </div>

          <!-- Séparateur "OU CONTINUER AVEC" -->
          <div class="relative my-5">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200/80"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-white px-3 text-gray-400 font-semibold tracking-wider text-[11px]">
                ou continuer avec
              </span>
            </div>
          </div>

          <!-- Bouton : Recevoir un lien de connexion par email -->
          <button
            type="button"
            @click="openResetModal()"
            class="w-full py-3 px-4 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Mail class="w-4 h-4 text-gray-600" />
            <span>Recevoir un lien de connexion par email</span>
          </button>

          <!-- Lien candidat -->
          <div class="text-center pt-3 border-t border-gray-100">
            <router-link
              to="/"
              class="text-xs font-bold text-[#CE0033] hover:text-[#a8002a] transition-colors"
            >
              Vous souhaitez postuler ? Découvrir nos campagnes
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Réinitialisation / Lien Email -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-gray-100 relative">
        <button
          @click="showResetModal = false"
          class="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-red-50 text-[#CE0033] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Mail class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">Réinitialisation / Connexion par e-mail</h3>
          <p class="text-xs text-gray-500 max-w-xs mx-auto">
            Saisissez votre e-mail pour recevoir un lien de connexion ou de réinitialisation sécurisé.
          </p>
        </div>

        <div v-if="resetSuccess" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs space-y-2">
          <div class="flex items-center gap-2 font-bold text-emerald-700">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>E-mail envoyé avec succès !</span>
          </div>
          <p class="text-emerald-700">
            Si un compte correspond à cette adresse e-mail, vous recevrez sous peu votre lien sécurisé.
          </p>
          <button
            @click="showResetModal = false"
            class="w-full mt-3 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Fermer
          </button>
        </div>

        <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
          <div v-if="resetError" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{{ resetError }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Votre adresse e-mail</label>
            <input
              type="email"
              v-model="resetEmail"
              required
              placeholder="nom@gmail.com"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0033]/20 focus:border-[#CE0033]"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="showResetModal = false"
              class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="resetLoading"
              class="flex-1 py-2.5 bg-[#002B35] hover:bg-[#001D24] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Loader2 v-if="resetLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ resetLoading ? 'Envoi...' : 'Envoyer le lien' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.08); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 8s infinite ease-in-out;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
