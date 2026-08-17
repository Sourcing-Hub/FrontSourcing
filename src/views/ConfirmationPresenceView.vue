<script setup>
import { onMounted, ref } from 'vue'
import { CheckCircle2, Loader2 } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const data = ref(null)
const error = ref('')
const loading = ref(true)
const confirmed = ref(false)

const load = async () => {
  try { data.value = (await api.get(`evaluations/confirmation-presence/${route.params.token}/`)).data } catch (err) { error.value = err.response?.data?.detail || 'Ce lien de confirmation est invalide ou expiré.' } finally { loading.value = false }
}
const confirm = async () => {
  try { await api.post(`evaluations/confirmation-presence/${route.params.token}/`); confirmed.value = true; data.value.confirmee = true } catch (err) { error.value = err.response?.data?.detail || 'La confirmation a échoué.' }
}
onMounted(load)
</script>

<template><main class="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100"><Loader2 v-if="loading" class="mx-auto h-8 w-8 animate-spin text-primary-600" /><template v-else-if="error"><h1 class="text-xl font-bold text-[#00313C]">Lien indisponible</h1><p class="mt-3 text-sm text-red-600">{{ error }}</p></template><template v-else><CheckCircle2 class="mx-auto h-12 w-12 text-emerald-500" /><h1 class="mt-4 text-xl font-bold text-[#00313C]">Confirmation de présence</h1><p class="mt-3 text-sm text-slate-600">Bonjour {{ data.nom }}, votre présence à l’étape « {{ data.etapeNom }} » a été enregistrée.</p><button class="btn-primary mt-6" :disabled="data.confirmee || confirmed" @click="confirm">{{ data.confirmee || confirmed ? 'Présence confirmée' : 'Je confirme ma présence' }}</button></template></section></main></template>
