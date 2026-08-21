<script setup>
// Prépare un import groupé depuis une dépendance.
import { // Ajoute cette valeur à la structure ou à la liste en cours. computed, // Ajoute cette valeur à la structure ou à la liste en cours. onMounted, // Ajoute cette valeur à la structure ou à la liste en cours. ref,
// Ferme la liste d'import et précise le module source.
} from 'vue' // Prépare un import groupé depuis une dépendance.
import { // Ajoute cette valeur à la structure ou à la liste en cours. useRoute, // Ajoute cette valeur à la structure ou à la liste en cours. useRouter,
// Ferme la liste d'import et précise le module source.
} from 'vue-router' // Importe EvaluationSummary utilisé dans la partie évaluateur.
import EvaluationSummary from '@/components/evaluator/EvaluationSummary.vue' // Prépare un import groupé depuis une dépendance.
import { // Ajoute cette valeur à la structure ou à la liste en cours. fetchInterview, // Ajoute cette valeur à la structure ou à la liste en cours. fetchCandidate, // Ajoute cette valeur à la structure ou à la liste en cours. fetchEvaluation, // Ajoute cette valeur à la structure ou à la liste en cours. validateEvaluation,
// Ferme la liste d'import et précise le module source.
} from '@/services/evaluator' // Déclare route pour stocker une donnée ou un calcul de la vue.
const route = useRoute()
// Déclare router pour stocker une donnée ou un calcul de la vue.
const router = useRouter() // Déclare interview pour stocker une donnée ou un calcul de la vue.
const interview = ref(null)
// Déclare candidate pour stocker une donnée ou un calcul de la vue.
const candidate = ref(null)
// Déclare evaluation pour stocker une donnée ou un calcul de la vue.
const evaluation = ref(null) // Déclare loading pour stocker une donnée ou un calcul de la vue.
const loading = ref(true)
// Déclare validating pour stocker une donnée ou un calcul de la vue.
const validating = ref(false)
// Déclare error pour stocker une donnée ou un calcul de la vue.
const error = ref('') // Déclare isValidated pour stocker une donnée ou un calcul de la vue.
const isValidated = computed( // Ajoute cette valeur à la structure ou à la liste en cours. () => evaluation.value?.validated,
// Exécute cette ligne de logique propre à la partie évaluateur.
) // Déclare la fonction loadData pour isoler un traitement évaluateur.
async function loadData() { // Met à jour ou lit la valeur réactive utilisée par Vue. loading.value = true // Démarre un bloc qui tente une action pouvant échouer. try { // Déclare interviewData pour stocker une donnée ou un calcul de la vue. const interviewData = // Attend la réponse d'une action asynchrone avant de continuer. await fetchInterview( // Ajoute cette valeur à la structure ou à la liste en cours. route.params.interviewId, // Exécute cette ligne de logique propre à la partie évaluateur. ) // Exécute cette ligne de logique propre à la partie évaluateur. const [ // Ajoute cette valeur à la structure ou à la liste en cours. candidateData, // Ajoute cette valeur à la structure ou à la liste en cours. evaluationData, // Attend la réponse d'une action asynchrone avant de continuer. = await Promise.all([ // Exécute cette ligne de logique propre à la partie évaluateur. fetchCandidate( // Ajoute cette valeur à la structure ou à la liste en cours. interviewData.candidateId, // Ajoute cette valeur à la structure ou à la liste en cours. ), // Exécute cette ligne de logique propre à la partie évaluateur. fetchEvaluation( // Ajoute cette valeur à la structure ou à la liste en cours. route.params.interviewId, // Ajoute cette valeur à la structure ou à la liste en cours. ), // Exécute cette ligne de logique propre à la partie évaluateur. ]) // Met à jour ou lit la valeur réactive utilisée par Vue. interview.value = // Exécute cette ligne de logique propre à la partie évaluateur. interviewData // Met à jour ou lit la valeur réactive utilisée par Vue. candidate.value = // Exécute cette ligne de logique propre à la partie évaluateur. candidateData // Met à jour ou lit la valeur réactive utilisée par Vue. evaluation.value = // Exécute cette ligne de logique propre à la partie évaluateur. evaluationData // Gère l'erreur si le traitement précédent échoue. } catch { // Met à jour ou lit la valeur réactive utilisée par Vue. error.value = // Exécute cette ligne de logique propre à la partie évaluateur. 'Impossible de charger les données.' // Exécute ce bloc dans tous les cas après l'action. } finally { // Met à jour ou lit la valeur réactive utilisée par Vue. loading.value = false // Ferme le bloc de configuration ou de traitement. }
// Ferme le bloc de configuration ou de traitement.
} // Déclare la fonction validate pour isoler un traitement évaluateur.
async function validate() { // Met à jour ou lit la valeur réactive utilisée par Vue. validating.value = true // Met à jour ou lit la valeur réactive utilisée par Vue. error.value = '' // Démarre un bloc qui tente une action pouvant échouer. try { // Déclare response pour stocker une donnée ou un calcul de la vue. const response = // Attend la réponse d'une action asynchrone avant de continuer. await validateEvaluation( // Ajoute cette valeur à la structure ou à la liste en cours. route.params.interviewId, // Exécute cette ligne de logique propre à la partie évaluateur. ) // Met à jour ou lit la valeur réactive utilisée par Vue. evaluation.value = // Exécute cette ligne de logique propre à la partie évaluateur. response.evaluation // Redirige l'utilisateur vers la page evaluator correspondante. router.push({ // Ajoute cette valeur à la structure ou à la liste en cours. name: 'evaluator-interviews', // Ferme le bloc de configuration ou de traitement. }) // Gère l'erreur si le traitement précédent échoue. } catch { // Met à jour ou lit la valeur réactive utilisée par Vue. error.value = // Exécute cette ligne de logique propre à la partie évaluateur. 'Impossible de valider l’évaluation.' // Exécute ce bloc dans tous les cas après l'action. } finally { // Met à jour ou lit la valeur réactive utilisée par Vue. validating.value = false // Ferme le bloc de configuration ou de traitement. }
// Ferme le bloc de configuration ou de traitement.
} // Déclare la fonction editEvaluation pour isoler un traitement évaluateur.
function editEvaluation() { // Redirige l'utilisateur vers la page evaluator correspondante. router.push({ // Ajoute cette valeur à la structure ou à la liste en cours. name: 'evaluator-evaluation', // Exécute cette ligne de logique propre à la partie évaluateur. params: { // Exécute cette ligne de logique propre à la partie évaluateur. interviewId: // Ajoute cette valeur à la structure ou à la liste en cours. route.params.interviewId, // Ajoute cette valeur à la structure ou à la liste en cours. }, // Ferme le bloc de configuration ou de traitement. })
// Ferme le bloc de configuration ou de traitement.
} // Lance ce traitement au montage du composant.
onMounted(loadData)
</script> <template> <!-- Définit le conteneur principal de la page évaluateur. --> <main class="page"> <!-- Structure un groupe d’éléments visuels. --> <div v-if="loading" class="loading" > <!-- Affiche ce contenu textuel dans la vue évaluateur. --> Chargement... <!-- Ferme l’élément div. --> </div> <div v-else-if="error" class="error" > <!-- Affiche une donnée dynamique dans l’interface. --> {{ error }} <!-- Ferme l’élément div. --> </div> <template v-else> <!-- Regroupe le titre et les informations d’introduction. --> <header class="header"> <!-- Structure un groupe d’éléments visuels. --> <div> <!-- Affiche une information courte ou décorative. --> <span class="eyebrow"> <!-- Affiche ce contenu textuel dans la vue évaluateur. --> VALIDATION <!-- Ferme l’élément span. --> </span> <!-- Affiche le titre principal de la page. --> <h1> <!-- Affiche ce contenu textuel dans la vue évaluateur. --> Vérifier l'évaluation <!-- Ferme l’élément h1. --> </h1> <!-- Affiche un paragraphe de texte. --> <p> <!-- Affiche une donnée dynamique dans l’interface. --> {{ candidate.firstName }} <!-- Affiche une donnée dynamique dans l’interface. --> {{ candidate.lastName }} <!-- Ferme l’élément p. --> </p> <!-- Ferme l’élément div. --> </div> <!-- Ferme l’élément header. --> </header> <!-- Délimite une zone fonctionnelle de la page. --> <section class="validation-layout"> <!-- Structure un groupe d’éléments visuels. --> <div class="card"> <!-- Structure un groupe d’éléments visuels. --> <div class="check"> <!-- Affiche une information courte ou décorative. --> <span class="icon"> <!-- Affiche ce contenu textuel dans la vue évaluateur. --> ✓ <!-- Ferme l’élément span. --> </span> <!-- Structure un groupe d’éléments visuels. --> <div> <!-- Met en avant une valeur importante. --> <strong> <!-- Affiche ce contenu textuel dans la vue évaluateur. --> Évaluation complétée <!-- Ferme l’élément strong. --> </strong> <!-- Affiche un paragraphe de texte. --> <p> <!-- Affiche ce contenu textuel dans la vue évaluateur. --> Vérifiez les informations avant <!-- Affiche ce contenu textuel dans la vue évaluateur. --> de valider définitivement. <!-- Ferme l’élément p. --> </p> <!-- Ferme l’élément div. --> </div> <!-- Ferme l’élément div. --> </div> <!-- Affiche ou configure l’élément EvaluationSummary. --> <EvaluationSummary :evaluation="evaluation" /> <!-- Ferme l’élément div. --> </div> <!-- Affiche ou configure l’élément aside. --> <aside class="actions"> <!-- Affiche un bouton d’action pour l’utilisateur. --> <button type="button" class="secondary" @click="editEvaluation" > <!-- Affiche ce contenu textuel dans la vue évaluateur. --> Modifier l'évaluation <!-- Ferme l’élément button. --> </button> <!-- Affiche un bouton d’action pour l’utilisateur. --> <button type="button" class="primary" :disabled=" validating || isValidated" @click="validate" > <!-- Affiche une donnée dynamique dans l’interface. --> {{ isValidated ? 'Évaluation validée' : validating ? 'Validation...' : 'Valider l’évaluation' }} <!-- Ferme l’élément button. --> </button> <!-- Ferme l’élément aside. --> </aside> <!-- Ferme l’élément section. --> </section> </template> </main>
</template> <style scoped>
/* Ouvre un sélecteur CSS à styliser. */
.page { min-height: 100vh; padding: 36px 42px; background: #f6f8fb;
} .header { margin-bottom: 25px;
} .eyebrow { color: #6372be; font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
} h1 { margin: 8px 0 0; color: #172033; font-size: 28px;
} .header p { margin: 7px 0 0; color: #7d8797; font-size: 11px;
} .validation-layout { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 18px;
} .card,
.actions { padding: 22px; border: 1px solid #e7ebf0; border-radius: 16px; background: #fff;
} .check { display: flex; align-items: center; gap: 13px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #edf0f4;
} .icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; background: #eaf8f0; color: #00313C; font-weight: 800;
} .check strong { color: #00313C; font-size: 12px;
} .check p { margin: 5px 0 0; color: #00313C; font-size: 9px;
} .actions { align-self: start; display: flex; flex-direction: column; gap: 10px;
} .actions button { height: 42px; border-radius: 9px; font-size: 10px; font-weight: 700; cursor: pointer;
} .secondary { border: 1px solid #00313C; background: white; color: #00313C;
} .primary { border: 0; background: #00313C; color: white;
} .primary:disabled { opacity: 0.55; cursor: not-allowed;
} .loading,
.error { padding: 60px; text-align: center;
} .error { color: #a64d4d;
} @media (max-width: 800px) { .page { padding: 25px 18px; } .validation-layout { grid-template-columns: 1fr; }
}
</style>