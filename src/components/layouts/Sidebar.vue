<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { 
  LogOut, 
  LineChart, 
  Users, 
  BookOpen, 
  FileText,
  Calendar,
  ClipboardList
} from 'lucide-vue-next'

import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const navigation = computed(() => {
  if (authStore.user?.role === 'Candidat') {
    return [
      { name: 'Mes Candidatures', href: '/candidatures', icon: ClipboardList }
    ]
  }
  return [
    { name: 'Vue globale', href: '/', icon: LineChart },
    { name: 'Campagnes', href: '/campagnes', icon: Calendar },
    { name: 'Formulaires', href: '/formulaires', icon: ClipboardList },
    { name: 'Candidats', href: '/candidats', icon: Users },
    { name: 'Gestion des tests', href: '/tests', icon: Users },
    { name: 'Formations', href: '/formations', icon: BookOpen },
    { name: 'Entretiens', href: '/entretiens', icon: BookOpen },
    { name: 'Candidatures', href: '/candidatures', icon: BookOpen },
    { name: 'Rapports', href: '/rapports', icon: FileText },
    { name: 'Questionnaires', href: '/questionnaires', icon: FileText },
    { name: 'Plannification', href: '/plannification', icon: FileText },
    { name: 'Convocations', href: '/convocations', icon: FileText },
    { name: 'Evaluateurs', href: '/evaluateurs', icon: FileText },
  ]
})
</script>

<template>
  <aside class="w-64 bg-[#00313C] border-r border-[#00222a] flex flex-col fixed h-full z-10 text-white shadow-xl">
    <div class="h-20 flex items-center justify-center px-6 border-b border-white/10">
      <img
        src="/images/logo.png"
        alt="Sourcing Connect Logo"
        class="h-12 w-auto"
        onerror="this.style.display='none'; document.getElementById('fallback-dashboard-title').style.display='block';"
      />
      <h1 id="fallback-dashboard-title" class="hidden text-xl font-bold text-white">
        Sourcing<span class="text-primary-300">Connect</span>
      </h1>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
        :class="[
          route.path === item.href || (item.href !== '/' && route.path.startsWith(item.href))
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-300 hover:bg-white/10 hover:text-white',
        ]"
      >
        <component
          :is="item.icon"
          class="mr-4 h-5 w-5 flex-shrink-0"
          :class="[
            route.path === item.href || (item.href !== '/' && route.path.startsWith(item.href))
              ? 'text-gray-900'
              : 'text-gray-300',
          ]"
        />
        {{ item.name }}
      </RouterLink>

      <!-- Liens spécifiques Administrateur -->
      <div v-if="authStore.isAdmin" class="mt-6 pt-6 border-t border-white/10">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Administration
        </h3>
        <RouterLink
          to="/utilisateurs"
          class="flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
          :class="[
            route.path === '/utilisateurs'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-300 hover:bg-white/10 hover:text-white',
          ]"
        >
          <Users class="mr-4 h-5 w-5 flex-shrink-0" />
          Utilisateurs
        </RouterLink>
      </div>
    </nav>

    <div class="p-4 border-t border-white/10 bg-[#00313C]">
      <div class="flex items-center px-3 py-2 mb-4">
        <div
          class="h-10 w-10 rounded-full bg-white text-[#00313C] flex items-center justify-center font-bold text-lg"
        >
          <template v-if="authStore.user?.prenom || authStore.user?.nom">
            {{ authStore.user?.prenom?.charAt(0) || '' }}{{ authStore.user?.nom?.charAt(0) || '' }}
          </template>
          <template v-else>
            <Users class="h-5 w-5" />
          </template>
        </div>
        <div class="ml-3 overflow-hidden">
          <p class="text-sm font-semibold text-white truncate">
            <template v-if="authStore.user?.prenom || authStore.user?.nom">
              {{ authStore.user?.prenom }} {{ authStore.user?.nom }}
            </template>
            <template v-else>
              {{ authStore.user?.role || 'Utilisateur' }}
            </template>
          </p>
          <p class="text-xs text-gray-400 truncate">{{ authStore.user?.email || '' }}</p>
        </div>
      </div>
      <div class="space-y-1 mb-2">
        <RouterLink
          to="/profil"
          class="w-full flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <Users class="mr-3 h-4 w-4" />
          Mon Profil
        </RouterLink>
        <button
          @click="handleLogout"
          class="w-full flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut class="mr-3 h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}
</style>
