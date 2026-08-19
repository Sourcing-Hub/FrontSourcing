<script setup>
import { onMounted, ref } from 'vue'
import { CheckCircle2, Loader2, XCircle } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const data = ref(null)
const error = ref('')
const loading = ref(true)
const responseSent = ref(false)

const load = async () => {
  try { data.value = (await api.get(`evaluations/confirmation-presence/${route.params.token}/`)).data } catch (err) { error.value = err.response?.data?.detail || 'Ce lien de confirmation est invalide ou expiré.' } finally { loading.value = false }
}
const respond = async (continuer) => {
  try {
    const { data: response } = await api.post(`evaluations/confirmation-presence/${route.params.token}/`, { continuer })
    responseSent.value = true
    data.value.reponsePoursuiteEnregistree = true
    data.value.souhaiteContinuerProcedure = response.souhaiteContinuerProcedure
  } catch (err) { error.value = err.response?.data?.detail || 'La réponse n’a pas pu être enregistrée.' }
}
onMounted(load)
</script>

<template><main class="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100"><Loader2 v-if="loading" class="mx-auto h-8 w-8 animate-spin text-primary-600" /><template v-else-if="error"><h1 class="text-xl font-bold text-[#00313C]">Lien indisponible</h1><p class="mt-3 text-sm text-red-600">{{ error }}</p></template><template v-else><CheckCircle2 v-if="!data.reponsePoursuiteEnregistree && !responseSent" class="mx-auto h-12 w-12 text-emerald-500" /><CheckCircle2 v-else-if="data.souhaiteContinuerProcedure" class="mx-auto h-12 w-12 text-emerald-500" /><XCircle v-else class="mx-auto h-12 w-12 text-red-500" /><h1 class="mt-4 text-xl font-bold text-[#00313C]">Poursuite de votre candidature</h1><p class="mt-3 text-sm text-slate-600">Bonjour {{ data.nom }}, votre présence à l’étape « {{ data.etapeNom }} » a été enregistrée. Souhaitez-vous poursuivre la procédure de sélection ?</p><div v-if="!data.reponsePoursuiteEnregistree && !responseSent" class="mt-6 flex justify-center gap-3"><button class="btn-primary" @click="respond(true)">Oui, je continue</button><button class="btn-secondary" @click="respond(false)">Non, je m’arrête</button></div><p v-else class="mt-6 text-sm font-semibold" :class="data.souhaiteContinuerProcedure ? 'text-emerald-700' : 'text-red-700'">{{ data.souhaiteContinuerProcedure ? 'Votre poursuite de candidature est confirmée.' : 'Votre candidature a été clôturée à votre demande.' }}</p></template></section></main></template>
