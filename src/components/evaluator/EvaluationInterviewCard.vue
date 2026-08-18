<script setup>
//  Déclare les propriétés reçues par le composant.
defineProps({
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  interview: {
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    type: Object,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    required: true,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  },
//  Ferme le bloc de configuration ou de traitement.
})

//  Déclare les événements envoyés par le composant.
defineEmits(['open'])
</script>

<template>
  <!--  Affiche une carte ou un bloc de contenu autonome. -->
  <article
    class="group flex flex-col gap-5 rounded-3xl border border-[#64CCC9]/20 bg-white p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#64CCC9]/40 sm:flex-row sm:items-center sm:justify-between"
  >

    <!-- DATE + INFORMATIONS -->
    <!--  Structure un groupe d’éléments visuels. -->
    <div class="flex min-w-0 items-center gap-4">

      <!-- CASE DATE -->
      <!--  Structure un groupe d’éléments visuels. -->
      <div
        class="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#E40046] text-white"
      >
        <!--  Affiche une information courte ou décorative. -->
        <span
          class="text-[11px] font-black uppercase tracking-wide text-white/90"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ interview.month }}
        <!--  Ferme l’élément span. -->
        </span>

        <!--  Met en avant une valeur importante. -->
        <strong
          class="-mt-2 text-2xl font-black leading-none text-white"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ interview.day }}
        <!--  Ferme l’élément strong. -->
        </strong>
      <!--  Ferme l’élément div. -->
      </div>


      <!-- INFORMATIONS -->
      <!--  Structure un groupe d’éléments visuels. -->
      <div class="min-w-0">

        <!-- NOM + STATUT -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div class="flex flex-wrap items-center gap-2">

          <!--  Affiche un sous-titre ou un nom important. -->
          <h3
            class="truncate text-base font-black text-[#00313C]"
          >
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interview.candidateName }}
          <!--  Ferme l’élément h3. -->
          </h3>


          <!-- STATUT -->
          <!--  Affiche une information courte ou décorative. -->
          <span
            class="rounded-full px-3 py-1 text-xs font-black"
            :class="{ 'bg-[#00313C]/10 text-[#00313C]': interview.status === 'En-attente', 'bg-[#64CCC9]/20 text-[#00313C]': interview.status === 'progress', 'bg-[#00313C]/5 text-[#00313C]/60': interview.status === 'completed', }"
          >
            <!--  Affiche une donnée dynamique dans l’interface. -->
            {{ interview.statusLabel }}
          <!--  Ferme l’élément span. -->
          </span>

        <!--  Ferme l’élément div. -->
        </div>


        <!-- TYPE ENTRETIEN -->
        <!--  Affiche un paragraphe de texte. -->
        <p
          class="mt-1 text-sm font-semibold text-[#00313C]/65"
        >
          <!--  Affiche une donnée dynamique dans l’interface. -->
          {{ interview.typeLabel }}
        <!--  Ferme l’élément p. -->
        </p>


        <!-- HEURE + LIEU -->
        <!--  Structure un groupe d’éléments visuels. -->
        <div
          class="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#00313C]/50"
        >
          <!--  Affiche une information courte ou décorative. -->
          <span>
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            ◷ {{ interview.startTime }} - {{ interview.endTime }}
          <!--  Ferme l’élément span. -->
          </span>

          <!--  Affiche une information courte ou décorative. -->
          <span>
            <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
            ◉ {{ interview.location }}
          <!--  Ferme l’élément span. -->
          </span>
        <!--  Ferme l’élément div. -->
        </div>

      <!--  Ferme l’élément div. -->
      </div>
    <!--  Ferme l’élément div. -->
    </div>


    <!-- BOUTON -->
    <!--  Affiche un bouton d’action pour l’utilisateur. -->
    <button
      type="button"
      class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white transition hover:bg-[#E40046] focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/40 active:scale-[0.98]"
      @click="$emit('open', interview)"
    >
      <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
      Effectuer l'entretien

      <!--  Affiche une information courte ou décorative. -->
      <span
        aria-hidden="true"
        class="text-[#64CCC9]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        →
      <!--  Ferme l’élément span. -->
      </span>
    <!--  Ferme l’élément button. -->
    </button>

  <!--  Ferme l’élément article. -->
  </article>
</template>