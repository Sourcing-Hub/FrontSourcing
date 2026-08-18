<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { AlertCircle, CalendarDays, Camera, CheckCircle2, ClipboardCheck, Loader2, ScanLine, Search, UserCheck, UserX, X } from 'lucide-vue-next'
import { BrowserQRCodeReader } from '@zxing/browser'
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
const scanOpen = ref(false)
const scannerActive = ref(false)
const scanLoading = ref(false)
const scanSaving = ref(false)
const scanError = ref('')
const scanValue = ref('')
const scannedCandidate = ref(null)
const video = ref(null)
let scannerControls = null

const selectedSession = computed(() => sessions.value.find((session) => session.id === selectedSessionId.value))
const filteredAssignments = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('fr')
  return (detail.value?.affectations || []).filter((item) => !query || `${item.nom} ${item.numero} ${item.email}`.toLocaleLowerCase('fr').includes(query))
})
const getInitials = (name) => {
  if (!name) return '?'
  return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}
const formatDate = (value) => {
  if (!value) return ''
  try {
    const d = new Date(String(value).includes('T') ? value : `${value}T12:00:00`)
    if (isNaN(d.getTime())) return String(value)
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  } catch {
    return String(value)
  }
}
const formatTime = (value) => value ? String(value).slice(0, 5) : ''
const sessionLabel = (session) => {
  if (!session) return ''
  const cohorte = session.cohorteNom || ''
  const etape = session.etapeNom || ''
  const dateStr = formatDate(session.date)
  const timeStr = formatTime(session.heureDebut)
  return `${cohorte} — ${etape} · ${dateStr} · ${timeStr}`
}
const presenceLabel = (status) => status === 'PRESENT' ? 'Présent' : status === 'ABSENT' ? 'Absent' : 'À pointer'

const extractToken = (value) => {
  const trimmed = value.trim()
  const matched = trimmed.match(/scan-emargement\/([0-9a-f-]{36})/i)
  return matched?.[1] || trimmed
}

const stopCamera = () => {
  scannerControls?.stop()
  scannerControls = null
  scannerActive.value = false
}

const openScanner = () => {
  scanOpen.value = true
  scanError.value = ''
  scannedCandidate.value = null
  scanValue.value = ''
}

const closeScanner = () => {
  stopCamera()
  scanOpen.value = false
}

const findDemoCandidate = (value) => {
  const query = value.trim().toLocaleLowerCase('fr')
  return detail.value?.affectations.find((assignment) => [assignment.numero, assignment.email, assignment.nom].some((field) => field.toLocaleLowerCase('fr').includes(query)))
}

const readConvocation = async (value = scanValue.value) => {
  const rawValue = value?.trim()
  if (!rawValue) return
  scanLoading.value = true
  scanError.value = ''
  scannedCandidate.value = null
  stopCamera()
  try {
    if (demoMode.value) {
      const assignment = findDemoCandidate(rawValue)
      if (!assignment) throw new Error('Convocation introuvable pour cette session.')
      scannedCandidate.value = { ...assignment, session: detail.value.session, token: assignment.id }
    } else {
      const token = extractToken(rawValue)
      const { data } = await api.get(`evaluations/emargement/qr/${token}/`)
      if (data.session?.id && data.session.id !== selectedSessionId.value) throw new Error('Cette convocation ne correspond pas à la session sélectionnée.')
      scannedCandidate.value = { ...data, token }
    }
  } catch (err) { scanError.value = err.response?.data?.detail || err.message || 'Convocation invalide ou introuvable.' } finally { scanLoading.value = false }
}

const validateScannedPresence = async () => {
  if (!scannedCandidate.value) return
  scanSaving.value = true
  scanError.value = ''
  try {
    if (demoMode.value) {
      const assignment = detail.value.affectations.find((item) => item.id === scannedCandidate.value.id)
      assignment.statutPresence = 'PRESENT'
      refreshDemoSessionCounts(selectedSession.value, detail.value.affectations)
      scannedCandidate.value.statutPresence = 'PRESENT'
    } else {
      const { data } = await api.post(`evaluations/emargement/qr/${scannedCandidate.value.token}/`)
      scannedCandidate.value = { ...scannedCandidate.value, ...data }
      const index = detail.value?.affectations.findIndex((item) => item.id === data.id)
      if (index >= 0) detail.value.affectations[index] = data
      await loadSessions()
    }
  } catch (err) { scanError.value = err.response?.data?.detail || 'Impossible de valider la présence.' } finally { scanSaving.value = false }
}

const startCamera = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    scanError.value = 'L’accès caméra n’est pas disponible sur cet appareil. Collez le lien ou saisissez le code de la convocation.'
    return
  }
  scanError.value = ''
  try {
    await nextTick()
    const reader = new BrowserQRCodeReader()
    scannerActive.value = true
    scannerControls = await reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      video.value,
      async (result) => {
        if (!result || !scannerActive.value) return
        const value = result.getText()
        if (!value) return
        scanValue.value = value
        await readConvocation(value)
      },
    )
  } catch (err) {
    stopCamera()
    scanError.value = err?.name === 'NotAllowedError'
      ? 'L’autorisation d’utiliser la caméra a été refusée. Autorisez-la dans le navigateur puis réessayez.'
      : 'Impossible d’accéder à la caméra. Vérifiez l’autorisation puis réessayez, ou saisissez le code.'
  }
}

const loadSessions = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('evaluations/emargement/sessions/')
    sessions.value = data || []
    demoMode.value = false
    if (!selectedSessionId.value && sessions.value.length) {
      selectedSessionId.value = sessions.value[0].id
    }
    if (selectedSessionId.value) {
      await loadDetail()
    }
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    loading.value = false
  }
}
const loadDetail = async () => {
  if (!selectedSessionId.value) {
    detail.value = null
    return
  }
  loading.value = true
  try {
    const { data } = await api.get(`evaluations/emargement/sessions/${selectedSessionId.value}/`)
    detail.value = data
  } catch (err) {
    error.value = parseBackendError(err)
  } finally {
    loading.value = false
  }
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
onBeforeUnmount(stopCamera)
</script>

<template>
  <DashboardLayout>
    <template #header><div><h2 class="text-xl font-semibold text-gray-900">Émargement</h2><p class="text-sm text-slate-500">Pointez les présences, puis clôturez chaque session.</p></div></template>
    <div v-if="demoMode" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Données de démonstration chargées pour tester l’émargement. Les changements restent locaux.</div>
    <div v-if="error" class="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <section class="mb-5 rounded-2xl border border-slate-100 bg-white p-5"><label class="mb-1.5 block text-xs font-bold text-[#00313C]">Session à émarger</label><select v-model="selectedSessionId" class="input-field" @change="loadDetail"><option value="">Sélectionnez une session</option><option v-for="session in sessions" :key="session.id" :value="session.id">{{ sessionLabel(session) }}</option></select><p v-if="!sessions.length && !loading" class="mt-3 text-sm text-slate-500">Aucune session avec des candidats convoqués.</p></section>
    <div v-if="loading && !detail" class="flex h-56 items-center justify-center"><Loader2 class="h-8 w-8 animate-spin text-primary-600" /></div>
    <template v-else-if="detail">
      <section class="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary-50 p-5"><div><p class="text-xs font-bold uppercase tracking-wide text-primary-700">{{ detail.session.cohorteNom }}</p><h3 class="mt-1 font-bold text-[#00313C]">{{ detail.session.etapeNom }}</h3><p class="mt-1 text-sm text-slate-600"><CalendarDays class="mr-1 inline h-4 w-4" />{{ formatDate(detail.session.date) }} · {{ formatTime(detail.session.heureDebut) }} – {{ formatTime(detail.session.heureFin) }}</p></div><div class="flex items-center gap-5"><div class="flex gap-4 text-center text-sm"><span><b class="block text-lg text-emerald-700">{{ selectedSession?.presents || 0 }}</b>Présents</span><span><b class="block text-lg text-red-600">{{ selectedSession?.absents || 0 }}</b>Absents</span><span><b class="block text-lg text-amber-600">{{ selectedSession?.enAttente || 0 }}</b>À pointer</span></div><button class="scan-button" @click="openScanner"><ScanLine class="h-4 w-4" />Scanner une convocation</button></div></section>
      <section class="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><h3 class="font-bold text-[#00313C]">Candidats convoqués</h3><label class="relative"><Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input v-model="search" class="input-field h-9 pl-9" placeholder="Rechercher…" /></label></div><div class="max-h-[480px] overflow-y-auto"><div v-for="assignment in filteredAssignments" :key="assignment.id" class="flex flex-wrap items-center gap-3 border-b border-slate-50 px-5 py-3 last:border-0"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-primary-700">{{ getInitials(assignment.nom) }}</span><div class="min-w-48 flex-1"><p class="text-sm font-bold text-[#00313C]">{{ assignment.nom }}</p><p class="text-xs text-slate-500">{{ assignment.numero }} · {{ assignment.email }}</p></div><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="assignment.statutPresence === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : assignment.statutPresence === 'ABSENT' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'">{{ assignment.statutPresence === 'PRESENT' ? 'Présent' : assignment.statutPresence === 'ABSENT' ? 'Absent' : 'À pointer' }}</span><div class="flex gap-2"><button class="presence-btn presence-btn-ok" :disabled="savingId === assignment.id" @click="markPresence(assignment, 'PRESENT')"><UserCheck class="mr-1 h-4 w-4" />Présent</button><button class="presence-btn presence-btn-no" :disabled="savingId === assignment.id" @click="markPresence(assignment, 'ABSENT')"><UserX class="mr-1 h-4 w-4" />Absent</button></div></div></div><div class="flex justify-end border-t border-slate-100 bg-slate-50 p-4"><button class="btn-primary bg-red-600 hover:bg-red-700" :disabled="closing" @click="closeSession"><Loader2 v-if="closing" class="mr-2 h-4 w-4 animate-spin" />Clôturer l’émargement</button></div></section>
    </template>
    <div v-if="scanOpen" class="scan-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-title" @click.self="closeScanner">
      <section class="scan-dialog">
        <div class="flex items-start justify-between gap-4"><div><div class="flex items-center gap-2 text-primary-700"><ClipboardCheck class="h-5 w-5" /><h3 id="scan-title" class="font-bold">Scanner une convocation</h3></div><p class="mt-1 text-sm text-slate-500">Scannez le QR code, ou collez le lien de la convocation.</p></div><button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fermer" @click="closeScanner"><X class="h-5 w-5" /></button></div>
        <div v-if="!scannedCandidate" class="mt-5 space-y-4"><div class="camera-preview"><video ref="video" muted playsinline></video><div v-if="!scannerActive" class="camera-placeholder"><Camera class="h-8 w-8" /><span>Prêt à scanner votre QR code</span></div></div><button class="btn-secondary w-full justify-center" :disabled="scannerActive" @click="startCamera"><Camera class="mr-2 h-4 w-4" />{{ scannerActive ? 'Caméra active…' : 'Ouvrir la caméra' }}</button><div class="relative flex items-center py-1"><span class="h-px flex-1 bg-slate-200"></span><span class="px-3 text-xs text-slate-400">ou</span><span class="h-px flex-1 bg-slate-200"></span></div><form class="flex gap-2" @submit.prevent="readConvocation()"><input v-model="scanValue" class="input-field min-w-0 flex-1" placeholder="Lien ou code de convocation" autofocus /><button class="btn-primary shrink-0" :disabled="scanLoading || !scanValue.trim()"><Loader2 v-if="scanLoading" class="h-4 w-4 animate-spin" /><span v-else>Lire</span></button></form></div>
        <div v-else class="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4"><div class="flex items-start gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">{{ getInitials(scannedCandidate.nom) }}</span><div class="min-w-0 flex-1"><p class="font-bold text-[#00313C]">{{ scannedCandidate.nom }}</p><p class="truncate text-sm text-slate-500">{{ scannedCandidate.numero }} · {{ scannedCandidate.email }}</p><p class="mt-2 text-xs font-semibold text-slate-600">{{ scannedCandidate.session?.etapeNom }} · {{ scannedCandidate.session?.date }}</p></div><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="scannedCandidate.statutPresence === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ presenceLabel(scannedCandidate.statutPresence) }}</span></div><div class="mt-4 flex flex-wrap justify-end gap-2"><button class="btn-secondary" :disabled="scanSaving" @click="scannedCandidate = null">Scanner un autre</button><button class="scan-button" :disabled="scanSaving || scannedCandidate.statutPresence === 'PRESENT'" @click="validateScannedPresence"><Loader2 v-if="scanSaving" class="h-4 w-4 animate-spin" /><CheckCircle2 v-else class="h-4 w-4" />{{ scannedCandidate.statutPresence === 'PRESENT' ? 'Présence déjà validée' : 'Valider la présence' }}</button></div></div>
        <p v-if="scanError" class="mt-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />{{ scanError }}</p>
      </section>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.presence-btn { @apply inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50; }.presence-btn-ok { @apply border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100; }.presence-btn-no { @apply border-red-200 bg-red-50 text-red-700 hover:bg-red-100; }
.scan-button { @apply inline-flex items-center justify-center gap-2 rounded-lg bg-primary-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50; }
.scan-overlay { @apply fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4; }.scan-dialog { @apply w-full max-w-lg rounded-2xl bg-white p-5; }.camera-preview { @apply relative flex aspect-video overflow-hidden rounded-xl bg-slate-900; }.camera-preview video { @apply h-full w-full object-cover; }.camera-placeholder { @apply absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-slate-300; }
</style>
