<script setup>
import { onMounted, ref } from 'vue'
import { CalendarDays, CheckCircle2, Loader2, MapPin, UserCheck, UserX } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import api from '../services/api'

const route = useRoute()
const data = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const load = async () => {
  try {
    data.value = (await api.get(`evaluations/emargement/qr/${route.params.token}/`)).data
    if (data.value.statutPresence !== 'PRESENT') {
      data.value = (await api.post(`evaluations/emargement/qr/${route.params.token}/`)).data
    }
  } catch (err) { error.value = err.response?.data?.detail || 'QR code invalide ou expiré.' } finally { loading.value = false }
}
const markPresence = async (statutPresence) => {
  saving.value = true
  try { data.value = { ...data.value, ...(await api.patch(`evaluations/emargement/qr/${route.params.token}/`, { statutPresence })).data } } catch (err) { error.value = err.response?.data?.detail || 'Impossible de mettre à jour la présence.' } finally { saving.value = false }
}
onMounted(load)
</script>

<template>
  <DashboardLayout>
    <template #header><div><h2 class="text-xl font-semibold text-gray-900">Pointage par QR code</h2><p class="text-sm text-slate-500">Le candidat est marqué présent dès la présentation de son QR.</p></div></template>
    <div v-if="loading" class="flex h-56 items-center justify-center"><Loader2 class="h-8 w-8 animate-spin text-primary-600" /></div>
    <div v-else-if="error" class="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{{ error }}</div>
    <section v-else class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white"><div class="bg-primary-50 p-6"><p class="text-xs font-bold uppercase tracking-wide text-primary-700">{{ data.session.cohorteNom }}</p><h3 class="mt-1 text-xl font-bold text-[#00313C]">{{ data.nom }}</h3><p class="mt-1 text-sm text-slate-600">{{ data.numero }} · {{ data.email }}</p></div><div class="space-y-4 p-6"><div><p class="font-bold text-[#00313C]">{{ data.session.etapeNom }}</p><p class="mt-1 text-sm text-slate-600"><CalendarDays class="mr-1 inline h-4 w-4" />{{ data.session.date }} · {{ data.session.heureDebut?.slice(0, 5) }} – {{ data.session.heureFin?.slice(0, 5) }}</p><p class="mt-1 text-sm text-slate-600"><MapPin class="mr-1 inline h-4 w-4" />{{ data.session.lieu || 'Lieu à préciser' }}</p></div><div class="flex items-center gap-3 border-t border-slate-100 pt-4"><span class="rounded-full px-3 py-1 text-xs font-bold" :class="data.statutPresence === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : data.statutPresence === 'ABSENT' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'">{{ data.statutPresence === 'PRESENT' ? 'Présent' : data.statutPresence === 'ABSENT' ? 'Absent' : 'À pointer' }}</span><div class="ml-auto flex gap-2"><button class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50" :disabled="saving" @click="markPresence('PRESENT')"><UserCheck class="mr-1 inline h-4 w-4" />Présent</button><button class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50" :disabled="saving" @click="markPresence('ABSENT')"><UserX class="mr-1 inline h-4 w-4" />Absent</button></div></div><p v-if="data.statutPresence === 'PRESENT'" class="text-sm font-semibold text-emerald-700"><CheckCircle2 class="mr-1 inline h-4 w-4" />Présence enregistrée automatiquement lors du scan.</p></div></section>
  </DashboardLayout>
</template>
