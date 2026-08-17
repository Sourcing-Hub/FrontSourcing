<script setup>
//  Prépare un import groupé depuis une dépendance.
import {onMounted, ref} from 'vue'

//  Prépare un import groupé depuis une dépendance.
import {useRoute,useRouter,} from 'vue-router'

import CandidateInfoCard
  from '@/components/evaluator/CandidateInfoCard.vue'


//  Prépare un import groupé depuis une dépendance.
import {fetchCandidate,fetchMyInterviews,} from '@/services/evaluator'


const route = useRoute()
const router = useRouter()

const candidate = ref(null)
const interviews = ref([])

const loading = ref(true)
const error = ref('')

async function loadCandidate() {
  loading.value = true

  try {
    const [
      candidateData,
      interviewsData,
    ] = await Promise.all([
      fetchCandidate(
        route.params.candidateId,
      ),

      fetchMyInterviews(),
    ])

    candidate.value =
      candidateData

    interviews.value =
      interviewsData.filter(
        (item) =>
          item.candidateId ===
          route.params.candidateId,
      )
  } catch (err) {
    error.value =
      'Impossible de charger le candidat.'
  } finally {
    loading.value = false
  }
}

function startInterview(interview) {
  router.push({
    name: 'evaluator-conduct-interview',
    params: {
      interviewId: interview.id,
    },
  })
}

function goBack() {
  router.back()
}

onMounted(loadCandidate)
</script>

<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(100,204,201,0.14),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4fafa_100%)] px-5 py-20 lg:px-10 lg:py-10"
  >

    <!-- =====================================================
         RETOUR
         ===================================================== -->
    <button
      type="button"
      class="mb-6 inline-flex h-11 items-center rounded-2xl border border-[#64CCC9]/25 bg-white px-4 text-sm font-black text-[#00313C] shadow-lg shadow-[#00313C]/7 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E40046]/30 hover:bg-[#E40046] hover:text-white hover:shadow-xl hover:shadow-[#E40046]/10 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
      @click="goBack"
    >
      ← Mes candidats
    </button>


    <!-- =====================================================
         CHARGEMENT
         ===================================================== -->
    <div
      v-if="loading"
      class="rounded-3xl border border-[#64CCC9]/20 bg-white py-20 text-center text-sm font-bold text-[#00313C]/50 shadow-xl shadow-[#00313C]/10"
    >
      Chargement...
    </div>


    <!-- =====================================================
         ERREUR
         ===================================================== -->
    <div
      v-else-if="error"
      class="rounded-2xl border border-[#E40046]/20 bg-[#E40046]/5 p-4 text-sm font-bold text-[#E40046]"
    >
      {{ error }}
    </div>


    <template v-else-if="candidate">

      <!-- ===================================================
           EN-TÊTE
           =================================================== -->
      <header class="mb-6">

        <span
          class="inline-flex rounded-full bg-[#E40046]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20"
        >
          DOSSIER CANDIDAT
        </span>

        <h1
          class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl"
        >
          {{ candidate.firstName }}
          {{ candidate.lastName }}
        </h1>

      </header>


      <!-- ===================================================
           INFORMATIONS CANDIDAT
           =================================================== -->
      <CandidateInfoCard
        :candidate="candidate"
      />


      <!-- ===================================================
           ENTRETIENS
           =================================================== -->
      <section
        class="mt-6 rounded-[2rem] border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/7 backdrop-blur"
      >

        <!-- EN-TÊTE SECTION -->
        <div
          class="mb-3 flex items-center justify-between"
        >

          <div>
            <h2
              class="text-xl font-black text-[#00313C]"
            >
              Ses entretiens
            </h2>

            <p
              class="mt-1 text-sm font-semibold text-[#00313C]/50"
            >
              Historique des entretiens du candidat
            </p>
          </div>


          <!-- NOMBRE -->
          <span
            class="rounded-full bg-[#64CCC9]/15 px-3 py-1 text-sm font-black text-[#00313C]"
          >
            {{ interviews.length }}
          </span>

        </div>


        <!-- =================================================
             LISTE DES ENTRETIENS
             ================================================= -->
        <article
          v-for="interview in interviews"
          :key="interview.id"
          class="group flex flex-col gap-4 border-t border-[#64CCC9]/15 py-5 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between"
        >

          <!-- INFORMATIONS -->
          <div class="min-w-0">

            <strong
              class="text-sm font-black text-[#00313C]"
            >
              {{ interview.typeLabel }}
            </strong>

            <p
              class="mt-1 text-sm font-semibold text-[#00313C]/55"
            >
              {{ interview.date }}

              <span class="mx-1 text-[#64CCC9]">
                ·
              </span>

              {{ interview.startTime }}

              <span class="mx-1 text-[#64CCC9]">
                -
              </span>

              {{ interview.endTime }}
            </p>

          </div>


          <!-- =================================================
               BOUTON RÉALISER
               ================================================= -->
          <button
            type="button"
            class="h-11 shrink-0 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white shadow-lg shadow-[#00313C]/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E40046] hover:shadow-xl hover:shadow-[#E40046]/10 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
            @click="startInterview(interview)"
          >
            Réaliser l'entretien

            <span
              class="ml-1 text-[#64CCC9]"
            >
              →
            </span>
          </button>

        </article>


        <!-- =================================================
             AUCUN ENTRETIEN
             ================================================= -->
        <div
          v-if="!interviews.length"
          class="mt-4 rounded-3xl border border-dashed border-[#64CCC9]/30 bg-[#64CCC9]/5 px-5 py-12 text-center"
        >

          <p
            class="text-sm font-bold text-[#00313C]/50"
          >
            Aucun entretien prévu pour ce candidat.
          </p>

        </div>

      </section>

    </template>

  </main>
</template>