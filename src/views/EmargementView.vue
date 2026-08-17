<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Loader2, Search, UserCheck, UserX } from 'lucide-vue-next'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import api from '../services/api'
import { useModalStore } from '../stores/modal'
import { parseBackendError } from '../utils/errorHandler'
import { demoDetails, demoSessions, refreshDemoSessionCounts } from '../mocks/emargement'

const modalStore = useModalStore()
const sessions = ref([])
const selectedSessionId = ref('')
const detail = ref(null)
const loading = ref(false)
const savingId = ref('')
const closing = ref(false)
const search = ref('')
const error = ref('')
const demoMode = ref(false)

const selectedSession = computed(() => sessions.value.find((session) => session.id === selectedSessionId.value))
const filteredAssignments = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('fr')
  return (detail.value?.affectations || []).filter((item) => !query || `${item.nom} ${item.numero} ${item.email}`.toLocaleLowerCase('fr').includes(query))
})
const formatDate = (value) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
const formatTime = (value) => value?.slice(0, 5)
const sessionLabel = (session) => `${session.cohorteNom} — ${session.etapeNom} · ${formatDate(session.date)} · ${formatTime(session.heureDebut)}`

const loadSessions = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('evaluations/emargement/sessions/')
    if (data.length) {
      sessions.value = data
    } else {
      demoMode.value = true
      sessions.value = demoSessions
    }
    if (!selectedSessionId.value && sessions.value.length) selectedSessionId.value = sessions.value[0].id
    if (selectedSessionId.value) await loadDetail()
  } catch {
    demoMode.value = true
    sessions.value = demoSessions
    if (!selectedSessionId.value) selectedSessionId.value = sessions.value[0]?.id || ''
    if (selectedSessionId.value) await loadDetail()
    error.value = ''
  } finally { loading.value = false }
}
const loadDetail = async () => {
  if (!selectedSessionId.value) return
  loading.value = true
  try {
    detail.value = demoMode.value
      ? demoDetails[selectedSessionId.value]
      : (await api.get(`evaluations/emargement/sessions/${selectedSessionId.value}/`)).data
  } catch (err) { error.value = parseBackendError(err) } finally { loading.value = false }
}
const markPresence = async (assignment, statutPresence) => {
  savingId.value = assignment.id
  try {
    if (demoMode.value) {
      assignment.statutPresence = statutPresence
      refreshDemoSessionCounts(selectedSession.value, detail.value.affectations)
      return
    }
    const { data } = await api.patch(`evaluations/emargement/affectations/${assignment.id}/presence/`, { statutPresence })
    const index = detail.value.affectations.findIndex((item) => item.id === assignment.id)
    detail.value.affectations[index] = data
    await loadSessions()
  } catch (err) { await modalStore.showAlert(parseBackendError(err), 'Erreur', 'danger') } finally { savingId.value = '' }
}
const closeSession = async () => {
  const awaiting = selectedSession.value?.enAttente || 0
  const confirmed = await modalStore.showConfirm(
    `${awaiting} candidat(s) non pointé(s) seront marqués absents et leur parcours sera clôturé. Les présents recevront un lien de confirmation.`,
    'Clôturer l’émargement', { confirmText: 'Clôturer la session', variant: 'danger' },
  )
  if (!confirmed) return
  closing.value = true
  try {
    const { data } = await api.post(`evaluations/emargement/sessions/${selectedSessionId.value}/cloturer/`)
    await modalStore.showAlert(`${data.absents} absence(s) traitée(s) et ${data.confirmationsEnvoyees} confirmation(s) envoyée(s).`, 'Session clôturée', 'success')
    await loadSessions()
  } catch (err) { await modalStore.showAlert(parseBackendError(err), 'Erreur', 'danger') } finally { closing.value = false }
}
onMounted(loadSessions)
</script>

<template>
  <DashboardLayout>
    <template #header><div><h2 class="text-xl font-semibold text-gray-900">Émargement</h2><p class="text-sm text-slate-500">Pointez les présences, puis clôturez chaque session.</p></div></template>
    <div v-if="demoMode" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Données de démonstration chargées pour tester l’émargement. Les changements restent locaux.</div>
    <div v-if="error" class="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <section class="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><label class="mb-1.5 block text-xs font-bold text-[#00313C]">Session à émarger</label><select v-model="selectedSessionId" class="input-field" @change="loadDetail"><option value="">Sélectionnez une session</option><option v-for="session in sessions" :key="session.id" :value="session.id">{{ sessionLabel(session) }}</option></select><p v-if="!sessions.length && !loading" class="mt-3 text-sm text-slate-500">Aucune session avec des candidats convoqués.</p></section>
    <div v-if="loading && !detail" class="flex h-56 items-center justify-center"><Loader2 class="h-8 w-8 animate-spin text-primary-600" /></div>
    <template v-else-if="detail">
      <section class="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary-50 p-5"><div><p class="text-xs font-bold uppercase tracking-wide text-primary-700">{{ detail.session.cohorteNom }}</p><h3 class="mt-1 font-bold text-[#00313C]">{{ detail.session.etapeNom }}</h3><p class="mt-1 text-sm text-slate-600"><CalendarDays class="mr-1 inline h-4 w-4" />{{ formatDate(detail.session.date) }} · {{ formatTime(detail.session.heureDebut) }} – {{ formatTime(detail.session.heureFin) }}</p></div><div class="flex gap-4 text-center text-sm"><span><b class="block text-lg text-emerald-700">{{ selectedSession?.presents || 0 }}</b>Présents</span><span><b class="block text-lg text-red-600">{{ selectedSession?.absents || 0 }}</b>Absents</span><span><b class="block text-lg text-amber-600">{{ selectedSession?.enAttente || 0 }}</b>À pointer</span></div></section>
      <section class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><h3 class="font-bold text-[#00313C]">Candidats convoqués</h3><label class="relative"><Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input v-model="search" class="input-field h-9 pl-9" placeholder="Rechercher…" /></label></div><div class="max-h-[480px] overflow-y-auto"><div v-for="assignment in filteredAssignments" :key="assignment.id" class="flex flex-wrap items-center gap-3 border-b border-slate-50 px-5 py-3 last:border-0"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-primary-700">{{ assignment.nom.split(' ').map((name) => name[0]).slice(0, 2).join('') }}</span><div class="min-w-48 flex-1"><p class="text-sm font-bold text-[#00313C]">{{ assignment.nom }}</p><p class="text-xs text-slate-500">{{ assignment.numero }} · {{ assignment.email }}</p></div><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="assignment.statutPresence === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : assignment.statutPresence === 'ABSENT' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'">{{ assignment.statutPresence === 'PRESENT' ? 'Présent' : assignment.statutPresence === 'ABSENT' ? 'Absent' : 'À pointer' }}</span><div class="flex gap-2"><button class="presence-btn presence-btn-ok" :disabled="savingId === assignment.id" @click="markPresence(assignment, 'PRESENT')"><UserCheck class="mr-1 h-4 w-4" />Présent</button><button class="presence-btn presence-btn-no" :disabled="savingId === assignment.id" @click="markPresence(assignment, 'ABSENT')"><UserX class="mr-1 h-4 w-4" />Absent</button></div></div></div><div class="flex justify-end border-t border-slate-100 bg-slate-50 p-4"><button class="btn-primary bg-red-600 hover:bg-red-700" :disabled="closing" @click="closeSession"><Loader2 v-if="closing" class="mr-2 h-4 w-4 animate-spin" />Clôturer l’émargement</button></div></section>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.presence-btn { @apply inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50; }.presence-btn-ok { @apply border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100; }.presence-btn-no { @apply border-red-200 bg-red-50 text-red-700 hover:bg-red-100; }
</style>
