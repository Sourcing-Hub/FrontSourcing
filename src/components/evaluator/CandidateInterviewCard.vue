<script setup>
defineProps({
  candidate: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-[#00313C]/20 bg-white  transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00313C]/40 "
  >
    <!-- HEADER -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-[#00313C] via-[#00313C] to-[#064957] p-5 text-white"
    >
      <div
        class="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#00313C]/15 blur-2xl"
      />

      <div
        class="relative flex items-center justify-between gap-4"
      >
        <div
          class="flex min-w-0 items-center gap-3"
        >
          <!-- AVATAR -->
          <div
            class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#E40046] text-xl font-black text-white"
          >
            {{
              candidate.firstName
                ?.charAt(0)
                .toUpperCase()
            }}
          </div>

          <!-- IDENTITÉ -->
          <div class="min-w-0">
            <h2
              class="truncate text-lg font-black"
            >
              {{ candidate.firstName }}
              {{ candidate.lastName }}
            </h2>

            <p
              class="mt-1 truncate text-xs font-medium text-white/60"
            >
              {{ candidate.email }}
            </p>
          </div>
        </div>

        <!-- BADGE -->
        <span
          class="hidden shrink-0 rounded-full border border-[#00313C]/30 bg-[#00313C]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#00313C] sm:inline-flex"
        >
          Candidat
        </span>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="p-5">
      <div
        class="grid gap-3 sm:grid-cols-2"
      >
        <!-- FORMATION -->
        <!-- <div
          class="rounded-xl border border-[#00313C]/20 bg-[#00313C]/5 p-3"
        >
          <span
            class="text-[9px] font-black uppercase tracking-wider text-[#00313C]/45"
          >
            Formation
          </span>

          <p
            class="mt-1 truncate text-xs font-black text-[#00313C]"
          >
            {{
              candidate.formation ||
              'Non renseignée'
            }}
          </p>
        </div> -->

        <!-- PROMOTION -->
        <!-- <div
          class="rounded-xl border border-[#E40046]/15 bg-[#E40046]/5 p-3"
        >
          <span
            class="text-[9px] font-black uppercase tracking-wider text-[#E40046]/70"
          >
            Promotion
          </span>

          <p
            class="mt-1 truncate text-xs font-black text-[#00313C]"
          >
            {{
              candidate.promotion ||
              'Non renseignée'
            }}
          </p>
        </div> -->
      </div>

      <!-- CONTACT -->
      <div
        class="mt-3 flex items-center justify-between gap-3"
      >
        <div class="min-w-0">
          <span
            class="text-[9px] font-black uppercase tracking-wider text-[#00313C]/40"
          >
            Téléphone
          </span>

          <p
            class="mt-1 truncate text-xs font-bold text-[#00313C]"
          >
            {{
              candidate.phone ||
              'Non renseigné'
            }}
          </p>
        </div>

        <span
          class="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#00313C]/50 transition group-hover:text-[#E40046]"
        >
          Voir les entretiens
          <span class="text-sm">
            →
          </span>
        </span>
      </div>
    </div>
  </article>
</template>