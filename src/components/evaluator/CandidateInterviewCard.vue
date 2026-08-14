<script setup>
defineProps({
  candidate: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section
    class="overflow-hidden rounded-[2rem] border border-[#64CCC9]/20 bg-white shadow-xl shadow-[#00313C]/10"
  >

    <!-- =====================================================
         HEADER
         ===================================================== -->
    <div
      class="relative overflow-hidden bg-linear-to-br from-[#00313C] via-[#00313C] to-[#064957] px-6 py-7 text-white sm:px-8"
    >

      <!-- Décorations -->
      <div
        class="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#64CCC9]/20 blur-3xl"
      />

      <div
        class="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#E40046]/10 blur-3xl"
      />

      <!-- ===================================================
           CONTENU HEADER
           =================================================== -->
      <div
        class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
      >

        <!-- =================================================
             IDENTITÉ À GAUCHE
             ================================================= -->
        <div class="flex min-w-0 items-center gap-4">

          <!-- AVATAR -->
          <div
            class="grid h-20 w-20 shrink-0 place-items-center rounded-[1.7rem] border border-[#E40046]/30 bg-[#E40046] text-3xl font-black text-white shadow-2xl shadow-[#E40046]/15 ring-4 ring-[#E40046]/10"
          >
            {{ candidate.firstName?.charAt(0).toUpperCase() }}
          </div>


          <!-- INFORMATIONS -->
          <div class="min-w-0">

            <!-- NOM -->
            <h2
              class="truncate text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              {{ candidate.firstName }}
              {{ candidate.lastName }}
            </h2>

            <!-- EMAIL -->
            <p
              class="mt-1 truncate text-sm font-medium text-white/65"
            >
              {{ candidate.email }}
            </p>

          </div>

        </div>


        <!-- =================================================
             BADGE À DROITE
             ================================================= -->
        <div
          class="flex shrink-0 items-center justify-start sm:justify-end"
        >

          <div
            class="inline-flex items-center rounded-full border border-[#64CCC9]/30 bg-[#64CCC9]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#64CCC9] shadow-lg shadow-[#00313C]/10 backdrop-blur"
          >
            <span
              class="mr-2 h-2 w-2 rounded-full bg-[#64CCC9]"
            />

            Candidat
          </div>

        </div>

      </div>

    </div>


    <!-- =====================================================
         INFORMATIONS
         ===================================================== -->
    <div class="p-5 sm:p-6">

      <!-- TITRE -->
      <div class="mb-5">

        <p
          class="text-xs font-black uppercase tracking-[0.15em] text-[#E40046]"
        >
          Informations
        </p>

        <h3
          class="mt-1 text-lg font-black text-[#00313C]"
        >
          Profil du candidat
        </h3>

      </div>


      <!-- ===================================================
           GRILLE DES CARTES
           =================================================== -->
      <div
        class="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >

        <!-- =================================================
             TÉLÉPHONE
             ================================================= -->
        <div
          class="group flex h-full min-h-[175px] flex-col rounded-2xl border border-[#64CCC9]/20 bg-[#64CCC9]/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#64CCC9]/40 hover:bg-white hover:shadow-lg hover:shadow-[#00313C]/7"
        >

          <!-- ICÔNE -->
          <div
            class="mb-4 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#00313C] shadow-sm ring-1 ring-[#64CCC9]/20"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.09l-4.423-.906a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.06-7.06 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.272.534-.731.417-1.173L7.246 3.852A1.125 1.125 0 0 0 6.156 3H4.5a2.25 2.25 0 0 0-2.25 2.25v1.5Z"
              />
            </svg>

          </div>

          <span
            class="block text-[11px] font-black uppercase tracking-wider text-[#00313C]/45"
          >
            Téléphone
          </span>

          <strong
            class="mt-2 block truncate text-sm font-black text-[#00313C]"
          >
            {{ candidate.phone || 'Non renseigné' }}
          </strong>

        </div>


        <!-- =================================================
             FORMATION
             ================================================= -->
        <div
          class="group flex h-full min-h-[175px] flex-col rounded-2xl border border-[#64CCC9]/20 bg-[#64CCC9]/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#64CCC9]/40 hover:bg-white hover:shadow-lg hover:shadow-[#00313C]/7"
        >

          <!-- ICÔNE -->
          <div
            class="mb-4 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#00313C] shadow-sm ring-1 ring-[#64CCC9]/20"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 14.25 3.75 9.5 12 4.75l8.25 4.75L12 14.25Z"
              />

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 11.25v4.5c0 1.657 2.35 3 5.25 3s5.25-1.343 5.25-3v-4.5"
              />

            </svg>

          </div>

          <span
            class="block text-[11px] font-black uppercase tracking-wider text-[#00313C]/45"
          >
            Formation
          </span>

          <strong
            class="mt-2 block text-sm font-black leading-5 text-[#00313C]"
          >
            {{ candidate.formation || 'Non renseignée' }}
          </strong>

        </div>


        <!-- =================================================
             PROMOTION
             ================================================= -->
        <div
          class="group flex h-full min-h-[175px] flex-col rounded-2xl border border-[#E40046]/15 bg-[#E40046]/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E40046]/30 hover:bg-white hover:shadow-lg hover:shadow-[#E40046]/7"
        >

          <!-- ICÔNE -->
          <div
            class="mb-4 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#E40046] shadow-sm ring-1 ring-[#E40046]/15"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v18M3 12h18"
              />

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5.5 7.5h13M5.5 16.5h13"
              />

            </svg>

          </div>

          <span
            class="block text-[11px] font-black uppercase tracking-wider text-[#E40046]/70"
          >
            Promotion
          </span>

          <strong
            class="mt-2 block text-sm font-black leading-5 text-[#00313C]"
          >
            {{ candidate.promotion || 'Non renseignée' }}
          </strong>

        </div>

      </div>

    </div>

  </section>
</template>