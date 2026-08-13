<script setup>
/**
 * Page de connexion (Login) permettant l'authentification des utilisateurs par email et mot de passe.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Section Image (Gauche) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
      
      <img
        src="/images/login-bg.png"
        alt="Sourcing Connect Team"
        class="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
        onerror="this.src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';"
      />
      
      <!-- Overlay de dégradé pour la lisibilité du texte -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      
      <div class="absolute bottom-12 left-12 right-12 text-white z-10 animate-slide-up">
        <h2 class="text-4xl font-bold mb-4">Rejoignez Sourcing Connect</h2>
        <p class="text-lg text-gray-200">
          Trouvez les meilleurs talents ou la meilleure formation avec notre plateforme intégrée de sourcing.
        </p>
      </div>
    </div>

<!-- Section Formulaire (Droite) -->
    <div
      class="flex-1 flex items-center justify-center bg-[#00313C] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <!-- Décoration d'arrière-plan -->
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"
      ></div>

      <div class="max-w-md w-full space-y-8 glass-panel p-10 relative z-10 animate-fade-in">
        <div class="flex flex-col items-center">
          <!-- Logo de l'entreprise -->
          <img
            src="/images/logo.png"
            alt="Sourcing Connect Logo"
            class="h-16 w-auto mb-4"
            onerror="this.style.display='none'; document.getElementById('fallback-title').style.display='block';"
          />
          <!-- Titre de secours si le logo ne charge pas -->
          <h2 id="fallback-title" class="hidden text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Sourcing<span class="text-primary-600">Connect</span>
          </h2>
          
          <p class="mt-2 text-center text-sm text-gray-600">
            Connectez-vous à votre espace personnel
          </p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <!-- Message d'erreur -->
          <div v-if="authStore.error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ authStore.error }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-md space-y-4 shadow-sm">
            <div class="relative">
              <label for="email-address" class="sr-only">Adresse email</label>
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="email"
                class="input-field pl-10"
                placeholder="Adresse email"
              />
            </div>
            <div class="relative">
              <label for="password" class="sr-only">Mot de passe</label>
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="password"
                class="input-field pl-10"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div class="text-sm">
              <a
                href="#"
                class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-primary-500/30"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <Loader2 v-if="authStore.loading" class="h-5 w-5 text-primary-300 animate-spin" />
                <LogIn
                  v-else
                  class="h-5 w-5 text-primary-300 group-hover:text-primary-200 transition-colors"
                />
              </span>
              {{ authStore.loading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </div>

          <div class="text-center pt-2">
            <router-link
              to="/postuler"
              class="font-semibold text-primary-400 hover:text-primary-300 transition-colors text-sm"
            >
              Vous souhaitez postuler ? Découvrir nos campagnes
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* Ajout d'une petite animation de blob pour l'arrière-plan de login */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
