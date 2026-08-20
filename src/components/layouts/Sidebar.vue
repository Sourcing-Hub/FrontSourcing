<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  useAuthStore,
} from '../../stores/auth'

import logo from '@/assets/media/logo.png'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const mobileOpen = ref(false)

/* ============================================================
   FERMER LE MENU MOBILE APRÈS CHANGEMENT DE ROUTE
   ============================================================ */

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)

/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {
  authStore.logout()
  router.push('/login')
}

function goHome() {
  const normalizedRole = authStore.user?.role
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalizedRole === 'evaluateur') {
    router.push('/evaluator/candidates')
    return
  }

  router.push('/')
}

/* ============================================================
   NAVIGATION
   ============================================================ */

const navigation = computed(() => {
  const role = authStore.user?.role
  const normalizedRole = role
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  /* ─────────────────────────────────────────────────────────
     CANDIDAT
     ───────────────────────────────────────────────────────── */

  if (normalizedRole === 'Candidat') {
    return [
      {
        label: 'Mes candidatures',
        icon: 'clipboard',
        href: '/candidatures',
      },
    ]
  }

  /* ─────────────────────────────────────────────────────────
     ADMINISTRATEUR
     ───────────────────────────────────────────────────────── */

  if (normalizedRole === 'administrateur') {
    return [
      {
        label: 'Tableau de bord',
        icon: 'dashboard',
        href: '/',
      },
      {
        label: 'Formations',
        icon: 'book',
        href: '/formations',
      },
      {
        label: 'Campagnes',
        icon: 'calendar',
        href: '/campagnes',
      },
      {
        label: 'Formulaires',
        icon: 'file',
        href: '/formulaires',
      },
      {
        label: 'Questionnaires',
        icon: 'clipboard',
        href: '/questionnaires',
      },
      
      {
        label: 'planification',
        icon: 'planification',
        href: '/planification'
      },
      {
        label: 'convocations',
        icon: 'convocations',
        href: '/convocations'
      },
      {
        label: 'emargement',
        icon: 'emargement',
        href: '/emargement'
      },
      {
        label: 'Candidatures',
        icon: 'clipboard',
        href: '/candidatures',
      },
      {
        label: 'Utilisateurs',
        icon: 'users',
        href: '/utilisateurs',
      },
    ]
  }

  /* ─────────────────────────────────────────────────────────
     ÉQUIPE PÉDAGOGIQUE
     ───────────────────────────────────────────────────────── */

  if (normalizedRole === 'equipe pedagogique') {
    return [
      {
        label: 'Tableau de bord',
        icon: 'dashboard',
        href: '/',
      },
      {
        label: 'Formations',
        icon: 'book',
        href: '/formations',
      },
      {
        label: 'Campagnes',
        icon: 'calendar',
        href: '/campagnes',
      },
      // {
      //   label: 'Mes entretiens',
      //   icon: 'calendar',
      //   href: '/evaluator/interviews',
      // },
      {
        label: 'Questionnaires',
        icon: 'clipboard',
        href: '/questionnaires',
      },
      {
        label: 'Candidats en entretien',
        icon: 'users',
        href: '/entretiens/candidats',
      },
      {
        label: 'Formulaires',
        icon: 'file',
        href: '/formulaires',
      },
      {
        label: 'Candidatures',
        icon: 'clipboard',
        href: '/candidatures',
      },
    ]
  }

  /* ─────────────────────────────────────────────────────────
     ÉQUIPE GESTION DE PROJET
     ───────────────────────────────────────────────────────── */

  if (normalizedRole === 'equipe gestion de projet') {
    return [
      {
        label: 'Tableau de bord',
        icon: 'dashboard',
        href: '/',
      },
      {
        label: 'Formations',
        icon: 'book',
        href: '/formations',
      },
      {
        label: 'Campagnes',
        icon: 'calendar',
        href: '/campagnes',
      },
      {
        label: 'Formulaires',
        icon: 'file',
        href: '/formulaires',
      },
      // {
      //   label: 'Mes candidats',
      //   icon: 'users',
      //   href: '/evaluator/candidates',
      // },
      
      {
        label: 'Candidatures',
        icon: 'clipboard',
        href: '/candidatures',
      },
      {
        label: 'planification',
        icon: 'planification',
        href: '/planification'
      },
      {
        label: 'convocations',
        icon: 'convocations',
        href: '/convocations'
      },
      {
        label: 'emargement',
        icon: 'emargement',
        href: '/emargement'
      },
    ]
  }

  /* ─────────────────────────────────────────────────────────
     ÉVALUATEUR
     ───────────────────────────────────────────────────────── */

  if (normalizedRole === 'evaluateur') {
    return [
      {
        label: 'Mes candidats',
        icon: 'users',
        href: '/evaluator/candidates',
      },
    ]
  }

  /* ─────────────────────────────────────────────────────────
     FALLBACK
     ───────────────────────────────────────────────────────── */

  return [
    {
      label: 'Tableau de bord',
      icon: 'dashboard',
      href: '/',
    },
  ]
})

/* ============================================================
   ICONES
   ============================================================ */

const icons = {
  dashboard: `
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        stroke-width="1.7"
      />
    </svg>
  `,

  calendar: `
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4.5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M3 9h18M8 3v4M16 3v4"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M8 13h2M14 13h2M8 17h2"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  `,

  users: `
    <svg viewBox="0 0 24 24" fill="none">
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M3.5 19c.7-3.5 2.7-5.5 5.5-5.5s4.8 2 5.5 5.5"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M15.5 5.5a3 3 0 0 1 0 5.8M17 13.7c1.9.8 3.1 2.4 3.5 5.3"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  `,

  book: `
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        stroke-width="1.7"
      />
    </svg>
  `,

  file: `
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h8l4 4v14H6V3Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
      <path
        d="M14 3v5h5M9 13h6M9 17h6"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  `,

  clipboard: `
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  `,

  user: `
    <svg viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M5.5 20c.8-4 2.9-6 6.5-6s5.7 2 6.5 6"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  `,

  logout: `
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M10 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H10"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  planification: `
  <svg viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="4.5"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      stroke-width="1.7"
    />
    <path
      d="M3 9h18M8 3v4M16 3v4"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
    />
    <path
      d="M8 13h2M14 13h2M8 17h2M14 17h2"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
    />
  </svg>
`,
convocations: `
  <svg viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      stroke-width="1.7"
    />
    <path
      d="M3.5 7L12 13l8.5-6"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`,
emargement: `
  <svg viewBox="0 0 24 24" fill="none">
    <rect
      x="5"
      y="3"
      width="14"
      height="18"
      rx="2"
      stroke="currentColor"
      stroke-width="1.7"
    />
    <path
      d="M8 8h8M8 12h4"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
    />
    <path
      d="M8 16l2 2 5-5"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`,
}

/* ============================================================
   ACTIVE ROUTE
   ============================================================ */

function isActive(href) {
  if (href === '/') {
    return route.path === '/'
  }

  return route.path === href || route.path.startsWith(`${href}/`)
}

/* ============================================================
   UTILISATEUR
   ============================================================ */

const userInitials = computed(() => {
  const user = authStore.user

  if (!user) {
    return 'U'
  }

  if (user.prenom || user.nom) {
    return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`
      .toUpperCase()
  }

  if (user.name) {
    return user.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return 'U'
})

const userName = computed(() => {
  const user = authStore.user

  if (!user) {
    return 'Utilisateur'
  }

  if (user.prenom || user.nom) {
    return `${user.prenom || ''} ${user.nom || ''}`.trim()
  }

  return user.name || user.role || 'Utilisateur'
})

const userRole = computed(() => {
  return authStore.user?.role || 'Utilisateur'
})
</script>

<template>
  <!-- =========================================================
       BOUTON MOBILE
       ========================================================= -->

  <button
    type="button"
    class="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-2xl border border-[#64CCC9]/20 bg-white/95 text-[#00313C] shadow-xl shadow-[#00313C]/10 backdrop-blur lg:hidden"
    aria-label="Ouvrir le menu"
    @click="mobileOpen = true"
  >
    <span
      class="relative block h-0.5 w-5 rounded bg-current shadow-[0_6px_0_currentColor,0_-6px_0_currentColor]"
    />
  </button>


  <!-- =========================================================
       OVERLAY MOBILE
       ========================================================= -->

  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-40 bg-[#00313C]/60 backdrop-blur-sm lg:hidden"
    @click="mobileOpen = false"
  />


  <!-- =========================================================
       SIDEBAR
       ========================================================= -->

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden border-r border-white/10 bg-[#00313C] px-4 py-5 text-white shadow-2xl shadow-[#00313C]/20 transition-transform duration-300 lg:translate-x-0"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >

    <!-- Décorations -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(100,204,201,0.18),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(228,0,70,0.12),transparent_30%)]"
    />

    <div class="relative flex h-full flex-col">

      <!-- =====================================================
           HEADER / LOGO
           ===================================================== -->

      <div class="flex items-center justify-between px-2 pb-7">

        <button
          type="button"
          class="flex items-center"
          @click="goHome"
        >
          <img
            :src="logo"
            alt="Sourcing Connect"
            class="h-20 w-auto object-contain"
          >
        </button>

        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Fermer le menu"
          @click="mobileOpen = false"
        >
          <span
            class="relative block h-0.5 w-5 rotate-45 rounded bg-current after:absolute after:left-0 after:top-0 after:block after:h-0.5 after:w-5 after:-rotate-90 after:rounded after:bg-current after:content-['']"
          />
        </button>

      </div>


      <!-- =====================================================
           PROFIL UTILISATEUR
           ===================================================== -->

      <!-- <div
        class="mx-1 mb-7 rounded-3xl border border-white/10 bg-white/[0.07] p-3 shadow-xl shadow-black/10 backdrop-blur"
      >
        <div class="flex items-center gap-3">

          <div
            class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-[#00313C]"
          >
            {{ userInitials }}
          </div>

          <div class="min-w-0">
            <strong
              class="block truncate text-sm font-bold text-white"
            >
              {{ userName }}
            </strong>

            <span
              class="block truncate text-xs font-medium text-white/55"
            >
              {{ userRole }}
            </span>
          </div>

        </div>
      </div> -->


      <!-- =====================================================
           NAVIGATION
           ===================================================== -->

      <nav
        class="flex flex-1 flex-col gap-1  overflow-hidden"
        aria-label="Navigation principale"
      >

        <!-- <p
          class="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#64CCC9]/70"
        >
          Navigation
        </p> -->

        <button
          v-for="item in navigation"
          :key="item.href"
          type="button"
          class="group flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition-all duration-200"
          :class="
            isActive(item.href)
              ? 'bg-white text-[#00313C] shadow-lg shadow-black/10'
              : 'text-white/65 hover:bg-white/10 hover:text-white'
          "
          @click="router.push(item.href)"
        >

          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-200"
            :class="
              isActive(item.href)
                ? 'bg-[#00313C] text-[#64CCC9]'
                : 'bg-white/10 text-white/55 group-hover:bg-[#E40046]/10 group-hover:text-[#E40046]'
            "
            v-html="icons[item.icon]"
          />

          <span
            class="min-w-0 truncate"
            :class="
              isActive(item.href)
                ? 'text-[#00313C]'
                : 'group-hover:text-white'
            "
          >
            {{ item.label }}
          </span>

        </button>

      </nav>


      <!-- =====================================================
           FOOTER
           ===================================================== -->

      <div
        class="mt-5 border-t border-white/10 pt-4"
      >

        <!-- Profil -->

        <button
          type="button"
          class="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-white/55 transition-all duration-200 hover:bg-white/10 hover:text-white"
          @click="router.push('/profil')"
        >

           <div class="flex items-center gap-3">

          <div
            class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-[#00313C]"
          >
            {{ userInitials }}
          </div>

          <div class="min-w-0">
            <strong
              class="block truncate text-sm font-bold text-white"
            >
              {{ userName }}
            </strong>

            <span
              class="block truncate text-xs font-medium text-white/55"
            >
              {{ userRole }}
            </span>
          </div>

        </div>

        </button>


        <!-- Déconnexion -->

        <button
          type="button"
          class="group mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white/50 transition-all duration-200 hover:bg-[#E40046]/10 hover:text-[#E40046]"
          @click="logout"
        >

          <span
            class="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/50 transition-all duration-200 group-hover:bg-[#E40046]/10 group-hover:text-[#E40046]"
            v-html="icons.logout"
          />

          <span>
            Déconnexion
          </span>

        </button>

      </div>

    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

span :deep(svg),
button :deep(svg) {
  width: 18px;
  height: 18px;
}
</style>
