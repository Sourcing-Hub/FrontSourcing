<script setup>
import { onMounted, ref } from 'vue'
import { CalendarDays, ExternalLink, FileText, Loader2 } from 'lucide-vue-next'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import testService from '@/services/testService'

const tests = ref([])
const loading = ref(true)
const error = ref('')

const formatDate = (value) => {
  if (!value) return 'Non précisée'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

const loadTests = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await testService.obtenirMesTests()
    tests.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Impossible de charger vos tests pour le moment.'
  } finally {
    loading.value = false
  }
}

onMounted(loadTests)
</script>

<template>
  <DashboardLayout>
    <main class="mx-auto w-full max-w-6xl p-5 sm:p-8">
      <header class="mb-7">
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">Espace candidat</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[#00313C]">Mes tests</h1>
        <p class="mt-2 text-sm text-slate-600">Retrouvez les tests publiés pour votre candidature.</p>
      </header>

      <div v-if="loading" class="flex min-h-56 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <Loader2 class="h-7 w-7 animate-spin text-primary-600" />
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
        {{ error }}
        <button class="ml-2 font-bold underline" type="button" @click="loadTests">Réessayer</button>
      </div>

      <div v-else-if="!tests.length" class="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
        <FileText class="mx-auto h-10 w-10 text-slate-300" />
        <h2 class="mt-4 font-bold text-[#00313C]">Aucun test disponible</h2>
        <p class="mt-2 text-sm text-slate-500">Les tests publiés pour votre candidature apparaîtront ici.</p>
      </div>

      <section v-else class="grid gap-5 md:grid-cols-2">
        <article v-for="test in tests" :key="test.id" class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-primary-700">{{ test.campagne }}</p>
              <h2 class="mt-2 text-xl font-extrabold text-[#00313C]">{{ test.nom }}</h2>
            </div>
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><FileText class="h-5 w-5" /></span>
          </div>
          <p class="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{{ test.description }}</p>
          <div class="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><CalendarDays class="h-4 w-4 text-primary-600" />À réaliser avant le {{ formatDate(test.date_cloture) }}</div>
          <a v-if="test.ressource_url" :href="test.ressource_url" target="_blank" rel="noopener noreferrer" class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-800"><ExternalLink class="h-4 w-4" />Consulter le test</a>
          <p v-else class="mt-5 text-sm font-medium text-amber-700">La ressource du test n’est pas encore disponible.</p>
        </article>
      </section>
    </main>
  </DashboardLayout>
</template>
