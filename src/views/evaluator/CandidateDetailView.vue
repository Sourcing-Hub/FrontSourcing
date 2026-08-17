<script setup>
//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  onMounted,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  ref,
//  Ferme la liste d'import et précise le module source.
} from 'vue'

//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  useRoute,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  useRouter,
//  Ferme la liste d'import et précise le module source.
} from 'vue-router'

//  Importe CandidateInfoCard utilisé dans la partie évaluateur.
import CandidateInfoCard from '@/components/evaluator/CandidatInfoCard.vue'

//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchCandidate,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchMyInterviews,
//  Ferme la liste d'import et précise le module source.
} from '@/services/evaluator'

//  Déclare route pour stocker une donnée ou un calcul de la vue.
const route = useRoute()
//  Déclare router pour stocker une donnée ou un calcul de la vue.
const router = useRouter()

//  Déclare candidate pour stocker une donnée ou un calcul de la vue.
const candidate = ref(null)
//  Déclare interviews pour stocker une donnée ou un calcul de la vue.
const interviews = ref([])

//  Déclare loading pour stocker une donnée ou un calcul de la vue.
const loading = ref(true)
//  Déclare error pour stocker une donnée ou un calcul de la vue.
const error = ref('')

//  Déclare la fonction loadCandidate pour isoler un traitement évaluateur.
async function loadCandidate() {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  loading.value = true

  //  Démarre un bloc qui tente une action pouvant échouer.
  try {
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    const [
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      candidateData,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      interviewsData,
    //  Attend la réponse d'une action asynchrone avant de continuer.
    ] = await Promise.all([
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      fetchCandidate(
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        route.params.candidateId,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      ),

      //  Ajoute cette valeur à la structure ou à la liste en cours.
      fetchMyInterviews(),
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ])

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    candidate.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      candidateData

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    interviews.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      interviewsData.filter(
        //  Exécute cette ligne de logique propre à la partie évaluateur.
        (item) =>
          //  Exécute cette ligne de logique propre à la partie évaluateur.
          item.candidateId ===
          //  Ajoute cette valeur à la structure ou à la liste en cours.
          route.params.candidateId,
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      )
  //  Gère l'erreur si le traitement précédent échoue.
  } catch {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    error.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      'Impossible de charger le candidat.'
  //  Exécute ce bloc dans tous les cas après l'action.
  } finally {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    loading.value = false
  //  Ferme le bloc de configuration ou de traitement.
  }
//  Ferme le bloc de configuration ou de traitement.
}

//  Déclare la fonction startInterview pour isoler un traitement évaluateur.
function startInterview(interview) {
  //  Redirige l'utilisateur vers la page evaluator correspondante.
  router.push({
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    name: 'evaluator-conduct-interview',
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    params: {
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      interviewId: interview.id,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    },
  //  Ferme le bloc de configuration ou de traitement.
  })
//  Ferme le bloc de configuration ou de traitement.
}

//  Déclare la fonction goBack pour isoler un traitement évaluateur.
function goBack() {
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  router.back()
//  Ferme le bloc de configuration ou de traitement.
}

//  Lance ce traitement au montage du composant.
onMounted(loadCandidate)
</script>

<template>
  <!--  Définit le conteneur principal de la page évaluateur. -->
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(100,204,201,0.14),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4fafa_100%)] px-5 py-20 lg:px-10 lg:py-10"
  >

    <!-- =====================================================
         RETOUR
         ===================================================== -->
    <!--  Affiche un bouton d’action pour l’utilisateur. -->
    <button
      type="button"
      class="mb-6 inline-flex h-11 items-center rounded-2xl border border-[#64CCC9]/25 bg-white px-4 text-sm font-black text-[#00313C] shadow-lg shadow-[#00313C]/7 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E40046]/30 hover:bg-[#E40046] hover:text-white hover:shadow-xl hover:shadow-[#E40046]/10 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
      @click="goBack"
    >
      <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
      ← Mes candidats
    <!--  Ferme l’élément button. -->
    </button>


    <!-- =====================================================
         CHARGEMENT
         ===================================================== -->
    <!--  Structure un groupe d’éléments visuels. -->
    <div
      v-if="loading"
      class="rounded-3xl border border-[#64CCC9]/20 bg-white py-20 text-center text-sm font-bold text-[#00313C]/50 shadow-xl shadow-[#00313C]/10"
    >
      <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
      Chargement...
    <!--  Ferme l’élément div. -->
    </div>


    <!-- =====================================================
         ERREUR
         ===================================================== -->
    <div
      v-else-if="error"
      class="rounded-2xl border border-[#E40046]/20 bg-[#E40046]/5 p-4 text-sm font-bold text-[#E40046]"
    >
      <!--  Affiche une donnée dynamique dans l’interface. -->
      {{ error }}
    <!--  Ferme l’élément div. -->
    </div>


    <template v-else-if="candidate">

      <!-- ===================================================
           EN-TÊTE
           =================================================== -->
      <!--  Regroupe le titre et les informations d’introduction. -->
      <header class="mb-6">

        <!--  Affiche une information courte ou décorative. -->
        <span
          class="inline-flex rounded-full bg-[#E40046]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          DOSSIER CANDIDAT
        <!--  Ferme l’élément span. -->
        </span>

        <!--  Affiche le titre principal de la page. -->
        <h1
          class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ candidate.firstName }}
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ candidate.lastName }}
        <!--  Ferme l’élément h1. -->
        </h1>

      <!--  Ferme l’élément header. -->
      </header>


      <!-- ===================================================
           INFORMATIONS CANDIDAT
           =================================================== -->
      <!--  Affiche ou configure l’élément CandidateInfoCard. -->
      <CandidateInfoCard
        :candidate="candidate"
      />


      <!-- ===================================================
           ENTRETIENS
           =================================================== -->
      <!--  Délimite une zone fonctionnelle de la page. -->
      <section
        class="mt-6 rounded-[2rem] border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/7 backdrop-blur"
      >

        <!-- EN-TÊTE SECTION -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="mb-3 flex items-center justify-between"
        >

          <!--  Structure un groupe d’éléments visuels. -->
          <div>
            <!--  Affiche un titre de section. -->
            <h2
              class="text-xl font-black text-[#00313C]"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              Ses entretiens
            <!--  Ferme l’élément h2. -->
            </h2>

            <!--  Affiche un paragraphe de texte. -->
            <p
              class="mt-1 text-sm font-semibold text-[#00313C]/50"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              Historique des entretiens du candidat
            <!--  Ferme l’élément p. -->
            </p>
          <!--  Ferme l’élément div. -->
          </div>


          <!-- NOMBRE -->
          <!--  Affiche une information courte ou décorative. -->
          <span
            class="rounded-full bg-[#64CCC9]/15 px-3 py-1 text-sm font-black text-[#00313C]"
          >
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interviews.length }}
          <!--  Ferme l’élément span. -->
          </span>

        <!--  Ferme l’élément div. -->
        </div>


        <!-- =================================================
             LISTE DES ENTRETIENS
             ================================================= -->
        <!--  Affiche une carte ou un bloc de contenu autonome. -->
        <article
          v-for="interview in interviews"
          :key="interview.id"
          class="group flex flex-col gap-4 border-t border-[#64CCC9]/15 py-5 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between"
        >

          <!-- INFORMATIONS -->
          <!--  Structure un groupe d’éléments visuels. -->
          <div class="min-w-0">

            <!--  Met en avant une valeur importante. -->
            <strong
              class="text-sm font-black text-[#00313C]"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ interview.typeLabel }}
            <!--  Ferme l’élément strong. -->
            </strong>

            <!--  Affiche un paragraphe de texte. -->
            <p
              class="mt-1 text-sm font-semibold text-[#00313C]/55"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ interview.date }}

              <!--  Affiche une information courte ou décorative. -->
              <span class="mx-1 text-[#64CCC9]">
                <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
                ·
              <!--  Ferme l’élément span. -->
              </span>

              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ interview.startTime }}

              <!--  Affiche une information courte ou décorative. -->
              <span class="mx-1 text-[#64CCC9]">
                <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
                -
              <!--  Ferme l’élément span. -->
              </span>

              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ interview.endTime }}
            <!--  Ferme l’élément p. -->
            </p>

          <!--  Ferme l’élément div. -->
          </div>


          <!-- =================================================
               BOUTON RÉALISER
               ================================================= -->
          <!--  Affiche un bouton d’action pour l’utilisateur. -->
          <button
            type="button"
            class="h-11 shrink-0 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white shadow-lg shadow-[#00313C]/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E40046] hover:shadow-xl hover:shadow-[#E40046]/10 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
            @click="startInterview(interview)"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Réaliser l'entretien

            <!--  Affiche une information courte ou décorative. -->
            <span
              class="ml-1 text-[#64CCC9]"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              →
            <!--  Ferme l’élément span. -->
            </span>
          <!--  Ferme l’élément button. -->
          </button>

        <!--  Ferme l’élément article. -->
        </article>


        <!-- =================================================
             AUCUN ENTRETIEN
             ================================================= -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          v-if="!interviews.length"
          class="mt-4 rounded-3xl border border-dashed border-[#64CCC9]/30 bg-[#64CCC9]/5 px-5 py-12 text-center"
        >

          <!--  Affiche un paragraphe de texte. -->
          <p
            class="text-sm font-bold text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Aucun entretien prévu pour ce candidat.
          <!--  Ferme l’élément p. -->
          </p>

        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément section. -->
      </section>

    </template>

  </main>
</template>