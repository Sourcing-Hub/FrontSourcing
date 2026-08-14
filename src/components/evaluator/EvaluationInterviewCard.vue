<script setup>
defineProps({
  interview: {
    type: Object,
    required: true,
  },
})

defineEmits(['open'])
</script>

<template>
  <article
    class="group flex flex-col gap-5 rounded-3xl border border-[#64CCC9]/20 bg-white p-5 shadow-xl shadow-[#00313C]/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#64CCC9]/40 hover:shadow-2xl hover:shadow-[#00313C]/10 sm:flex-row sm:items-center sm:justify-between"
  >

    <!-- DATE + INFORMATIONS -->
    <div class="flex min-w-0 items-center gap-4">

      <!-- CASE DATE -->
      <div
        class="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#E40046] text-white shadow-lg shadow-[#E40046]/25"
      >
        <span
          class="text-[11px] font-black uppercase tracking-wide text-white/90"
        >
          {{ interview.month }}
        </span>

        <strong
          class="-mt-2 text-2xl font-black leading-none text-white"
        >
          {{ interview.day }}
        </strong>
      </div>


      <!-- INFORMATIONS -->
      <div class="min-w-0">

        <!-- NOM + STATUT -->
        <div class="flex flex-wrap items-center gap-2">

          <h3
            class="truncate text-base font-black text-[#00313C]"
          >
            {{ interview.candidateName }}
          </h3>


          <!-- STATUT -->
          <span
            class="rounded-full px-3 py-1 text-xs font-black"
            :class="{
              'bg-[#00313C]/10 text-[#00313C]':
                interview.status === 'En-attente',

              'bg-[#64CCC9]/20 text-[#00313C]':
                interview.status === 'progress',

              'bg-[#00313C]/5 text-[#00313C]/60':
                interview.status === 'completed',
            }"
          >
            {{ interview.statusLabel }}
          </span>

        </div>


        <!-- TYPE ENTRETIEN -->
        <p
          class="mt-1 text-sm font-semibold text-[#00313C]/65"
        >
          {{ interview.typeLabel }}
        </p>


        <!-- HEURE + LIEU -->
        <div
          class="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#00313C]/50"
        >
          <span>
            ◷ {{ interview.startTime }} - {{ interview.endTime }}
          </span>

          <span>
            ◉ {{ interview.location }}
          </span>
        </div>

      </div>
    </div>


    <!-- BOUTON -->
    <button
      type="button"
      class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white shadow-lg shadow-[#00313C]/10 transition hover:bg-[#E40046] hover:shadow-xl hover:shadow-[#E40046]/10 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/40 active:scale-[0.98]"
      @click="$emit('open', interview)"
    >
      Effectuer l'entretien

      <span
        aria-hidden="true"
        class="text-[#64CCC9]"
      >
        →
      </span>
    </button>

  </article>
</template>