<script setup>
import { computed } from 'vue'

const props = defineProps({
  evaluation: {
    type: Object,
    required: true,
  },
})

const score = computed(() => {
  const values = [
    props.evaluation.communication,
    props.evaluation.motivation,
    props.evaluation.technicalSkills,
    props.evaluation.problemSolving,
  ].filter(
    (value) => typeof value === 'number',
  )

  if (!values.length) {
    return 0
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  ).toFixed(1)
})
</script>

<template>
  <section class="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur">

    <div class="from-slate-950 via-indigo-950 to-slate-900 p-6 text-white">
      <!-- <span class="block text-xs font-black uppercase tracking-[0.18em] text-cyan-100/60">Score global</span> -->

      <!-- <strong class="mt-3 inline-block text-6xl font-black tracking-tight text-cyan-300">
        {{ score }}
      </strong> -->

      <small class="text-sm font-black text-white/50">/10</small>
    </div>

    <div class="border-b border-slate-100 p-5">
      <span class="block text-xs font-black uppercase tracking-wide text-slate-400">Décision</span>

      <strong class="mt-2 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-800">
        {{
          evaluation.recommendation === 'favorable'
            ? 'Favorable'
            : evaluation.recommendation === 'reserve'
              ? 'À revoir'
              : evaluation.recommendation === 'defavorable'
                ? 'Défavorable'
                : 'Non renseignée'
        }}
      </strong>
    </div>

    <div
      v-if="evaluation.comments"
      class="p-5"
    >
      <span class="block text-xs font-black uppercase tracking-wide text-slate-400">Commentaire</span>

      <p class="mt-3 text-sm font-semibold leading-7 text-slate-600">
        {{ evaluation.comments }}
      </p>
    </div>

  </section>
</template>
