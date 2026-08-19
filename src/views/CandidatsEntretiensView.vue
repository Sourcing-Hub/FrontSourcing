<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Loader2, MapPin, Search, Users } from 'lucide-vue-next'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { fetchInterviewCandidates } from '../services/questionnaires'
import { parseBackendError } from '../utils/errorHandler'

const candidates = ref([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const selectedFormation = ref('')
const selectedCohorte = ref('')
const selectedStatus = ref('')

const formations = computed(() => [...new Set(candidates.value.map((item) => item.formation).filter(Boolean))])
const cohortes = computed(() => [...new Set(candidates.value
  .filter((item) => !selectedFormation.value || item.formation === selectedFormation.value)
  .map((item) => item.cohorte)
  .filter(Boolean))])
const filteredCandidates = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase('fr')
  return candidates.value.filter((candidate) => {
    const content = `${candidate.nom} ${candidate.numero} ${candidate.email} ${candidate.formation} ${candidate.cohorte}`.toLocaleLowerCase('fr')
    const statuses = [candidate.statutPresence, candidate.statutEtape, candidate.technique?.status, candidate.motivation?.status, candidate.final?.status]
    return (!query || content.includes(query))
      && (!selectedFormation.value || candidate.formation === selectedFormation.value)
      && (!selectedCohorte.value || candidate.cohorte === selectedCohorte.value)
      && (!selectedStatus.value || statuses.includes(selectedStatus.value))
  })
})
const stats = computed(() => ({
  total: candidates.value.length,
  attente: candidates.value.filter((candidate) => candidate.technique?.status === 'En-attente' || candidate.motivation?.status === 'En-attente' || candidate.final?.status === 'En-attente').length,
  cours: candidates.value.filter((candidate) => candidate.technique?.status === 'progress' || candidate.motivation?.status === 'progress' || candidate.final?.status === 'progress').length,
  termines: candidates.value.filter((candidate) => candidate.technique?.status === 'completed' && candidate.motivation?.status === 'completed' && candidate.final?.status === 'completed').length,
}))

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

function formatTime(value) {
  return value?.slice(0, 5) || '--:--'
}

function statusText(value) {
  const labels = {
    A_ATTENDRE: 'À pointer',
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    EN_ATTENTE: 'En attente',
    EN_COURS: 'En cours',
    REUSSIE: 'Réussie',
    ECHOUEE: 'Échouée',
    ANNULEE: 'Annulée',
    progress: 'En cours',
    completed: 'Terminé',
    'En-attente': 'En attente',
  }
  return labels[value] || value || 'Non renseigné'
}

function statusClass(value) {
  if (['completed', 'REUSSIE', 'PRESENT'].includes(value)) return 'status-green'
  if (['progress', 'EN_COURS'].includes(value)) return 'status-blue'
  if (['ABSENT', 'ECHOUEE', 'ANNULEE'].includes(value)) return 'status-red'
  return 'status-gray'
}

async function loadCandidates() {
  loading.value = true
  error.value = ''
  try {
    candidates.value = await fetchInterviewCandidates()
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCandidates()
})
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Candidats en entretien</h2>
        <p class="text-sm text-slate-500">Suivi des candidats convoqués et de l’avancement des évaluations.</p>
      </div>
    </template>

    <div v-if="error" class="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </div>

    <section class="mb-6 grid gap-4 md:grid-cols-4">
      <article class="stat-card"><Users class="h-5 w-5" /><span>Total</span><strong>{{ stats.total }}</strong></article>
      <article class="stat-card"><CalendarDays class="h-5 w-5" /><span>En attente</span><strong>{{ stats.attente }}</strong></article>
      <article class="stat-card"><CalendarDays class="h-5 w-5" /><span>En cours</span><strong>{{ stats.cours }}</strong></article>
      <article class="stat-card"><CalendarDays class="h-5 w-5" /><span>Terminés</span><strong>{{ stats.termines }}</strong></article>
    </section>

    <section class="mb-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div class="grid gap-3 lg:grid-cols-[1fr_220px_220px_190px]">
        <label class="relative">
          <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input v-model="searchTerm" class="input-field pl-9" placeholder="Rechercher un candidat..." />
        </label>
        <select v-model="selectedFormation" class="input-field" @change="selectedCohorte = ''">
          <option value="">Toutes les formations</option>
          <option v-for="formation in formations" :key="formation" :value="formation">{{ formation }}</option>
        </select>
        <select v-model="selectedCohorte" class="input-field">
          <option value="">Toutes les promotions</option>
          <option v-for="cohorte in cohortes" :key="cohorte" :value="cohorte">{{ cohorte }}</option>
        </select>
        <select v-model="selectedStatus" class="input-field">
          <option value="">Tous les statuts</option>
          <option value="En-attente">Évaluation en attente</option>
          <option value="progress">Évaluation en cours</option>
          <option value="completed">Évaluation terminée</option>
          <option value="PRESENT">Présent</option>
          <option value="ABSENT">Absent</option>
        </select>
      </div>
    </section>

    <div v-if="loading" class="flex h-56 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <section v-else class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1100px] text-left">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-5 py-3">Candidat</th>
              <th class="px-5 py-3">Formation / promo</th>
              <th class="px-5 py-3">Créneau</th>
              <th class="px-5 py-3">Présence</th>
              <th class="px-5 py-3">Étape</th>
              <th class="px-5 py-3">Technique</th>
              <th class="px-5 py-3">Motivation</th>
              <th class="px-5 py-3">Final</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="candidate in filteredCandidates" :key="candidate.id" class="text-sm text-[#00313C]">
              <td class="px-5 py-4">
                <strong class="block">{{ candidate.nom || 'Candidat sans nom' }}</strong>
                <small class="text-slate-500">{{ candidate.numero }}<template v-if="candidate.email"> · {{ candidate.email }}</template></small>
              </td>
              <td class="px-5 py-4 text-slate-600">{{ candidate.formation }}<br /><small>{{ candidate.cohorte }}</small></td>
              <td class="px-5 py-4 text-slate-600">
                {{ formatDate(candidate.date) }} · {{ formatTime(candidate.heureDebut) }}-{{ formatTime(candidate.heureFin) }}
                <small class="mt-1 flex items-center gap-1"><MapPin class="h-3 w-3" />{{ candidate.lieu || 'Lieu à préciser' }}</small>
              </td>
              <td class="px-5 py-4"><span class="status-pill" :class="statusClass(candidate.statutPresence)">{{ statusText(candidate.statutPresence) }}</span></td>
              <td class="px-5 py-4"><span class="status-pill" :class="statusClass(candidate.statutEtape)">{{ statusText(candidate.statutEtape) }}</span></td>
              <td class="px-5 py-4">
                <span class="status-pill" :class="statusClass(candidate.technique?.status)">{{ candidate.technique?.statusLabel || statusText(candidate.technique?.status) }}</span>
                <small v-if="candidate.technique?.averageScore" class="mt-1 block text-slate-500">Moyenne {{ candidate.technique.averageScore }}</small>
              </td>
              <td class="px-5 py-4">
                <span class="status-pill" :class="statusClass(candidate.motivation?.status)">{{ candidate.motivation?.statusLabel || statusText(candidate.motivation?.status) }}</span>
                <small v-if="candidate.motivation?.averageScore" class="mt-1 block text-slate-500">Moyenne {{ candidate.motivation.averageScore }}</small>
              </td>
              <td class="px-5 py-4">
                <span class="status-pill" :class="statusClass(candidate.final?.status)">{{ candidate.final?.statusLabel || statusText(candidate.final?.status) }}</span>
                <small v-if="candidate.final?.averageScore" class="mt-1 block text-slate-500">Moyenne {{ candidate.final.averageScore }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredCandidates.length" class="px-5 py-12 text-center text-sm text-slate-500">
        Aucun candidat en entretien ne correspond aux filtres.
      </p>
    </section>
  </DashboardLayout>
</template>

<style scoped>
.stat-card { @apply rounded-xl border border-slate-100 bg-white p-5 shadow-sm; }
.stat-card svg { @apply mb-3 text-primary-600; }
.stat-card span { @apply text-xs font-bold uppercase tracking-wide text-slate-500; }
.stat-card strong { @apply mt-2 block text-3xl font-black text-[#00313C]; }
.status-pill { @apply inline-flex rounded-full px-2.5 py-1 text-xs font-bold; }
.status-green { @apply bg-emerald-50 text-emerald-700; }
.status-blue { @apply bg-blue-50 text-blue-700; }
.status-red { @apply bg-red-50 text-red-700; }
.status-gray { @apply bg-slate-100 text-slate-600; }
</style>
