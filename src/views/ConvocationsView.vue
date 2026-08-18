<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Check, Clock3, Loader2, MapPin, Search, Send, Users, X } from 'lucide-vue-next'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { useAuthStore } from '../stores/auth'
import { useCampagnesStore } from '../stores/campagnes'
import { useModalStore } from '../stores/modal'
import { usePlanningsStore } from '../stores/plannings'

const authStore = useAuthStore()
const campagnesStore = useCampagnesStore()
const modalStore = useModalStore()
const planningsStore = usePlanningsStore()

const selectedFormation = ref('')
const selectedCohorte = ref('')
const selectedDay = ref('')
const selectedPlanningId = ref('')
const convocation = ref(null)
const searchTerm = ref('')
const drafts = ref({})
const bulkCount = ref(10)
const loadingCandidates = ref(false)
const sending = ref(false)

const canManage = computed(() =>
  authStore.user?.role === 'Administrateur' || authStore.user?.role === 'Équipe Gestion de Projet',
)
const upcomingPlannings = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return planningsStore.plannings.filter((planning) => planning.date >= today)
})
const formations = computed(() => {
  const values = new Map()
  upcomingPlannings.value.forEach((planning) => values.set(planning.formation_nom, planning.formation_nom))
  return [...values.values()].filter(Boolean)
})
const cohortes = computed(() => {
  const values = new Map()
  upcomingPlannings.value
    .filter((planning) => !selectedFormation.value || planning.formation_nom === selectedFormation.value)
    .forEach((planning) => values.set(planning.cohorte_nom, planning.cohorte_nom))
  return [...values.values()].filter(Boolean)
})
const filteredPlannings = computed(() => upcomingPlannings.value.filter((planning) =>
  (!selectedFormation.value || planning.formation_nom === selectedFormation.value)
  && (!selectedCohorte.value || planning.cohorte_nom === selectedCohorte.value),
))
const days = computed(() => [...new Set(filteredPlannings.value.map((planning) => planning.date))])
const daySlots = computed(() => filteredPlannings.value
  .filter((planning) => planning.date === selectedDay.value)
  .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)))
const activeDraftIds = computed(() => drafts.value[selectedPlanningId.value] || [])
const selectedPlanning = computed(() => daySlots.value.find((planning) => planning.id === selectedPlanningId.value) || null)
const filteredCandidates = computed(() => {
  if (!convocation.value) return []
  const query = searchTerm.value.trim().toLocaleLowerCase('fr')
  return convocation.value.candidats.filter((candidate) => !query || [candidate.nom, candidate.numero, candidate.email]
    .some((value) => value?.toLocaleLowerCase('fr').includes(query)))
})
const eligibleCandidates = computed(() => filteredCandidates.value.filter((candidate) => candidate.eligible && !isDraftedElsewhere(candidate.id)))
const availableCandidates = computed(() => eligibleCandidates.value.filter((candidate) => !activeDraftIds.value.includes(candidate.id)))
const allEligibleSelected = computed(() => eligibleCandidates.value.length > 0 && eligibleCandidates.value.every((candidate) => activeDraftIds.value.includes(candidate.id)))
const plannedCount = computed(() => Object.values(drafts.value).flat().length)
const totalCandidates = computed(() => convocation.value?.candidats.filter((candidate) => candidate.eligible).length || 0)
const activeRemaining = computed(() => Math.max((convocation.value?.places_restantes || 0) - activeDraftIds.value.length, 0))
const hasDraft = computed(() => plannedCount.value > 0)

const formatDay = (date) => new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(`${date}T12:00:00`))
const formatTime = (time) => time?.slice(0, 5)
const isDraftedElsewhere = (id) => Object.entries(drafts.value).some(([planningId, ids]) => planningId !== selectedPlanningId.value && ids.includes(id))
const slotDraftCount = (id) => (drafts.value[id] || []).length

const chooseDefaultSlot = async () => {
  if (!days.value.length) {
    selectedDay.value = ''
    selectedPlanningId.value = ''
    convocation.value = null
    return
  }
  if (!days.value.includes(selectedDay.value)) selectedDay.value = days.value[0]
  if (!daySlots.value.some((slot) => slot.id === selectedPlanningId.value)) selectedPlanningId.value = daySlots.value[0]?.id || ''
  await loadCandidates()
}
const loadCandidates = async () => {
  if (!selectedPlanningId.value) {
    convocation.value = null
    return
  }
  loadingCandidates.value = true
  convocation.value = await planningsStore.fetchConvocationCandidats(selectedPlanningId.value)
  loadingCandidates.value = false
}
const selectFormation = () => {
  selectedCohorte.value = ''
  chooseDefaultSlot()
}
const selectCohorte = () => chooseDefaultSlot()
const selectDay = (date) => {
  selectedDay.value = date
  selectedPlanningId.value = daySlots.value[0]?.id || ''
  loadCandidates()
}
const selectSlot = (id) => {
  selectedPlanningId.value = id
  searchTerm.value = ''
  loadCandidates()
}
const canSelect = (candidate) => candidate.eligible
  && !isDraftedElsewhere(candidate.id)
  && (activeDraftIds.value.includes(candidate.id) || activeRemaining.value > 0)
const toggleCandidate = (id) => {
  const current = activeDraftIds.value
  const exists = current.includes(id)
  if (!exists && !activeRemaining.value) return
  drafts.value = { ...drafts.value, [selectedPlanningId.value]: exists ? current.filter((candidateId) => candidateId !== id) : [...current, id] }
}
const toggleAllEligible = () => {
  if (allEligibleSelected.value) {
    drafts.value = { ...drafts.value, [selectedPlanningId.value]: [] }
    return
  }
  const ids = eligibleCandidates.value.slice(0, activeRemaining.value).map((candidate) => candidate.id)
  drafts.value = { ...drafts.value, [selectedPlanningId.value]: [...activeDraftIds.value, ...ids] }
}
const addFirstCandidates = () => {
  const requested = Number(bulkCount.value)
  if (!Number.isInteger(requested) || requested < 1 || !activeRemaining.value) return
  const needed = Math.max(requested - activeDraftIds.value.length, 0)
  const ids = availableCandidates.value
    .slice(0, Math.min(needed, activeRemaining.value))
    .map((candidate) => candidate.id)
  if (!ids.length) return
  drafts.value = { ...drafts.value, [selectedPlanningId.value]: [...activeDraftIds.value, ...ids] }
}
const clearDrafts = async () => {
  if (!hasDraft.value) return
  const confirmed = await modalStore.showConfirm('Les sélections en brouillon seront supprimées. Aucune convocation n’a encore été envoyée.', 'Réinitialiser le brouillon', { confirmText: 'Réinitialiser', variant: 'danger' })
  if (confirmed) drafts.value = {}
}
const saveDraft = () => modalStore.showAlert('Votre brouillon est conservé tant que vous restez sur cette session.', 'Brouillon enregistré', 'success')
const sendConvocations = async () => {
  if (!hasDraft.value || sending.value) return
  const confirmed = await modalStore.showConfirm(
    `${plannedCount.value} candidat(s) seront affectés aux créneaux sélectionnés. Cette action déclenche leurs convocations dans le système.`,
    'Envoyer les convocations',
    { confirmText: 'Envoyer les convocations', variant: 'primary' },
  )
  if (!confirmed) return
  sending.value = true
  let sent = 0
  for (const [planningId, candidateIds] of Object.entries(drafts.value)) {
    if (!candidateIds.length) continue
    const result = await planningsStore.assignerCandidats(planningId, candidateIds)
    if (!result) {
      sending.value = false
      return
    }
    sent += result.affectes
    const nextDrafts = { ...drafts.value }
    delete nextDrafts[planningId]
    drafts.value = nextDrafts
  }
  drafts.value = {}
  await planningsStore.fetchPlannings()
  await chooseDefaultSlot()
  sending.value = false
  await modalStore.showAlert(`${sent} convocation(s) ont été créées avec succès.`, 'Convocations envoyées', 'success')
}

onMounted(async () => {
  await Promise.all([planningsStore.fetchPlannings(), campagnesStore.fetchFormations(), campagnesStore.fetchCohortes()])
  await chooseDefaultSlot()
})
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Convocations</h2>
        <p class="text-sm text-slate-500">Répartissez les candidats sur les créneaux puis envoyez les convocations.</p>
      </div>
    </template>

    <div v-if="planningsStore.error" class="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{{ planningsStore.error }}</div>

    <section class="convocation-toolbar">
      <div><label>Formation</label><select v-model="selectedFormation" @change="selectFormation"><option value="">Toutes les formations</option><option v-for="formation in formations" :key="formation" :value="formation">{{ formation }}</option></select></div>
      <div><label>Promotion</label><select v-model="selectedCohorte" :disabled="!cohortes.length" @change="selectCohorte"><option value="">Toutes les promotions</option><option v-for="cohorte in cohortes" :key="cohorte" :value="cohorte">{{ cohorte }}</option></select></div>
      <div class="toolbar-stat"><span class="toolbar-icon"><Users class="h-4 w-4" /></span><div><strong>{{ totalCandidates }}</strong><small>candidats à planifier</small></div></div>
      <p class="toolbar-hint">Sélectionnez un créneau pour préparer ses convocations.</p>
    </section>

    <div v-if="planningsStore.loading && !upcomingPlannings.length" class="flex h-64 items-center justify-center"><Loader2 class="h-8 w-8 animate-spin text-primary-600" /></div>
    <div v-else-if="!upcomingPlannings.length" class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"><CalendarDays class="mx-auto mb-3 h-10 w-10 text-slate-300" /><h3 class="font-bold text-[#00313C]">Aucun créneau à venir</h3><p class="mt-1 text-sm text-slate-500">Créez un planning avant de préparer des convocations.</p></div>

    <template v-else>
      <div class="day-picker">
        <label for="convocation-day">Date de convocation</label>
        <select id="convocation-day" v-model="selectedDay" @change="selectDay(selectedDay)">
          <option v-for="(day, index) in days" :key="day" :value="day">Jour {{ index + 1 }} — {{ formatDay(day) }}</option>
        </select>
      </div>

      <main class="convocation-workspace">
        <section class="schedule-panel">
          <div class="panel-heading"><div><h3>Structure de la journée</h3><p>{{ selectedDay ? formatDay(selectedDay) : 'Choisissez une journée' }}</p></div><span>{{ daySlots.length }} créneau(x)</span></div>
          <div class="slot-list">
            <button v-for="slot in daySlots" :key="slot.id" type="button" class="slot-card" :class="{ 'slot-card-active': selectedPlanningId === slot.id }" @click="selectSlot(slot.id)">
              <div class="slot-card-top"><span><Clock3 class="h-3.5 w-3.5" /> Créneau</span><small>Capacité : {{ slot.capacite }}</small></div>
              <strong>{{ formatTime(slot.heureDebut) }} – {{ formatTime(slot.heureFin) }}</strong>
              <span class="slot-location"><MapPin class="h-3.5 w-3.5" />{{ slot.lieu || slot.localisation || 'Lieu à préciser' }}</span>
              <span v-if="slotDraftCount(slot.id)" class="slot-draft"><Check class="h-3.5 w-3.5" />{{ slotDraftCount(slot.id) }} en brouillon</span>
            </button>
          </div>
        </section>

        <section class="candidates-panel">
          <div class="panel-heading candidates-heading"><div><h3>Candidats non assignés</h3><p>{{ selectedPlanning ? `${formatTime(selectedPlanning.heureDebut)} – ${formatTime(selectedPlanning.heureFin)}` : 'Sélectionnez un créneau' }}</p></div><span v-if="convocation">{{ activeRemaining }} place(s)</span></div>
          <div class="candidate-tools">
            <label class="relative"><Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input v-model="searchTerm" class="input-field pl-9" placeholder="Rechercher un candidat…" /></label>
            <div v-if="canManage" class="bulk-select"><label for="bulk-count" class="sr-only">Nombre total de candidats à sélectionner</label><input id="bulk-count" v-model.number="bulkCount" type="number" min="1" :max="convocation?.capacite || 1" /><button type="button" :disabled="!availableCandidates.length || !activeRemaining" @click="addFirstCandidates">Sélectionner {{ bulkCount || 0 }} candidats</button></div>
            <button v-if="canManage && eligibleCandidates.length" class="select-all" type="button" @click="toggleAllEligible">{{ allEligibleSelected ? 'Tout retirer' : 'Tout sélectionner' }}</button>
          </div>
          <div v-if="loadingCandidates" class="flex h-52 items-center justify-center"><Loader2 class="h-6 w-6 animate-spin text-primary-600" /></div>
          <div v-else class="candidate-list">
            <button v-for="candidate in filteredCandidates" :key="candidate.id" type="button" class="candidate-row" :class="{ 'candidate-row-active': activeDraftIds.includes(candidate.id), 'candidate-row-disabled': !canSelect(candidate) && !activeDraftIds.includes(candidate.id) }" :disabled="!canManage || (!canSelect(candidate) && !activeDraftIds.includes(candidate.id))" @click="toggleCandidate(candidate.id)">
              <span class="candidate-check" :class="{ 'candidate-check-active': activeDraftIds.includes(candidate.id) }"><Check v-if="activeDraftIds.includes(candidate.id)" class="h-3.5 w-3.5" /></span>
              <span class="candidate-avatar">{{ candidate.nom?.split(' ').map((part) => part[0]).slice(0, 2).join('') || '?' }}</span>
              <span class="min-w-0 flex-1 text-left"><strong>{{ candidate.nom || 'Candidat sans nom' }}</strong><small>{{ candidate.numero }}<template v-if="candidate.email"> · {{ candidate.email }}</template></small><em v-if="!candidate.eligible">{{ candidate.raison }}</em><em v-else-if="isDraftedElsewhere(candidate.id)">Déjà placé dans un autre créneau du brouillon.</em></span>
              <span v-if="activeDraftIds.includes(candidate.id)" class="selected-mark">Prévu</span>
            </button>
            <p v-if="!filteredCandidates.length" class="px-5 py-12 text-center text-sm text-slate-500">Aucun candidat ne correspond à votre recherche.</p>
          </div>
        </section>
      </main>

      <footer v-if="canManage" class="convocation-footer">
        <p><span class="status-dot" /> <b>{{ plannedCount }}</b> candidat(s) prêt(s) à être convoqué(s)<span v-if="hasDraft"> · brouillon non envoyé</span></p>
        <div><button class="btn-secondary" :disabled="!hasDraft || sending" @click="clearDrafts"><X class="mr-1.5 h-4 w-4" />Réinitialiser</button><button class="btn-primary" :disabled="!hasDraft || sending" @click="saveDraft">Enregistrer le brouillon</button><button class="send-button" :disabled="!hasDraft || sending" @click="sendConvocations"><Loader2 v-if="sending" class="mr-2 h-4 w-4 animate-spin" /><Send v-else class="mr-2 h-4 w-4" />Envoyer les convocations</button></div>
      </footer>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.convocation-toolbar { @apply mb-5 grid items-end gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2 lg:grid-cols-[190px_190px_auto_1fr]; }
.convocation-toolbar label { @apply mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#00313C]; }
.convocation-toolbar select { @apply w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-xs font-medium text-[#00313C] outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary-500; }
.toolbar-stat { @apply flex items-center gap-2 border-l border-slate-100 pl-4; }.toolbar-icon { @apply rounded-full bg-orange-50 p-2 text-[#00313C]; }.toolbar-stat strong { @apply block text-lg leading-4 text-[#00313C]; }.toolbar-stat small { @apply block text-[10px] text-slate-500; }.toolbar-hint { @apply hidden text-right text-xs text-slate-400 lg:block; }
.day-picker { @apply mb-5 w-full max-w-sm; }.day-picker label { @apply mb-1.5 block text-xs font-bold text-[#00313C]; }.day-picker select { @apply w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold capitalize text-[#00313C] shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100; }
.convocation-workspace { @apply grid gap-5 lg:grid-cols-[minmax(280px,0.9fr)_minmax(380px,1.1fr)]; }.schedule-panel, .candidates-panel { @apply overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100; }.panel-heading { @apply flex items-start justify-between border-b border-slate-100 px-5 py-4; }.panel-heading h3 { @apply text-sm font-bold text-[#00313C]; }.panel-heading p { @apply mt-0.5 text-xs capitalize text-slate-500; }.panel-heading > span { @apply rounded-full bg-primary-50 px-2 py-1 text-[10px] font-bold text-primary-700; }
.slot-list { @apply space-y-3 p-4; }.slot-card { @apply block w-full rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left transition hover:border-primary-300 hover:bg-white; }.slot-card-active { @apply border-primary-500 bg-primary-50/60 ring-1 ring-primary-200; }.slot-card-top { @apply mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500; }.slot-card-top span { @apply flex items-center gap-1 text-primary-700; }.slot-card strong { @apply block text-base font-bold text-[#00313C]; }.slot-location { @apply mt-2 flex items-center gap-1 text-xs text-slate-500; }.slot-draft { @apply mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700; }
.candidate-tools { @apply flex flex-wrap gap-2 border-b border-slate-100 p-4; }.candidate-tools > label { @apply relative min-w-52 flex-1; }.bulk-select { @apply flex overflow-hidden rounded-lg border border-slate-200; }.bulk-select input { @apply w-12 border-0 bg-slate-50 px-2 text-center text-xs font-bold text-[#00313C] outline-none focus:bg-primary-50; }.bulk-select button { @apply bg-primary-50 px-2.5 py-2 text-xs font-bold text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50; }.select-all { @apply rounded-lg px-2 text-xs font-bold text-primary-700 hover:bg-primary-50; }.candidate-list { @apply max-h-[420px] overflow-y-auto; }.candidate-row { @apply flex w-full items-center gap-3 border-b border-slate-50 px-5 py-3 text-left transition hover:bg-primary-50/30 disabled:cursor-not-allowed; }.candidate-row-active { @apply bg-primary-50/60; }.candidate-row-disabled { @apply opacity-50; }.candidate-check { @apply flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 text-white; }.candidate-check-active { @apply border-primary-600 bg-primary-600; }.candidate-avatar { @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-primary-700; }.candidate-row strong { @apply block truncate text-xs font-bold text-[#00313C]; }.candidate-row small, .candidate-row em { @apply mt-0.5 block truncate text-[10px] not-italic text-slate-500; }.candidate-row em { @apply text-amber-700; }.selected-mark { @apply rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700; }
.convocation-footer { @apply sticky bottom-3 z-10 mt-5 flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.14)] ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between; }.convocation-footer p { @apply text-xs text-slate-600; }.status-dot { @apply mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500; }.convocation-footer > div { @apply flex flex-wrap justify-end gap-2; }.convocation-footer .btn-secondary, .convocation-footer .btn-primary, .send-button { @apply inline-flex items-center justify-center px-3 py-2 text-xs; }.send-button { @apply rounded-lg bg-pink-600 font-bold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50; }
@media (max-width: 640px) { .convocation-footer { @apply bottom-0 rounded-none; }.convocation-footer > div { @apply w-full; }.convocation-footer button { @apply flex-1; } }
</style>
