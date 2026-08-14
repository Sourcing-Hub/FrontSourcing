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
  ClipboardList,
  User,
  QrCode,
  Layers,
  Menu,
  X
} from 'lucide-vue-next'

import { ref, computed, watch } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isMobileOpen = ref(false)

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
}

// Fermer le menu mobile lors d'un changement de route
watch(() => route.path, () => {
  isMobileOpen.value = false
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

/**
 * Navigation dynamique construite en fonction du rôle de l'utilisateur connecté.
 * Rôles gérés : Candidat, Administrateur, Équipe Pédagogique, Équipe Gestion de Projet.
 */
const navigation = computed(() => {
  const role = authStore.user?.role

  // ── Candidat ──────────────────────────────────────────────
  if (role === 'Candidat') {
    return [
      { name: 'Mes Candidatures', href: '/candidatures', icon: ClipboardList },
    ]
  }

  // ── Administrateur ─────────────────────────────────────────
  if (role === 'Administrateur') {
    return [
      { name: 'Tableau de bord',  href: '/',             icon: LineChart },
      { name: 'Formations',       href: '/formations',   icon: BookOpen },
      { name: 'Campagnes',        href: '/campagnes',    icon: Calendar },
      { name: 'Formulaires',      href: '/formulaires',  icon: FileText },
      { name: 'Candidatures',     href: '/candidatures', icon: ClipboardList },
      { name: 'Utilisateurs',     href: '/utilisateurs', icon: Users },
    ]
  }

  // ── Équipe Pédagogique ─────────────────────────────────────
  if (role === 'Équipe Pédagogique') {
    return [
      { name: 'Tableau de bord',  href: '/',             icon: LineChart },
      { name: 'Formations',       href: '/formations',   icon: BookOpen },
      { name: 'Campagnes',        href: '/campagnes',    icon: Calendar },
      { name: 'Formulaires',      href: '/formulaires',  icon: FileText },
      { name: 'Candidatures',     href: '/candidatures', icon: ClipboardList },
    ]
  }

  // ── Équipe Gestion de Projet ───────────────────────────────
  if (role === 'Équipe Gestion de Projet') {
    return [
      { name: 'Tableau de bord',  href: '/',             icon: LineChart },
      { name: 'Formations',       href: '/formations',   icon: BookOpen },
      { name: 'Campagnes',        href: '/campagnes',    icon: Calendar },
      { name: 'Formulaires',      href: '/formulaires',  icon: FileText },
      { name: 'Candidatures',     href: '/candidatures', icon: ClipboardList },
    ]
  }

  // Fallback
  return [
    { name: 'Tableau de bord', href: '/', icon: LineChart },
  ]
})
</script>

<template>
  <!-- Bouton Toggle Mobile -->
  <button
    @click="toggleMobile"
    class="md:hidden fixed top-3 left-4 z-40 p-2 rounded-lg bg-[#00313C] text-white shadow-md hover:bg-[#00222a] focus:outline-none transition-colors"
    aria-label="Toggle navigation menu"
  >
    <Menu v-if="!isMobileOpen" class="w-6 h-6" />
    <X v-else class="w-6 h-6" />
  </button>

  <!-- Overlay d'arrière-plan sur Mobile -->
  <div
    v-if="isMobileOpen"
    @click="isMobileOpen = false"
    class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
  ></div>

  <!-- Conteneur Sidebar -->
  <aside
    class="w-64 bg-[#00313C] border-r border-[#00222a] flex flex-col fixed h-full z-30 text-white shadow-xl transition-transform duration-300 ease-in-out"
    :class="[
      isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]"
  >
    <div class="h-20 flex items-center justify-between px-6 border-b border-white/10">
      <div class="flex items-center gap-3">
        <img
          src="/images/logo.png"
          alt="Sourcing Connect Logo"
          class="h-10 w-auto"
          onerror="this.style.display='none'; document.getElementById('fallback-dashboard-title').style.display='block';"
        />
        <h1 id="fallback-dashboard-title" class="hidden text-xl font-bold text-white tracking-wide">
          Sourcing<span class="text-[#CE0033]">Connect</span>
        </h1>
      </div>
      <button
        @click="isMobileOpen = false"
        class="md:hidden text-gray-400 hover:text-white p-1"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
        :class="[
          route.path === item.href || (item.href !== '/' && route.path.startsWith(item.href))
            ? 'bg-white text-[#00313C] font-semibold shadow-sm'
            : 'text-gray-200 hover:bg-white/10 hover:text-white',
        ]"
      >
        <component
          :is="item.icon"
          class="mr-3.5 h-5 w-5 flex-shrink-0"
          :class="[
            route.path === item.href || (item.href !== '/' && route.path.startsWith(item.href))
              ? 'text-[#00313C]'
              : 'text-gray-300',
          ]"
        />
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-white/10 bg-[#002B35]">
      <div class="flex items-center px-2 py-2 mb-3">
        <div
          class="h-9 w-9 rounded-full bg-white text-[#00313C] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0"
        >
          <template v-if="authStore.user?.prenom || authStore.user?.nom">
            {{ authStore.user?.prenom?.charAt(0) || '' }}{{ authStore.user?.nom?.charAt(0) || '' }}
          </template>
          <template v-else>
            <Users class="h-4 w-4" />
          </template>
        </div>
        <div class="ml-3 overflow-hidden">
          <p class="text-sm font-semibold text-white truncate leading-tight">
            <template v-if="authStore.user?.prenom || authStore.user?.nom">
              {{ authStore.user?.prenom }} {{ authStore.user?.nom }}
            </template>
            <template v-else>
              {{ authStore.user?.role || 'Utilisateur' }}
            </template>
          </p>
          <p class="text-xs text-gray-300/80 truncate mt-0.5">{{ authStore.user?.email || '' }}</p>
        </div>
      </div>
      <div class="space-y-1">
        <RouterLink
          to="/profil"
          class="w-full flex items-center px-3 py-2 text-xs font-medium text-gray-200 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
        >
          <User class="mr-2.5 h-4 w-4" />
          Mon Profil
        </RouterLink>
        <button
          @click="handleLogout"
          class="w-full flex items-center px-3 py-2 text-xs font-medium text-red-300 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogOut class="mr-2.5 h-4 w-4" />
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
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}
</style>
