<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import {
  Calendar,
  BookOpen,
  ArrowRight,
  Loader2,
  Search,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Users,
  LogIn,
  Layers
} from 'lucide-vue-next'

const router = useRouter()
const campaigns = ref([])
const loading = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const response = await api.get('campagnes/publiques/')
    campaigns.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des campagnes publiques', error)
  } finally {
    loading.value = false
  }
})

const filteredCampaigns = computed(() => {
  if (!searchQuery.value.trim()) return campaigns.value
  const query = searchQuery.value.toLowerCase()
  return campaigns.value.filter(
    (camp) =>
      camp.nom?.toLowerCase().includes(query) ||
      camp.formation_nom?.toLowerCase().includes(query) ||
      camp.cohorte_nom?.toLowerCase().includes(query) ||
      camp.description?.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col relative overflow-hidden">
    <!-- Blobs décoratifs rouges Simplon #CE0033 et bleus discrets -->
    <div class="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 w-[600px] h-[600px] rounded-full bg-[#CE0033]/5 blur-[120px] pointer-events-none"></div>
    <div class="absolute top-1/2 left-0 -z-10 -translate-x-1/3 w-[500px] h-[500px] rounded-full bg-[#00313C]/5 blur-[100px] pointer-events-none"></div>

    <!-- Header Navbar -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
          <img
            src="/images/logo1.png"
            alt="Simplon Sourcing Connect"
            class="h-10 w-auto object-contain"
            onerror="this.style.display='none'; document.getElementById('brand-text-fallback').style.display='flex';"
          />
          <div id="brand-text-fallback" class="hidden items-center">
            <span class="text-2xl font-black tracking-tight text-[#00313C]">
              Sourcing<span class="text-[#CE0033]">Connect</span>
            </span>
          </div>
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-3">
          <button
            @click="router.push('/login')"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-[#00313C] bg-slate-100 hover:bg-[#CE0033] hover:text-white transition-all duration-300"
          >
            <LogIn class="w-4 h-4" />
            <span>Espace Connexion</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
      <!-- Badge de sous-titre -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CE0033]/10 border border-[#CE0033]/20 text-[#CE0033] text-xs font-extrabold uppercase tracking-wider mb-6 animate-pulse">
        <Sparkles class="w-3.5 h-3.5" />
        <span>Campagnes de Recrutement Simplon</span>
      </div>

      <!-- Titre principal -->
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
        Propulsez votre avenir avec nos <span class="text-[#CE0033] underline decoration-[#CE0033]/30 decoration-wavy decoration-2">formations qualifiantes</span>
      </h1>

      <p class="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
        Découvrez les cohortes de formation ouvertes et posez votre candidature en quelques clics pour vous former aux métiers du numérique.
      </p>

      <!-- Barre de recherche -->
      <div class="mt-10 max-w-2xl mx-auto">
        <div class="relative flex items-center rounded-2xl bg-white border border-slate-200 focus-within:border-[#CE0033] focus-within:ring-2 focus-within:ring-[#CE0033]/20 transition-all">
          <Search class="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher une formation, une ville ou une campagne..."
            class="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:outline-none bg-transparent"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="mr-4 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Effacer
          </button>
        </div>
      </div>

      <!-- Stats / Points forts -->
      <div class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#CE0033]/10 text-[#CE0033] flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-xs text-slate-500 font-medium">Formations</div>
            <div class="text-sm font-bold text-slate-900">100% Inclusives</div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00313C]/10 text-[#00313C] flex items-center justify-center shrink-0">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-xs text-slate-500 font-medium">Diplômes & Certifs</div>
            <div class="text-sm font-bold text-slate-900">Reconnus</div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#CE0033]/10 text-[#CE0033] flex items-center justify-center shrink-0">
            <Users class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-xs text-slate-500 font-medium">Accompagnement</div>
            <div class="text-sm font-bold text-slate-[#00313C]">Personnalisé</div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-xs text-slate-500 font-medium">Candidature</div>
            <div class="text-sm font-bold text-slate-900">En ligne & Rapide</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content / Liste des campagnes -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Campagnes disponibles
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            Postulez avant la date limite de clôture indiquée.
          </p>
        </div>
        <span class="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
          {{ filteredCampaigns.length }} {{ filteredCampaigns.length > 1 ? 'campagnes' : 'campagne' }}
        </span>
      </div>

      <!-- State: Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-12 h-12 animate-spin text-[#CE0033] mb-4" />
        <p class="text-sm text-slate-500 font-medium">Chargement des campagnes de recrutement...</p>
      </div>

      <!-- State: Empty -->
      <div v-else-if="filteredCampaigns.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8">
        <div class="w-16 h-16 bg-red-50 text-[#CE0033] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Aucune campagne disponible</h3>
        <p class="text-slate-500 text-sm">
          {{ searchQuery ? "Aucun résultat ne correspond à votre recherche." : "Il n'y a actuellement aucune campagne de recrutement en cours." }}
        </p>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          Réinitialiser la recherche
        </button>
      </div>

      <!-- State: Grid of Campaigns -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="camp in filteredCampaigns"
          :key="camp.id"
          class="group bg-white rounded-3xl border border-slate-200 hover:border-[#CE0033]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
        >
          <!-- Accent line top on hover -->
          <div class="h-1.5 w-full bg-slate-100 group-hover:bg-[#CE0033] transition-colors duration-300"></div>

          <div class="p-6 sm:p-7 flex-1 flex flex-col">
            <!-- Header Badges -->
            <div class="flex items-center justify-between gap-2 mb-4">
              <span class="inline-flex items-center px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Ouverte
              </span>
              
              <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                <Calendar class="w-3.5 h-3.5 text-[#CE0033]" />
                Fin : {{ new Date(camp.dateCloture).toLocaleDateString('fr-FR') }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-[#CE0033] transition-colors duration-200 mb-3 leading-snug">
              {{ camp.nom }}
            </h3>

            <!-- Details badges -->
            <div class="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div class="text-xs font-medium text-slate-600 flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-[#CE0033] shrink-0" />
                <span class="truncate">Formation : <strong class="text-slate-900">{{ camp.formation_nom }}</strong></span>
              </div>
              <div v-if="camp.cohorte_nom" class="text-xs font-medium text-slate-600 flex items-center gap-2">
                <Users class="w-4 h-4 text-[#00313C] shrink-0" />
                <span class="truncate">Cohorte : <strong class="text-slate-900">{{ camp.cohorte_nom }}</strong></span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed flex-1">
              {{ camp.description || 'Rejoignez cette formation pour monter en compétences et vous préparer aux opportunités professionnelles du secteur.' }}
            </p>
          </div>

          <!-- Card Footer Action -->
          <div class="p-6 pt-0">
            <button
              @click="router.push(`/postuler/${camp.id}`)"
              class="w-full flex items-center justify-center py-3.5 px-4 bg-[#CE0033] hover:bg-[#a8002a] text-white rounded-2xl transition-all duration-200 font-extrabold gap-2 text-sm"
            >
              <span>Déposer ma candidature</span>
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-black text-white relative">
      <!-- Section principale du footer (4 colonnes) -->
      <div class="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        <!-- Colonne 1: Logo Simplon Sénégal & Réseaux sociaux -->
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <img
              src="/images/logo1.png"
              alt="Simplon Sénégal"
              class="h-12 w-auto object-contain brightness-0 invert"
              onerror="this.style.display='none'; document.getElementById('footer-logo-fallback').style.display='flex';"
            />
            <div id="footer-logo-fallback" class="hidden items-center gap-2">
              <div class="w-10 h-10 rounded-full border-2 border-[#CE0033] flex items-center justify-center gap-1">
                <span class="w-1.5 h-3 bg-[#CE0033] rounded-full"></span>
                <span class="w-1.5 h-3 bg-[#CE0033] rounded-full"></span>
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-black text-white tracking-wider leading-none">simplon</span>
                <span class="text-xs font-bold text-slate-300 tracking-widest uppercase">SÉNÉGAL</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold text-slate-300">Suivez-nous</p>
            <p class="text-sm font-bold text-slate-200">@SimplonSenegal</p>
            <div class="flex items-center gap-2 pt-2">
              <!-- Facebook -->
              <a href="https://facebook.com/SimplonSenegal" target="_blank" class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-[#CE0033] hover:border-[#CE0033] transition-colors">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <!-- Twitter / X -->
              <a href="https://twitter.com/SimplonSenegal" target="_blank" class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-[#CE0033] hover:border-[#CE0033] transition-colors">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/></svg>
              </a>
              <!-- LinkedIn -->
              <a href="https://linkedin.com/company/simplonsenegal" target="_blank" class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-[#CE0033] hover:border-[#CE0033] transition-colors">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/SimplonSenegal" target="_blank" class="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-[#CE0033] hover:border-[#CE0033] transition-colors">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Colonne 2: Liens utiles -->
        <div>
          <h3 class="text-base font-extrabold text-[#CE0033] mb-4">Liens utiles</h3>
          <ul class="space-y-2.5 text-sm font-bold text-white">
            <li><a href="#" class="hover:text-[#CE0033] transition-colors">À Propos</a></li>
            <li><a href="#" class="hover:text-[#CE0033] transition-colors">Formations</a></li>
            <li><a href="#" class="hover:text-[#CE0033] transition-colors">Actualités</a></li>
            <li><a href="#" class="hover:text-[#CE0033] transition-colors">Contacts</a></li>
            <li><a href="#" class="hover:text-[#CE0033] transition-colors">FAQ</a></li>
            <li><a href="#" class="hover:text-[#CE0033] transition-colors">Projets</a></li>
          </ul>
        </div>

        <!-- Colonne 3: Nos contacts -->
        <div>
          <h3 class="text-base font-extrabold text-[#CE0033] mb-4">Nos contacts</h3>
          <div class="space-y-3 text-sm text-slate-200 leading-relaxed font-normal">
            <p><strong class="font-semibold text-white">Adresse :</strong> Cité Keur Gorgui villa AD65, face aire de jeux</p>
            <p><strong class="font-semibold text-white">Téléphone fixe :</strong> +221 33 824 05 15</p>
            <p><strong class="font-semibold text-white">Mobile :</strong> +221 77 499 71 69</p>
            <p><strong class="font-semibold text-white">Email :</strong> simplon.senegal@simplon.co</p>
          </div>
        </div>

        <!-- Colonne 4: Newsletter -->
        <div>
          <h3 class="text-base font-extrabold text-[#CE0033] mb-4">Newsletter</h3>
          <p class="text-xs text-slate-300 mb-6 leading-relaxed">
            Souscrivez à notre newsletter en renseignant votre adresse mail.
          </p>

          <form @submit.prevent class="space-y-4">
            <div class="border-b border-slate-400 pb-1">
              <input
                type="email"
                placeholder="Entrez votre adresse mail"
                class="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              class="w-full py-2.5 px-4 bg-white text-slate-900 font-extrabold rounded text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>S'abonner</span>
              <Mail class="w-4 h-4 text-slate-900 fill-slate-900" />
            </button>
          </form>
        </div>
      </div>

      <!-- Barre inférieure Copyright & Bouton Haut de Page -->
      <div class="bg-[#181818] py-4 px-6 relative border-t border-white/5">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <!-- Icone cercle rouge simplon avec deux barres/points -->
            <div class="w-5 h-5 rounded-full border border-[#CE0033] flex items-center justify-center gap-0.5 shrink-0">
              <span class="w-0.5 h-2 bg-[#CE0033] rounded-full"></span>
              <span class="w-0.5 h-2 bg-[#CE0033] rounded-full"></span>
            </div>
            <span>
              Copyright: © 2023 <strong class="text-[#CE0033] font-bold">Simplon Sénégal</strong> | Tous droits réservés.
            </span>
          </div>

          <!-- Bouton carré rouge flèche vers le haut -->
          <button
            @click="scrollToTop"
            aria-label="Haut de page"
            class="w-9 h-9 bg-[#CE0033] text-white flex items-center justify-center rounded hover:bg-[#a8002a] transition-colors absolute right-6 top-1/2 -translate-y-1/2"
          >
            <ChevronUp class="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>
