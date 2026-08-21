<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { CalendarDays, Edit3, Loader2, MapPin, Mic, MicOff, Plus, Search, Trash2, Users, X } from 'lucide-vue-next'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { useAuthStore } from '../stores/auth'
import { useCampagnesStore } from '../stores/campagnes'
import { useModalStore } from '../stores/modal'
import { usePlanningsStore } from '../stores/plannings'

const planningsStore = usePlanningsStore()
const campagnesStore = useCampagnesStore()
const authStore = useAuthStore()
const modalStore = useModalStore()
const selectedEtape = ref('')
const selectedCategory = ref('all')
const selectedFormation = ref('')
const selectedCohorte = ref('')
const selectedStatus = ref('all')
const searchTerm = ref('')
const showForm = ref(false)
const editingId = ref(null)
const encadrants = ref([])
const selectedDayIndex = ref(0)
const voiceSupported = ref(false)
const voiceListening = ref(false)
const voiceTranscript = ref('')
const voiceError = ref('')
let speechRecognition = null
let SpeechRecognitionApi = null

const emptyPlanning = () => ({
  etape: '', date: '', heureDebut: '', heureFin: '', lieu: '', localisation: '', capacite: 1,
})
const form = reactive(emptyPlanning())
const configuration = reactive({
  formation: '', cohorte: '', etape: '', lieu: '', localisation: '', encadreur: '',
  jours: [],
})

const etapes = computed(() =>
  campagnesStore.cohortes.flatMap((cohorte) =>
    (cohorte.etapes || []).map((etape) => ({
      ...etape,
      cohorte: cohorte.id,
      formation: cohorte.formation,
      label: `${etape.nom} — ${cohorte.nom}`,
    })),
  ),
)
const cohortes = computed(() => campagnesStore.cohortes)
const formations = computed(() => campagnesStore.formations)
const selectedFormationName = computed(() =>
  formations.value.find((formation) => formation.id === selectedFormation.value)?.nom || '',
)
const filteredCohortes = computed(() =>
  cohortes.value.filter((cohorte) => !selectedFormation.value || cohorte.formation === selectedFormation.value),
)
const stepTypes = [
  { id: 'information', label: "Réunion d'information" },
  { id: 'technique', label: 'Entretien Tech & Motivation' },
  { id: 'final', label: 'Entretien final' },
]
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const getCategory = (etapeNom) => {
  const name = normalize(etapeNom)
  if (name.includes('reunion') || name.includes('information')) return 'information'
  if (name.includes('technique') || name.includes('motivation')) return 'technique'
  if (name.includes('final')) return 'final'
  return 'other'
}
const categoryTabs = computed(() => [
  { id: 'all', label: 'Toutes les étapes', count: planningsStore.plannings.length },
  { id: 'information', label: 'Réunion d’information', count: planningsStore.plannings.filter((planning) => getCategory(planning.etape_nom) === 'information').length },
  { id: 'technique', label: 'Entretien technique et motivation', count: planningsStore.plannings.filter((planning) => getCategory(planning.etape_nom) === 'technique').length },
  { id: 'final', label: 'Entretien final', count: planningsStore.plannings.filter((planning) => getCategory(planning.etape_nom) === 'final').length },
])
const filteredPlannings = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const query = normalize(searchTerm.value.trim())
  return planningsStore.plannings.filter((planning) => {
    const matchesCategory = !selectedCategory.value || selectedCategory.value === 'all' || getCategory(planning.etape_nom) === selectedCategory.value
    const matchesFormation = !selectedFormation.value || planning.formation_nom === selectedFormationName.value
    const matchesCohorte = !selectedCohorte.value || planning.cohorte_nom === selectedCohorte.value
    const matchesStatus = selectedStatus.value === 'all'
      || (selectedStatus.value === 'upcoming' && planning.date >= today)
      || (selectedStatus.value === 'completed' && planning.date < today)
    const content = normalize(`${planning.etape_nom} ${planning.cohorte_nom} ${planning.formation_nom} ${planning.lieu} ${planning.localisation}`)
    return matchesCategory && matchesFormation && matchesCohorte && matchesStatus && (!query || content.includes(query))
  })
})
const selectedDay = computed(() => configuration.jours[selectedDayIndex.value] || null)
const configurationEtapes = computed(() =>
  cohortes.value.find((cohorte) => cohorte.id === configuration.cohorte)?.etapes || [],
)
const configurationCohortes = computed(() =>
  cohortes.value.filter((cohorte) => !configuration.formation || cohorte.formation === configuration.formation),
)
const displayedEtapes = computed(() => {
  if (configuration.cohorte) {
    const cohorteObj = cohortes.value.find((c) => c.id === configuration.cohorte)
    return (cohorteObj?.etapes || []).map((e) => ({
      ...e,
      label: `${e.nom} (${cohorteObj?.nom || ''})`,
    }))
  }
  if (configuration.formation) {
    const formationCohortes = cohortes.value.filter((c) => c.formation === configuration.formation)
    return formationCohortes.flatMap((c) => (c.etapes || []).map((e) => ({
      ...e,
      label: `${e.nom} — ${c.nom}`,
    })))
  }
  return etapes.value
})

const stepForType = (type) => displayedEtapes.value.find((etape) => getCategory(etape.nom) === type)

const canManage = computed(() =>
  authStore.user?.role === 'Administrateur' || authStore.user?.role === 'Équipe Gestion de Projet',
)

onMounted(async () => {
  SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition
  voiceSupported.value = Boolean(SpeechRecognitionApi)
  const [, , , coaches] = await Promise.all([
    planningsStore.fetchPlannings(), campagnesStore.fetchCohortes(), campagnesStore.fetchFormations(), planningsStore.fetchEncadrants(),
  ])
  encadrants.value = coaches
})
onBeforeUnmount(() => {
  speechRecognition?.abort()
})

const openCreate = () => {
  editingId.value = null
  const defaultFormation = selectedFormation.value || (formations.value[0]?.id || '')
  const availableCohortes = cohortes.value.filter((c) => !defaultFormation || c.formation === defaultFormation)
  const defaultCohorte = availableCohortes[0]?.id || (cohortes.value[0]?.id || '')
  const availableEtapes = defaultCohorte
    ? (cohortes.value.find((c) => c.id === defaultCohorte)?.etapes || [])
    : etapes.value

  Object.assign(configuration, {
    formation: defaultFormation,
    cohorte: defaultCohorte,
    etape: availableEtapes[0]?.id || (etapes.value[0]?.id || ''),
    lieu: '',
    localisation: '',
    encadreur: '',
    jours: [],
  })
  addDay()
  selectedDayIndex.value = 0
  showForm.value = true
}

const selectConfigurationFormation = () => {
  if (configuration.formation && configurationCohortes.value.length > 0) {
    configuration.cohorte = configurationCohortes.value[0].id
  } else {
    configuration.cohorte = ''
  }
  selectConfigurationCohorte()
}
const selectConfigurationCohorte = () => {
  if (displayedEtapes.value.length > 0) {
    configuration.etape = displayedEtapes.value[0].id
  } else {
    configuration.etape = ''
  }
}
const onEtapeSelectChange = () => {
  const selectedObj = etapes.value.find((e) => e.id === configuration.etape)
  if (selectedObj) {
    if (!configuration.cohorte) configuration.cohorte = selectedObj.cohorte
    if (!configuration.formation) configuration.formation = selectedObj.formation
  }
}
const resetCohorteFilter = () => {
  selectedCohorte.value = ''
}
const selectStepType = (type) => {
  const etape = stepForType(type)
  if (etape) {
    configuration.etape = etape.id
    onEtapeSelectChange()
  }
}

const openEdit = (planning) => {
  editingId.value = planning.id
  Object.assign(form, {
    etape: planning.etape,
    date: planning.date,
    heureDebut: planning.heureDebut?.slice(0, 5),
    heureFin: planning.heureFin?.slice(0, 5),
    lieu: planning.lieu || '',
    localisation: planning.localisation || '',
    capacite: planning.capacite,
  })
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
}

const addDay = () => {
  const date = new Date()
  date.setDate(date.getDate() + configuration.jours.length)
  configuration.jours.push({
    date: date.toISOString().slice(0, 10),
    creneaux: [{ heureDebut: '09:00', heureFin: '12:00', capacite: 20 }],
  })
  selectedDayIndex.value = configuration.jours.length - 1
}
const removeDay = (index) => {
  if (configuration.jours.length === 1) return
  configuration.jours.splice(index, 1)
  selectedDayIndex.value = Math.min(selectedDayIndex.value, configuration.jours.length - 1)
}
const addSlot = (jour) => jour.creneaux.push({ heureDebut: '14:00', heureFin: '17:00', capacite: 20 })
const removeSlot = (jour, index) => jour.creneaux.splice(index, 1)
const totalSlots = computed(() => configuration.jours.reduce((total, jour) => total + jour.creneaux.length, 0))
const totalCapacity = computed(() => configuration.jours.reduce((total, jour) => total + jour.creneaux.reduce((sum, slot) => sum + Number(slot.capacite || 0), 0), 0))

const parseVoiceTime = (value) => {
  const normalized = value.replace('h', ':').replace(/\s/g, '')
  const [hours, minutes = '00'] = normalized.split(':')
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}
const parseVoiceDate = (text, fallback) => {
  const date = new Date()
  if (text.includes('apres-demain')) date.setDate(date.getDate() + 2)
  else if (text.includes('demain')) date.setDate(date.getDate() + 1)
  else if (!text.includes("aujourd'hui") && !text.includes('aujourd hui')) return fallback
  return date.toISOString().slice(0, 10)
}
const applyVoiceCommand = (rawText) => {
  if (!rawText || rawText.trim().length < 4 || /^[.\s]+$/.test(rawText)) {
    voiceError.value = 'Aucune parole détectée. Maintenez le bouton pendant toute votre phrase, puis arrêtez l’enregistrement.'
    return
  }
  const text = rawText.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const timeMatches = text.match(/\b\d{1,2}(?:\s*h(?:\s*\d{1,2})?|:\d{2})?\b/g) || []
  if (timeMatches.length < 2) {
    voiceError.value = 'Je n’ai pas reconnu les horaires. Dites par exemple : « ajoute un créneau de 9h à 12h, capacité 20 ». '
    return
  }
  const capacityMatch = text.match(/(?:capacite|places?)\s*(?:de|a|:)?\s*(\d+)/)
  const locationMatch = rawText.match(/\b(?:a|à|dans|en)\s+([\wÀ-ÿ' -]{3,50}?)(?:\s+capacite|\s+places?|$)/i)
  const date = parseVoiceDate(text, selectedDay.value?.date || new Date().toISOString().slice(0, 10))
  const slot = {
    heureDebut: parseVoiceTime(timeMatches[0]),
    heureFin: parseVoiceTime(timeMatches[1]),
    capacite: Number(capacityMatch?.[1] || 20),
  }
  if (locationMatch?.[1]) configuration.lieu = locationMatch[1].trim()
  let dayIndex = configuration.jours.findIndex((jour) => jour.date === date)
  if (dayIndex === -1) {
    configuration.jours.push({ date, creneaux: [] })
    dayIndex = configuration.jours.length - 1
  }
  configuration.jours[dayIndex].creneaux.push(slot)
  selectedDayIndex.value = dayIndex
  voiceError.value = ''
}
const startVoiceCommand = () => {
  if (!voiceSupported.value) return
  voiceError.value = ''
  voiceTranscript.value = ''
  speechRecognition = new SpeechRecognitionApi()
  speechRecognition.lang = 'fr-FR'
  speechRecognition.interimResults = false
  speechRecognition.maxAlternatives = 1
  speechRecognition.onresult = (event) => {
    voiceTranscript.value = event.results[0][0].transcript
    applyVoiceCommand(voiceTranscript.value)
  }
  speechRecognition.onerror = () => {
    voiceError.value = 'La reconnaissance vocale n’a pas pu traiter votre commande.'
    voiceListening.value = false
  }
  speechRecognition.onend = () => { voiceListening.value = false }
  speechRecognition.start()
  voiceListening.value = true
}
const stopVoiceCommand = () => {
  speechRecognition?.stop()
  voiceListening.value = false
}

const save = async () => {
  if (!editingId.value) {
    const planningConfiguration = { ...configuration }
    delete planningConfiguration.formation
    delete planningConfiguration.cohorte
    const saved = await planningsStore.configurePlannings({
      ...planningConfiguration,
      jours: configuration.jours.map((jour) => ({ ...jour, creneaux: jour.creneaux.map((slot) => ({ ...slot, capacite: Number(slot.capacite) })) })),
    })
    if (saved) {
      closeForm()
      await planningsStore.fetchPlannings(selectedEtape.value)
      await modalStore.showAlert(`${saved.length} créneau(x) ont été ajoutés au planning.`, 'Succès', 'success')
    }
    return
  }
  const isEditing = Boolean(editingId.value)
  const payload = { ...form, capacite: Number(form.capacite) }
  const saved = editingId.value
    ? await planningsStore.updatePlanning(editingId.value, payload)
    : await planningsStore.createPlanning(payload)
  if (saved) {
    closeForm()
    await planningsStore.fetchPlannings(selectedEtape.value)
    await modalStore.showAlert(
      isEditing ? 'Le planning a été modifié.' : 'Le planning a été ajouté.',
      'Succès',
      'success',
    )
  }
}

const remove = async (planning) => {
  const confirmed = await modalStore.showConfirm(
    `Supprimer définitivement le planning « ${planning.etape_nom} » du ${formatDate(planning.date)} ?`,
    'Supprimer le planning',
    { confirmText: 'Supprimer', variant: 'danger' },
  )
  if (confirmed && await planningsStore.deletePlanning(planning.id)) {
    await modalStore.showAlert('Le planning a été supprimé.', 'Succès', 'success')
  }
}

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
  : '—'
const formatDayName = (value) => value
  ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date(`${value}T12:00:00`))
  : 'Jour'
const formatDayNumber = (value) => value
  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`))
  : 'à définir'
const getPlanningStatus = (date) => date >= new Date().toISOString().slice(0, 10) ? 'upcoming' : 'completed'
</script>

<template>
  <DashboardLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Planification</h2>
          <p class="text-sm text-gray-500">Organisez les sessions d'entretien et d'évaluation.</p>
        </div>
        <button v-if="canManage" class="btn-primary" @click="openCreate">
          <Plus class="w-4 h-4 mr-2" /> Ajouter un planning
        </button>
      </div>
    </template>

    <div v-if="planningsStore.error" class="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
      {{ planningsStore.error }}
    </div>

    <section class="mb-6 overflow-hidden rounded-xl border border-slate-100 bg-white">
      <nav class="flex overflow-x-auto border-b border-slate-100" aria-label="Filtrer par type d'étape">
        <button v-for="tab in categoryTabs" :key="tab.id" type="button" class="planning-tab" :class="{ 'planning-tab-active': selectedCategory === tab.id }" @click="selectedCategory = tab.id">
          {{ tab.label }} <span class="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">{{ tab.count }}</span>
        </button>
      </nav>
      <div class="grid gap-3 p-4 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.75fr]">
        <label class="relative"><span class="sr-only">Rechercher un planning</span><Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input v-model="searchTerm" class="input-field pl-9" placeholder="Rechercher une étape, un lieu…" /></label>
        <select v-model="selectedFormation" class="input-field" @change="resetCohorteFilter"><option value="">Toutes les formations</option><option v-for="formation in formations" :key="formation.id" :value="formation.id">{{ formation.nom }}</option></select>
        <select v-model="selectedCohorte" class="input-field" :disabled="!filteredCohortes.length"><option value="">Toutes les promos</option><option v-for="cohorte in filteredCohortes" :key="cohorte.id" :value="cohorte.nom">{{ cohorte.nom }}</option></select>
        <select v-model="selectedStatus" class="input-field"><option value="all">Tous les états</option><option value="upcoming">À venir</option><option value="completed">Terminés</option></select>
      </div>
    </section>

    <div v-if="planningsStore.loading && !planningsStore.plannings.length" class="flex h-56 items-center justify-center">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>
    <section v-else>
      <div class="mb-3 flex items-center justify-between"><p class="text-sm text-slate-500"><b class="text-[#00313C]">{{ filteredPlannings.length }}</b> planning(s) affiché(s)</p></div>
      <div v-if="filteredPlannings.length" class="planning-table">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[780px] text-left">
            <caption class="sr-only">Liste des plannings</caption>
            <thead>
              <tr class="planning-table-header"><th>Étape de sélection</th><th>Formation / promo</th><th>Rendez-vous</th><th>Lieu</th><th>Capacité</th><th>Statut</th><th class="text-right">Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="planning in filteredPlannings" :key="planning.id" class="planning-table-row">
                <td><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#CE0033]/10 text-[#CE0033]">{{ planning.etape_nom || 'Étape non renseignée' }}</span></td>
                <td><div class="planning-program"><strong>{{ planning.formation_nom || 'Formation non renseignée' }}</strong><span>{{ planning.cohorte_nom || 'Promo non renseignée' }}</span></div></td>
                <td><div class="planning-appointment"><strong>{{ formatDate(planning.date) }}</strong><span>{{ planning.heureDebut?.slice(0, 5) }} — {{ planning.heureFin?.slice(0, 5) }}</span></div></td>
                <td><div class="planning-place"><MapPin class="h-4 w-4 shrink-0 text-primary-600" /><span>{{ planning.lieu || planning.localisation || 'Non renseigné' }}</span></div></td>
                <td><span class="capacity-pill" title="Capacité"><Users class="h-4 w-4" />{{ planning.capacite }}</span></td>
                <td><span class="planning-status" :class="`planning-status-${getPlanningStatus(planning.date)}`">{{ getPlanningStatus(planning.date) === 'upcoming' ? 'À venir' : 'Terminé' }}</span></td>
                <td><div class="planning-actions"><template v-if="canManage"><button class="icon-action icon-edit" title="Modifier" @click="openEdit(planning)"><Edit3 class="w-4 h-4" /></button><button class="icon-action icon-delete" title="Supprimer" @click="remove(planning)"><Trash2 class="w-4 h-4" /></button></template></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500"><CalendarDays class="mx-auto mb-3 h-9 w-9 text-slate-300" />Aucun planning ne correspond aux filtres sélectionnés.</div>
    </section>

    <div v-if="showForm" class="fixed inset-y-0 left-64 right-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 sm:p-6">
      <div class="absolute inset-0" @click="closeForm" />
      <form class="relative my-auto flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white" @submit.prevent="save">
        <div class="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3 sm:px-6">
          <div>
            <p v-if="!editingId" class="mb-1 text-xs font-bold uppercase tracking-widest text-pink-600">Configuration de session</p>
            <h3 class="text-xl font-bold text-[#00313C]">{{ editingId ? 'Modifier le planning' : 'Planifier les entretiens' }}</h3>
          </div>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="closeForm"><X class="w-5 h-5" /></button>
        </div>
        <div v-if="editingId" class="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          <div>
            <label class="form-label">Type d'étape de sélection</label>
            <select v-model="form.etape" class="input-field mt-1" required>
              <option value="" disabled>Sélectionnez le type et la cohorte</option>
              <option v-for="etape in etapes" :key="etape.id" :value="etape.id">{{ etape.label }}</option>
            </select>
            <p v-if="!etapes.length" class="mt-1 text-sm text-amber-700">Créez d'abord une étape dans une cohorte pour pouvoir la planifier.</p>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div><label class="form-label">Date</label><input v-model="form.date" class="input-field mt-1" type="date" required /></div>
            <div><label class="form-label">Heure de début</label><input v-model="form.heureDebut" class="input-field mt-1" type="time" required /></div>
            <div><label class="form-label">Heure de fin</label><input v-model="form.heureFin" class="input-field mt-1" type="time" required /></div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label class="form-label">Lieu</label><input v-model="form.lieu" class="input-field mt-1" placeholder="Ex. Salle A" /></div>
            <div><label class="form-label">Localisation / lien</label><input v-model="form.localisation" class="input-field mt-1" placeholder="Ex. Dakar ou lien visio" /></div>
          </div>
          <div class="max-w-xs"><label class="form-label">Capacité</label><input v-model="form.capacite" class="input-field mt-1" type="number" min="1" required /></div>
        </div>
        <div v-else class="flex-1 overflow-y-auto p-5 sm:p-6">
          <div class="mb-5 grid gap-4 md:grid-cols-[0.8fr_0.8fr_1.2fr]">
            <div>
              <label class="form-label">Formation</label>
              <select v-model="configuration.formation" class="input-field mt-1" @change="selectConfigurationFormation">
                <option value="">Toutes les formations</option>
                <option v-for="formation in formations" :key="formation.id" :value="formation.id">{{ formation.nom }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Promo / cohorte</label>
              <select v-model="configuration.cohorte" class="input-field mt-1" @change="selectConfigurationCohorte">
                <option value="">Toutes les promos</option>
                <option v-for="cohorte in configurationCohortes" :key="cohorte.id" :value="cohorte.id">{{ cohorte.nom }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Lieu ou modalité</label>
              <input v-model="configuration.lieu" class="input-field mt-1" placeholder="Ex. Salle de réunion A / Visioconférence" />
            </div>
          </div>

          <section class="mb-6">
            <div class="mb-2 flex items-center justify-between">
              <label class="form-label">Étape de sélection <span class="text-red-500">*</span></label>
              <span class="text-xs text-slate-500">Choisissez l'étape d'évaluation à planifier</span>
            </div>
            
            <!-- Liste déroulante directe des étapes d'évaluation -->
            <div class="mt-1">
              <select v-model="configuration.etape" class="input-field" required @change="onEtapeSelectChange">
                <option value="" disabled>-- Sélectionner l'étape d'évaluation --</option>
                <option v-for="etape in displayedEtapes" :key="etape.id" :value="etape.id">
                  {{ etape.label || etape.nom }}
                </option>
              </select>
            </div>

            <!-- Onglets raccourcis par type d'étape -->
            <div v-if="displayedEtapes.length" class="step-type-tabs mt-3" role="tablist" aria-label="Type d'étape de sélection">
              <button
                v-for="type in stepTypes"
                :key="type.id"
                type="button"
                class="step-type-tab"
                :class="{ 'step-type-tab-active': getCategory(displayedEtapes.find((etape) => etape.id === configuration.etape)?.nom) === type.id }"
                :disabled="!stepForType(type.id)"
                role="tab"
                :aria-selected="getCategory(displayedEtapes.find((etape) => etape.id === configuration.etape)?.nom) === type.id"
                @click="selectStepType(type.id)"
              >
                {{ type.label }}
              </button>
            </div>

            <p v-if="!displayedEtapes.length" class="mt-2 text-xs text-amber-700 font-medium">
              Aucune étape d'évaluation disponible.
            </p>
          </section>
          <section>
            <p class="section-title">Sélection des jours</p>
            <div class="mt-3 flex flex-wrap gap-3">
              <button v-for="(jour, dayIndex) in configuration.jours" :key="dayIndex" type="button" class="day-card" :class="{ 'day-card-active': selectedDayIndex === dayIndex }" @click="selectedDayIndex = dayIndex">
                <span class="capitalize">{{ formatDayName(jour.date) }}</span><strong>{{ formatDayNumber(jour.date) }}</strong><span v-if="configuration.jours.length > 1" class="day-remove" title="Supprimer ce jour" @click.stop="removeDay(dayIndex)"><X class="h-3.5 w-3.5" /></span>
              </button>
              <button type="button" class="day-card day-add" @click="addDay"><Plus class="h-4 w-4" /><span>Ajouter</span></button>
            </div>
            <div class="mt-3 max-w-xs"><label class="text-xs font-semibold text-slate-500">Date du jour sélectionné</label><input v-if="selectedDay" v-model="selectedDay.date" type="date" class="input-field mt-1" required /></div>
          </section>
          <div class="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section v-if="selectedDay">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2"><p class="section-title mb-0">Créneaux horaires <span class="capitalize">({{ formatDayName(selectedDay.date) }} {{ formatDayNumber(selectedDay.date) }})</span></p><div class="flex items-center gap-3"><button type="button" class="text-sm font-bold text-pink-600 hover:text-pink-700" @click="addSlot(selectedDay)">+ Créneau</button><button v-if="voiceSupported" type="button" class="voice-command-btn" :class="{ 'voice-command-btn-active': voiceListening }" :title="voiceListening ? 'Arrêter la commande vocale' : 'Ajouter un créneau par commande vocale'" @click="voiceListening ? stopVoiceCommand() : startVoiceCommand()"><MicOff v-if="voiceListening" class="mr-1.5 h-4 w-4" /><Mic v-else class="mr-1.5 h-4 w-4" />{{ voiceListening ? 'Écoute en cours…' : 'Commande vocale' }}</button></div></div>
              <p v-if="voiceTranscript" class="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">Entendu : « {{ voiceTranscript }} »</p>
              <p v-if="voiceError" class="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{{ voiceError }}</p>
              <div class="space-y-3">
                <div v-for="(slot, slotIndex) in selectedDay.creneaux" :key="slotIndex" class="slot-row">
                  <div><label class="slot-label">Début</label><input v-model="slot.heureDebut" class="input-field" type="time" required /></div>
                  <span class="mt-5 text-center font-bold text-[#00313C]">→</span>
                  <div><label class="slot-label">Fin</label><input v-model="slot.heureFin" class="input-field" type="time" required /></div>
                  <div><label class="slot-label">Capacité</label><div class="relative"><Users class="absolute left-3 top-3 h-4 w-4 text-[#00313C]" /><input v-model="slot.capacite" class="input-field pl-9" type="number" min="1" required /></div></div>
                  <button type="button" class="mt-5 text-[#00313C] hover:text-red-600 disabled:opacity-30" :disabled="selectedDay.creneaux.length === 1" @click="removeSlot(selectedDay, slotIndex)"><Trash2 class="h-4 w-4" /></button>
                </div>
              </div>
            </section>
            <section>
              <p class="section-title">Encadreur de la sélection</p>
              <div class="mt-4">
                <label class="form-label">Sélectionner un encadreur</label>
                <select v-model="configuration.encadreur" class="input-field mt-1">
                  <option value="">Aucun encadreur attribué</option>
                  <option v-for="user in encadrants" :key="user.id" :value="user.id">
                    {{ user.nomComplet }} — {{ user.role }}
                  </option>
                </select>
              </div>
              <div class="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#00313C]">
                <p class="font-bold">Note de session</p>
                <p class="mt-1 leading-6">L'encadreur sélectionné recevra une affectation sur chacun des créneaux enregistrés.</p>
              </div>
            </section>
          </div>
          <div class="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm text-[#00313C]"><span><b>{{ configuration.jours.length }}</b> jour(s) sélectionné(s)</span><span><b>{{ totalSlots }}</b> créneau(x) créé(s)</span><span><b>Capacité : {{ totalCapacity }}</b> candidats</span><span class="ml-auto font-bold text-emerald-700">● Configuration valide</span></div>
        </div>
        <div class="flex shrink-0 justify-end gap-3 border-t bg-gray-50 px-5 py-3 sm:px-6">
          <button type="button" class="btn-secondary" @click="closeForm">Annuler</button>
          <button class="btn-primary" type="submit" :disabled="planningsStore.loading || !etapes.length || (!editingId && !configuration.etape)"><Loader2 v-if="planningsStore.loading" class="mr-2 h-4 w-4 animate-spin" />{{ editingId ? 'Enregistrer' : 'Enregistrer la configuration' }}</button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.table-header { @apply px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500; }
.form-label { @apply block text-sm font-medium text-gray-700; }
.icon-action { @apply inline-flex rounded-lg p-2 transition-colors hover:opacity-75; }
.planning-tab { @apply shrink-0 border-b-2 border-transparent px-5 py-4 text-sm font-semibold text-[#00313C] transition hover:bg-slate-50; }
.planning-tab-active { @apply border-pink-500 bg-pink-50/40 text-pink-600; }
.planning-table { @apply overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm; }
.planning-table-header { @apply border-b border-[#00313C] bg-[#00313C] text-left text-[11px] font-bold uppercase tracking-wider text-white; }
.planning-table-header th { @apply whitespace-nowrap px-5 py-4; }
.planning-table-row { @apply border-b border-slate-100 transition-colors last:border-b-0 hover:bg-primary-50/30; }
.planning-table-row td { @apply px-5 py-4 align-middle; }
.planning-cell { @apply max-w-44 truncate text-sm text-slate-600; }
.planning-program { @apply flex max-w-52 flex-col; }
.planning-program strong { @apply truncate text-sm font-semibold text-[#00313C]; }
.planning-program span { @apply mt-0.5 truncate text-xs text-slate-500; }
.planning-appointment { @apply flex min-w-44 flex-col gap-1; }
.planning-appointment strong { @apply whitespace-nowrap text-sm font-semibold text-[#00313C]; }
.planning-appointment span { @apply w-fit whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600; }
.planning-place { @apply flex min-w-0 items-center gap-2 text-sm text-slate-600; }
.planning-place span { @apply max-w-40 truncate; }
.planning-actions { @apply flex shrink-0 items-center justify-end gap-2; }
.planning-actions .icon-action { @apply h-9 w-9 items-center justify-center p-0; }
.stage-pill { @apply inline-flex max-w-48 truncate rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700; }
.capacity-pill { @apply inline-flex min-w-11 items-center justify-center gap-1 rounded-lg bg-[#00313C]/[0.08] px-2.5 py-2 text-sm font-bold text-[#00313C]; }
.planning-status { @apply inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold; }
.planning-status-upcoming { @apply bg-emerald-50 text-emerald-700; }
.planning-status-completed { @apply bg-slate-100 text-slate-600; }
.icon-edit { @apply bg-primary-50 text-primary-600 hover:bg-primary-100; }
.icon-delete { @apply bg-red-50 text-red-600 hover:bg-red-100; }
.step-type-tabs { @apply grid overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:grid-cols-3; }
.step-type-tab { @apply relative min-h-[3.75rem] border-b border-slate-200 px-4 py-3 text-sm font-semibold text-[#00313C] transition hover:bg-white focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:border-b-0 sm:border-r last:border-r-0; }
.step-type-tab-active { @apply bg-white text-primary-700 shadow-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary-600; }
.section-title { @apply text-xs font-bold uppercase tracking-wide text-[#00313C]; }
.day-card { @apply relative flex min-w-24 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#00313C] transition hover:border-pink-300; }
.day-card strong { @apply mt-0.5 text-base; }
.day-card-active { @apply border-2 border-pink-500 bg-pink-50 text-pink-600; }
.day-remove { @apply absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 text-slate-500 shadow hover:text-red-600; }
.day-add { @apply border-dashed text-[#00313C]; }
.slot-row { @apply grid grid-cols-[1fr_18px_1fr_1fr_24px] items-end gap-2 rounded-xl border border-slate-200 bg-white p-3; }
.slot-label { @apply mb-1 block text-xs font-semibold text-slate-500; }
.voice-command-btn { @apply inline-flex items-center rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-xs font-bold text-pink-700 transition hover:bg-pink-100; }
.voice-command-btn-active { @apply border-red-200 bg-red-50 text-red-700; }

@media (max-width: 900px) {
  .planning-table { @apply rounded-xl; }
  .planning-table-header th, .planning-table-row td { @apply px-4; }
}

@media (max-width: 640px) {
  .step-type-tabs { @apply grid-cols-1; }
  .step-type-tab { @apply border-r-0 last:border-b-0; }
}
</style>
