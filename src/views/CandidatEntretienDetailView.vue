<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Loader2, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router' import DashboardLayout from '../components/layouts/DashboardLayout.vue' import { fetchInterviewCandidateDetail, saveCandidatureDecision,
} from '../services/questionnaires' import { parseBackendError } from '../utils/errorHandler' const route = useRoute()
const router = useRouter() /*
|--------------------------------------------------------------------------
| État principal
|--------------------------------------------------------------------------
*/ const candidate = ref(null)
const loading = ref(false)
const saving = ref('')
const error = ref('') /*
|--------------------------------------------------------------------------
| Gestion du popup
|--------------------------------------------------------------------------
*/ const showDecisionModal = ref(false)
const selectedDecision = ref('')
const decisionMotif = ref('') /*
|--------------------------------------------------------------------------
| Options de décision
|--------------------------------------------------------------------------
*/ const decisionOptions = [ { value: 'ADMIS', label: 'Admis', class: 'bg-[#00313C] hover:bg-[#E40046] text-white', }, { value: 'REFUSE', label: 'Refuser', class: 'bg-[#E40046] hover:bg-[#00313C] text-white', }, { value: 'EN_ATTENTE', label: 'Mettre en attente', class: 'border border-[#00313C] bg-white text-[#00313C] hover:bg-[#00313C] hover:text-white', }, /*
|--------------------------------------------------------------------------
| Vérifie si l'utilisateur peut décider
|--------------------------------------------------------------------------
*/ const canUseDecisionButtons = computed(() => { return Boolean(candidate.value?.canDecide)
}) /*
|--------------------------------------------------------------------------
| Vérifie si l'entretien courant est final
|--------------------------------------------------------------------------
|
| Le champ principal attendu est :
| candidate.interviewType
|
| Exemples :
|"final"
|"FINAL"
|
| Quelques variantes sont prévues pour éviter un blocage
| si ton backend utilise un nom légèrement différent.
|--------------------------------------------------------------------------
*/ const isFinalInterview = computed(() => { const type = candidate.value?.interviewType || candidate.value?.typeEntretien || candidate.value?.entretienType || candidate.value?.interview?.type || candidate.value?.interview?.interviewType || candidate.value?.entretien?.type return String(type || '').trim().toLowerCase() === 'final'
}) /*
|--------------------------------------------------------------------------
| Liste des décisions affichables
|--------------------------------------------------------------------------
|
|"Mettre en attente" est affiché uniquement pendant l'entretien final.
|--------------------------------------------------------------------------
*/ const visibleDecisionOptions = computed(() => { return decisionOptions.filter((option) => { if (option.value === 'EN_ATTENTE') { return isFinalInterview.value } return true })
}) /*
|--------------------------------------------------------------------------
| Formatage des scores
|--------------------------------------------------------------------------
*/ function formatScore(value) { if (value === null || value === undefined || value === '') { return '-' } const numericValue = Number(value) if (Number.isNaN(numericValue)) { return '-' } return numericValue.toFixed(2)
} /*
|--------------------------------------------------------------------------
| Libellé du statut
|--------------------------------------------------------------------------
*/ function statusLabel(value) { const labels = { completed: 'Terminé', progress: 'En cours', 'En-attente': 'En attente', 'en-attente': 'En attente', pending: 'En attente', } return labels[value] || value || 'Non renseigné'
} /*
|--------------------------------------------------------------------------
| Libellé de la décision
|--------------------------------------------------------------------------
*/ function decisionLabel(value) { const labels = { ADMIS: 'Admis', REFUSE: 'Refusé', EN_ATTENTE: 'En attente', } return labels[value] || 'Sans décision'
} /*
|--------------------------------------------------------------------------
| Libellé du type d'entretien
|--------------------------------------------------------------------------
*/ function interviewTypeLabel(value) { const normalized = String(value || '').trim().toLowerCase() const labels = { technique: 'Technique', motivation: 'Motivation', final: 'Final', } return labels[normalized] || value || 'Non renseigné'
} /*
|--------------------------------------------------------------------------
| Chargement du candidat
|--------------------------------------------------------------------------
*/ async function loadCandidate() { loading.value = true error.value = '' try { candidate.value = await fetchInterviewCandidateDetail( route.params.candidatureId ) } catch (err) { error.value = parseBackendError(err) } finally { loading.value = false }
} /*
|--------------------------------------------------------------------------
| Ouverture du popup
|--------------------------------------------------------------------------
*/ function openDecisionModal(decision) { /* * L'utilisateur doit avoir le droit de décider. */ if (!canUseDecisionButtons.value) { return } /* * Empêche un deuxième envoi pendant une sauvegarde. */ if (saving.value) { return } /* * Protection supplémentaire : * EN_ATTENTE est autorisé uniquement pour le final. */ if (decision === 'EN_ATTENTE' && !isFinalInterview.value) { error.value ="La mise en attente est disponible uniquement pour l'entretien final." return } /* * Prépare le popup. */ selectedDecision.value = decision decisionMotif.value = '' error.value = '' showDecisionModal.value = true
} /*
|--------------------------------------------------------------------------
| Fermeture du popup
|--------------------------------------------------------------------------
*/ function closeDecisionModal() { /* * Ne pas permettre de fermer pendant l'enregistrement * avec le bouton Annuler. */ if (saving.value) { return } showDecisionModal.value = false selectedDecision.value = '' decisionMotif.value = ''
} /*
|--------------------------------------------------------------------------
| Confirmation de la décision
|--------------------------------------------------------------------------
*/ async function confirmDecision() { /* * Vérification du choix */ if (!selectedDecision.value) { error.value = 'Veuillez sélectionner une décision.' return } /* * Vérification spéciale pour EN_ATTENTE */ if ( selectedDecision.value === 'EN_ATTENTE' && !isFinalInterview.value ) { error.value ="La mise en attente est disponible uniquement pour l'entretien final." return } /* * Vérification du motif */ const motif = decisionMotif.value.trim() if (!motif) { error.value = 'Veuillez renseigner le motif de la décision.' return } /* * Évite les doubles clics */ if (saving.value) { return } saving.value = selectedDecision.value error.value = '' try { /* * Envoi au backend */ await saveCandidatureDecision( candidate.value.candidatureId, { decision: selectedDecision.value, motif, } ) /* * Fermeture du popup */ showDecisionModal.value = false selectedDecision.value = '' decisionMotif.value = '' /* * Retour automatique à la page précédente */ router.back() } catch (err) { error.value = parseBackendError(err) } finally { saving.value = '' }
} /*
|--------------------------------------------------------------------------
| Chargement initial
|--------------------------------------------------------------------------
*/ onMounted(loadCandidate)
</script> <template> <DashboardLayout> <!-- ========================================================= HEADER ========================================================== --> <template #header> <button type="button" class="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#00313C] transition hover:border-[#00313C]" @click="router.back()" > <ArrowLeft class="h-4 w-4" /> Retour </button> <div> <h2 class="text-xl font-semibold text-gray-900"> Détail du candidat </h2> <p class="text-sm text-slate-500"> Moyennes d’entretien et décision pédagogique. </p> </div> </template> <!-- ========================================================= ERREUR ========================================================== --> <div v-if="error" class="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700" > {{ error }} </div> <!-- ========================================================= LOADING ========================================================== --> <div v-if="loading" class="flex h-56 items-center justify-center" > <Loader2 class="h-8 w-8 animate-spin text-[#00313C]" /> </div> <!-- ========================================================= CONTENU ========================================================== --> <template v-else-if="candidate"> <!-- ======================================================= INFORMATIONS CANDIDAT ======================================================== --> <section class="mb-6 rounded-xl border border-slate-100 bg-white p-6" > <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" > <div> <h1 class="text-2xl font-black text-[#00313C]"> {{ candidate.nom }} </h1> <p class="mt-1 text-sm text-slate-500"> {{ candidate.email }} </p> <p class="mt-1 text-sm text-slate-500"> {{ candidate.formation }} · {{ candidate.cohorte }} </p> <!-- Type de l'entretien --> <p class="mt-2 text-sm font-semibold text-[#00313C]"> Entretien : <span class="font-black"> {{ interviewTypeLabel( candidate.interviewType || candidate.typeEntretien || candidate.entretienType || candidate.interview?.type || candidate.interview?.interviewType || candidate.entretien?.type ) }} </span> </p> </div> <div class="rounded-xl bg-[#00313C] px-5 py-4 text-white" > <span class="text-xs font-bold uppercase text-white/60"> Moyenne générale </span> <strong class="mt-1 block text-3xl font-black" > {{ formatScore(candidate.moyenneGenerale) }}/10 </strong> </div> </div> </section> <!-- ======================================================= SCORES ======================================================== --> <section class="mb-6 grid gap-4 md:grid-cols-3" > <!-- Entretien technique --> <article class="score-card"> <span> Entretien technique </span> <strong> {{ formatScore(candidate.technique?.averageScore) }}/10 </strong> <small> {{ statusLabel(candidate.technique?.status) }} </small> </article> <!-- Entretien motivation --> <article class="score-card"> <span> Entretien motivation </span> <strong> {{ formatScore(candidate.motivation?.averageScore) }}/10 </strong> <small> {{ statusLabel(candidate.motivation?.status) }} </small> </article> <!-- Décision actuelle --> <article class="score-card"> <span> Décision actuelle </span> <strong class="text-xl"> {{ decisionLabel(candidate.decision?.type) }} </strong> <small> {{ candidate.decision?.motif || 'Aucun motif' }} </small> </article> </section> <!-- ======================================================= DECISION PEDAGOGIQUE ======================================================== --> <section class="rounded-xl border border-slate-100 bg-white p-6" > <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" > <div> <h3 class="text-lg font-black text-[#00313C]"> Décision pédagogique </h3> <p class="mt-1 text-sm text-slate-500"> Les décisions sont disponibles après validation des deux entretiens. </p> </div> <!-- Badge entretien final --> <span v-if="isFinalInterview" class="inline-flex w-fit rounded-full bg-[#64CCC9]/20 px-3 py-1 text-xs font-bold text-[#00313C]" > Entretien final </span> </div> <!-- ===================================================== BOUTONS DECISION ====================================================== --> <div class="mt-5 flex flex-wrap gap-3"> <button v-for="option in visibleDecisionOptions" :key="option.value" type="button" :disabled=" !canUseDecisionButtons || Boolean(saving)" class="rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500" :class="option.class" @click="openDecisionModal(option.value)" > <Loader2 v-if="saving === option.value" class="mr-2 inline h-4 w-4 animate-spin" /> {{ option.label }} </button> </div> <!-- ===================================================== MESSAGE SI DECISION INDISPONIBLE ====================================================== --> <p v-if="!canUseDecisionButtons" class="mt-3 text-sm font-medium text-amber-600" > La décision sera disponible après validation des deux entretiens. </p> <!-- ===================================================== INFO EN ATTENTE ====================================================== --> <p v-if="!isFinalInterview" class="mt-3 text-xs text-slate-400" > La mise en attente est réservée à l’entretien final. </p> </section> </template> <!-- ========================================================= MODAL DECISION ========================================================== --> <Teleport to="body"> <div v-if="showDecisionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" @click.self="closeDecisionModal" > <div class="w-full max-w-lg rounded-2xl bg-white p-6" > <!-- ================================================= HEADER MODAL ================================================== --> <div class="flex items-start justify-between gap-4" > <div> <h3 class="text-xl font-black text-[#00313C]" > Confirmer la décision </h3> <p class="mt-1 text-sm text-slate-500" > Veuillez renseigner le motif avant de confirmer. </p> </div> <button type="button" :disabled="Boolean(saving)" class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50" @click="closeDecisionModal" > <X class="h-5 w-5" /> </button> </div> <!-- ================================================= DECISION SELECTIONNEE ================================================== --> <div class="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4" > <span class="text-xs font-bold uppercase tracking-wide text-slate-500" > Décision sélectionnée </span> <p class="mt-1 text-lg font-black text-[#00313C]" > {{ decisionLabel(selectedDecision) }} </p> </div> <!-- ================================================= MOTIF ================================================== --> <div class="mt-5"> <label for="decision-motif" class="mb-2 block text-sm font-bold text-[#00313C]" > Motif de la décision <span class="text-[#E40046]">*</span> </label> <textarea id="decision-motif" v-model="decisionMotif" rows="5" maxlength="1000" placeholder="Expliquez le motif de cette décision..." class="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00313C] focus:ring-2 focus:ring-[#64CCC9]/30" ></textarea> <div class="mt-1 text-right text-xs text-slate-400" > {{ decisionMotif.length }}/1000 </div> </div> <!-- ================================================= ACTIONS ================================================== --> <div class="mt-6 flex justify-end gap-3" > <!-- Annuler --> <button type="button" :disabled="Boolean(saving)" class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" @click="closeDecisionModal" > Annuler </button> <!-- Confirmer --> <button type="button" :disabled=" Boolean(saving) || !decisionMotif.trim()" class="rounded-lg bg-[#00313C] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#E40046] disabled:cursor-not-allowed disabled:bg-slate-300" @click="confirmDecision" > <Loader2 v-if="saving === selectedDecision" class="mr-2 inline h-4 w-4 animate-spin" /> Confirmer </button> </div> </div> </div> </Teleport> </DashboardLayout>
</template> <style scoped>
.score-card { @apply rounded-xl border border-slate-100 bg-white p-5 ;
} .score-card span { @apply text-xs font-bold uppercase tracking-wide text-slate-500;
} .score-card strong { @apply mt-2 block text-3xl font-black text-[#00313C];
} .score-card small { @apply mt-1 block text-sm font-semibold text-slate-500;
}
</style>