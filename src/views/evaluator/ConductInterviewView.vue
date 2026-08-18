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

//  Prépare un import groupé depuis une dépendance.
import {
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchInterview,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  fetchCandidate,
//  Ferme la liste d'import et précise le module source.
} from '@/services/evaluator'

//  Déclare route pour stocker une donnée ou un calcul de la vue.
const route = useRoute()
//  Déclare router pour stocker une donnée ou un calcul de la vue.
const router = useRouter()

//  Déclare interview pour stocker une donnée ou un calcul de la vue.
const interview = ref(null)
//  Déclare candidate pour stocker une donnée ou un calcul de la vue.
const candidate = ref(null)

//  Déclare loading pour stocker une donnée ou un calcul de la vue.
const loading = ref(true)
//  Déclare error pour stocker une donnée ou un calcul de la vue.
const error = ref('')

//  Déclare la fonction loadData pour isoler un traitement évaluateur.
async function loadData() {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  loading.value = true

  //  Démarre un bloc qui tente une action pouvant échouer.
  try {
    //  Déclare interviewData pour stocker une donnée ou un calcul de la vue.
    const interviewData =
      //  Attend la réponse d'une action asynchrone avant de continuer.
      await fetchInterview(
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        route.params.interviewId,
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      )

    //  Déclare candidateData pour stocker une donnée ou un calcul de la vue.
    const candidateData =
      //  Attend la réponse d'une action asynchrone avant de continuer.
      await fetchCandidate(
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        interviewData.candidateId,
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      )

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    interview.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      interviewData

    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    candidate.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      candidateData
  //  Gère l'erreur si le traitement précédent échoue.
  } catch {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    error.value =
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      'Impossible de charger l’entretien.'
  //  Exécute ce bloc dans tous les cas après l'action.
  } finally {
    //  Met à jour ou lit la valeur réactive utilisée par Vue.
    loading.value = false
  //  Ferme le bloc de configuration ou de traitement.
  }
//  Ferme le bloc de configuration ou de traitement.
}

//  Déclare la fonction startEvaluation pour isoler un traitement évaluateur.
function startEvaluation() {
  //  Redirige l'utilisateur vers la page evaluator correspondante.
  router.push({
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    name: 'evaluator-evaluation',
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    params: {
      //  Exécute cette ligne de logique propre à la partie évaluateur.
      interviewId:
        //  Ajoute cette valeur à la structure ou à la liste en cours.
        route.params.interviewId,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    },
  //  Ferme le bloc de configuration ou de traitement.
  })
//  Ferme le bloc de configuration ou de traitement.
}

//  Lance ce traitement au montage du composant.
onMounted(loadData)
</script>

<template>
  <!--  Définit le conteneur principal de la page évaluateur. -->
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(100,204,201,0.14),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4fafa_100%)] px-5 py-20 lg:px-10 lg:py-10"
  >

    <!-- =====================================================
         CHARGEMENT
         ===================================================== -->
    <!--  Structure un groupe d’éléments visuels. -->
    <div
      v-if="loading"
      class="rounded-3xl border border-[#64CCC9]/20 bg-white py-20 text-center text-sm font-bold text-[#00313C]/50"
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


    <template v-else>

      <!-- ===================================================
           EN-TÊTE
           =================================================== -->
      <!--  Regroupe le titre et les informations d’introduction. -->
      <header class="mb-7">

        <!--  Affiche une information courte ou décorative. -->
        <span
          class="inline-flex rounded-full bg-[#E40046]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20"
        >
          <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
          ENTRETIEN
        <!--  Ferme l’élément span. -->
        </span>

        <!--  Affiche le titre principal de la page. -->
        <h1
          class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ interview.typeLabel }}
        <!--  Ferme l’élément h1. -->
        </h1>

        <!--  Affiche un paragraphe de texte. -->
        <p
          class="mt-3 text-base font-semibold text-[#00313C]/60"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ candidate.firstName }}
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ candidate.lastName }}
        <!--  Ferme l’élément p. -->
        </p>

      <!--  Ferme l’élément header. -->
      </header>


      <!-- ===================================================
           INFORMATIONS ENTRETIEN
           =================================================== -->
      <!--  Délimite une zone fonctionnelle de la page. -->
      <section class="mb-6 grid gap-4 md:grid-cols-3">

        <!-- DATE -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="rounded-3xl border border-[#64CCC9]/20 bg-white p-5"
        >
          <!--  Affiche une information courte ou décorative. -->
          <span
            class="block text-xs font-black uppercase tracking-wide text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Date
          <!--  Ferme l’élément span. -->
          </span>

          <!--  Met en avant une valeur importante. -->
          <strong
            class="mt-2 block text-base font-black text-[#00313C]"
          >
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interview.date }}
          <!--  Ferme l’élément strong. -->
          </strong>
        <!--  Ferme l’élément div. -->
        </div>


        <!-- HORAIRE -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white"
        >
          <!--  Affiche une information courte ou décorative. -->
          <span
            class="block text-xs font-black uppercase tracking-wide text-[#64CCC9]"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Horaire
          <!--  Ferme l’élément span. -->
          </span>

          <!--  Met en avant une valeur importante. -->
          <strong
            class="mt-2 block text-base font-black text-white"
          >
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interview.startTime }}
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            -
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interview.endTime }}
          <!--  Ferme l’élément strong. -->
          </strong>
        <!--  Ferme l’élément div. -->
        </div>


        <!-- LIEU -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="rounded-3xl border border-[#64CCC9]/20 bg-white p-5"
        >
          <!--  Affiche une information courte ou décorative. -->
          <span
            class="block text-xs font-black uppercase tracking-wide text-[#00313C]/50"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Lieu
          <!--  Ferme l’élément span. -->
          </span>

          <!--  Met en avant une valeur importante. -->
          <strong
            class="mt-2 block text-base font-black text-[#00313C]"
          >
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interview.location }}
          <!--  Ferme l’élément strong. -->
          </strong>
        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément section. -->
      </section>


      <!-- ===================================================
           CONTENU PRINCIPAL
           =================================================== -->
      <!--  Délimite une zone fonctionnelle de la page. -->
      <section
        class="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]"
      >

        <!-- =================================================
             PROFIL CANDIDAT
             ================================================= -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="self-start overflow-hidden rounded-[2rem] border border-[#64CCC9]/20 bg-white"
        >

          <!-- HEADER PROFIL ROUGE -->
          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="bg-[#E40046] p-6 text-center text-white"
          >

            <!-- Avatar -->
            <!--  Structure un groupe d’éléments visuels. -->
            <div
              class="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-white text-3xl font-black text-[#E40046]"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{
                candidate.firstName
                  ?.charAt(0)
                  ?.toUpperCase()
              }}
            <!--  Ferme l’élément div. -->
            </div>


            <!-- Nom -->
            <!--  Affiche un titre de section. -->
            <h2
              class="mt-4 text-lg font-black text-white"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ candidate.firstName }}
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ candidate.lastName }}
            <!--  Ferme l’élément h2. -->
            </h2>


            <!-- Email -->
            <!--  Affiche un paragraphe de texte. -->
            <p
              class="mt-1 truncate text-sm font-semibold text-white/75"
            >
              <!--  Affiche une donnée dynamique dans l’interface. -->
              {{ candidate.email }}
            <!--  Ferme l’élément p. -->
            </p>

          <!--  Ferme l’élément div. -->
          </div>


          <!-- BOUTON CV ROUGE -->
          <!--  Affiche un bouton d’action pour l’utilisateur. -->
          <button
            type="button"
            class="m-5 h-12 w-[calc(100%-2.5rem)] rounded-2xl bg-[#E40046] text-sm font-black text-white transition-all duration-200 hover:bg-[#00313C] focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Consulter le CV
          <!--  Ferme l’élément button. -->
          </button>

        <!--  Ferme l’élément div. -->
        </div>


        <!-- =================================================
             ZONE ÉVALUATION
             ================================================= -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="flex min-h-[360px] flex-col justify-center rounded-[2rem] border border-[#64CCC9]/20 bg-white p-6"
        >

          <!-- MESSAGE -->
          <!--  Structure un groupe d’éléments visuels. -->
          <div
            class="rounded-3xl bg-[#64CCC9]/10 p-6 ring-1 ring-[#64CCC9]/20"
          >

            <!--  Met en avant une valeur importante. -->
            <strong
              class="text-xl font-black text-[#00313C]"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              Préparez votre entretien
            <!--  Ferme l’élément strong. -->
            </strong>

            <!--  Affiche un paragraphe de texte. -->
            <p
              class="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#00313C]/65"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              Posez les questions prévues et
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              notez vos observations avant
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              de compléter l'évaluation.
            <!--  Ferme l’élément p. -->
            </p>

          <!--  Ferme l’élément div. -->
          </div>


          <!-- =================================================
               BOUTON COMMENCER
               ================================================= -->
          <!--  Affiche un bouton d’action pour l’utilisateur. -->
          <button
            type="button"
            class="mt-5 inline-flex h-12 w-fit items-center justify-center rounded-2xl bg-[#00313C] px-6 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E40046] focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
            @click="startEvaluation"
          >
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            Commencer l'évaluation

            <!--  Affiche une information courte ou décorative. -->
            <span
              class="ml-2 text-[#64CCC9]"
            >
              <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
              →
            <!--  Ferme l’élément span. -->
            </span>
          <!--  Ferme l’élément button. -->
          </button>

        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément section. -->
      </section>

    </template>

  </main>
</template>