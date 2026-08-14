<script setup>
import {
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  fetchInterview,
  fetchCandidate,
} from '@/api/evaluator'

const route = useRoute()
const router = useRouter()

const interview = ref(null)
const candidate = ref(null)

const loading = ref(true)
const error = ref('')

async function loadData() {
  loading.value = true

  try {
    const interviewData =
      await fetchInterview(
        route.params.interviewId,
      )

    const candidateData =
      await fetchCandidate(
        interviewData.candidateId,
      )

    interview.value =
      interviewData

    candidate.value =
      candidateData
  } catch (err) {
    error.value =
      'Impossible de charger l’entretien.'
  } finally {
    loading.value = false
  }
}

function startEvaluation() {
  router.push({
    name: 'evaluator-evaluation',
    params: {
      interviewId:
        route.params.interviewId,
    },
  })
}

onMounted(loadData)
</script>

<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(100,204,201,0.14),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4fafa_100%)] px-5 py-20 lg:px-10 lg:py-10"
  >

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


    <template v-else>

      <!-- ===================================================
           EN-TÊTE
           =================================================== -->
      <header class="mb-7">

        <span
          class="inline-flex rounded-full bg-[#E40046]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#E40046] ring-1 ring-[#E40046]/20"
        >
          ENTRETIEN
        </span>

        <h1
          class="mt-5 text-4xl font-black tracking-tight text-[#00313C] lg:text-5xl"
        >
          {{ interview.typeLabel }}
        </h1>

        <p
          class="mt-3 text-base font-semibold text-[#00313C]/60"
        >
          {{ candidate.firstName }}
          {{ candidate.lastName }}
        </p>

      </header>


      <!-- ===================================================
           INFORMATIONS ENTRETIEN
           =================================================== -->
      <section class="mb-6 grid gap-4 md:grid-cols-3">

        <!-- DATE -->
        <div
          class="rounded-3xl border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/10"
        >
          <span
            class="block text-xs font-black uppercase tracking-wide text-[#00313C]/50"
          >
            Date
          </span>

          <strong
            class="mt-2 block text-base font-black text-[#00313C]"
          >
            {{ interview.date }}
          </strong>
        </div>


        <!-- HORAIRE -->
        <div
          class="rounded-3xl border border-[#00313C] bg-[#00313C] p-5 text-white shadow-xl shadow-[#00313C]/20"
        >
          <span
            class="block text-xs font-black uppercase tracking-wide text-[#64CCC9]"
          >
            Horaire
          </span>

          <strong
            class="mt-2 block text-base font-black text-white"
          >
            {{ interview.startTime }}
            -
            {{ interview.endTime }}
          </strong>
        </div>


        <!-- LIEU -->
        <div
          class="rounded-3xl border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/10"
        >
          <span
            class="block text-xs font-black uppercase tracking-wide text-[#00313C]/50"
          >
            Lieu
          </span>

          <strong
            class="mt-2 block text-base font-black text-[#00313C]"
          >
            {{ interview.location }}
          </strong>
        </div>

      </section>


      <!-- ===================================================
           CONTENU PRINCIPAL
           =================================================== -->
      <section
        class="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]"
      >

        <!-- =================================================
             PROFIL CANDIDAT
             ================================================= -->
        <div
          class="self-start overflow-hidden rounded-[2rem] border border-[#64CCC9]/20 bg-white shadow-xl shadow-[#00313C]/10"
        >

          <!-- HEADER PROFIL ROUGE -->
          <div
            class="bg-[#E40046] p-6 text-center text-white"
          >

            <!-- Avatar -->
            <div
              class="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-white text-3xl font-black text-[#E40046] shadow-xl shadow-[#00313C]/20"
            >
              {{
                candidate.firstName
                  ?.charAt(0)
                  ?.toUpperCase()
              }}
            </div>


            <!-- Nom -->
            <h2
              class="mt-4 text-lg font-black text-white"
            >
              {{ candidate.firstName }}
              {{ candidate.lastName }}
            </h2>


            <!-- Email -->
            <p
              class="mt-1 truncate text-sm font-semibold text-white/75"
            >
              {{ candidate.email }}
            </p>

          </div>


          <!-- BOUTON CV ROUGE -->
          <button
            type="button"
            class="m-5 h-12 w-[calc(100%-2.5rem)] rounded-2xl bg-[#E40046] text-sm font-black text-white shadow-lg shadow-[#E40046]/20 transition-all duration-200 hover:bg-[#00313C] hover:shadow-xl hover:shadow-[#00313C]/20 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
          >
            Consulter le CV
          </button>

        </div>


        <!-- =================================================
             ZONE ÉVALUATION
             ================================================= -->
        <div
          class="flex min-h-[360px] flex-col justify-center rounded-[2rem] border border-[#64CCC9]/20 bg-white p-6 shadow-xl shadow-[#00313C]/10"
        >

          <!-- MESSAGE -->
          <div
            class="rounded-3xl bg-[#64CCC9]/10 p-6 ring-1 ring-[#64CCC9]/20"
          >

            <strong
              class="text-xl font-black text-[#00313C]"
            >
              Préparez votre entretien
            </strong>

            <p
              class="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#00313C]/65"
            >
              Posez les questions prévues et
              notez vos observations avant
              de compléter l'évaluation.
            </p>

          </div>


          <!-- =================================================
               BOUTON COMMENCER
               ================================================= -->
          <button
            type="button"
            class="mt-5 inline-flex h-12 w-fit items-center justify-center rounded-2xl bg-[#00313C] px-6 text-sm font-black text-white shadow-xl shadow-[#00313C]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E40046] hover:shadow-2xl hover:shadow-[#E40046]/20 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/30 active:scale-[0.98]"
            @click="startEvaluation"
          >
            Commencer l'évaluation

            <span
              class="ml-2 text-[#64CCC9]"
            >
              →
            </span>
          </button>

        </div>

      </section>

    </template>

  </main>
</template>