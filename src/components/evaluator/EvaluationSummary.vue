<script setup>
//  Prépare un import groupé depuis une dépendance.
import { computed } from 'vue'

//  Déclare props pour stocker une donnée ou un calcul de la vue.
const props = defineProps({
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  evaluation: {
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    type: Object,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    required: true,
  //  Ajoute cette valeur à la structure ou à la liste en cours.
  },
//  Ferme le bloc de configuration ou de traitement.
})

//  Déclare score pour stocker une donnée ou un calcul de la vue.
const score = computed(() => {
  //  Vérifie cette condition avant de continuer.
  if (typeof props.evaluation.score === 'number') {
    //  Retourne le résultat attendu par le reste du code.
    return props.evaluation.score
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Déclare values pour stocker une donnée ou un calcul de la vue.
  const values = [
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    props.evaluation.communication,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    props.evaluation.motivation,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    props.evaluation.technicalSkills,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    props.evaluation.problemSolving,
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  ].filter(
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    (value) => typeof value === 'number',
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )

  //  Vérifie cette condition avant de continuer.
  if (!values.length) {
    //  Retourne le résultat attendu par le reste du code.
    return 0
  //  Ferme le bloc de configuration ou de traitement.
  }

  //  Retourne le résultat attendu par le reste du code.
  return (
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    values.reduce(
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      (sum, value) => sum + value,
      //  Ajoute cette valeur à la structure ou à la liste en cours.
      0,
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ) / values.length
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  ).toFixed(1)
//  Ferme le bloc de configuration ou de traitement.
})

//  Déclare scoreSuffix pour stocker une donnée ou un calcul de la vue.
const scoreSuffix = computed(() => {
  //  Retourne le résultat attendu par le reste du code.
  return typeof props.evaluation.score === 'number'
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ? '/100'
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    : '/10'
//  Ferme le bloc de configuration ou de traitement.
})

//  Déclare comment pour stocker une donnée ou un calcul de la vue.
const comment = computed(() => {
  //  Retourne le résultat attendu par le reste du code.
  return (
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    props.evaluation.comment ||
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    props.evaluation.comments ||
    //  Exécute cette ligne de logique propre à la partie évaluateur.
    ''
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  )
//  Ferme le bloc de configuration ou de traitement.
})
</script>

<template>
  <!--  Délimite une zone fonctionnelle de la page. -->
  <section class="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur">

    <!--  Structure un groupe d’éléments visuels. -->
    <div class="from-slate-950 via-indigo-950 to-slate-900 p-6 text-white">
      <!--  Affiche une information courte ou décorative. -->
      <span class="block text-xs font-black uppercase tracking-[0.18em] text-cyan-100/60">Score global</span>

      <!--  Met en avant une valeur importante. -->
      <strong class="mt-3 inline-block text-6xl font-black tracking-tight text-cyan-300">
        <!--  Affiche une donnée dynamique dans l’interface. -->
        {{ score }}
      <!--  Ferme l’élément strong. -->
      </strong>

      <!--  Affiche ou configure l’élément small. -->
      <small class="text-sm font-black text-white/50">{{ scoreSuffix }}</small>
    <!--  Ferme l’élément div. -->
    </div>

    <!--  Structure un groupe d’éléments visuels. -->
    <div class="border-b border-slate-100 p-5">
      <!--  Affiche une information courte ou décorative. -->
      <span class="block text-xs font-black uppercase tracking-wide text-slate-400">Décision</span>

      <!--  Met en avant une valeur importante. -->
      <strong class="mt-2 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-800">
        <!--  Affiche une donnée dynamique dans l’interface. -->
        {{
          evaluation.recommendation === 'favorable'
            ? 'Favorable'
            : evaluation.recommendation === 'reserve'
              ? 'À revoir'
              : evaluation.recommendation === 'defavorable'
                ? 'Défavorable'
                : 'Non renseignée'
        }}
      <!--  Ferme l’élément strong. -->
      </strong>
    <!--  Ferme l’élément div. -->
    </div>

    <!--  Structure un groupe d’éléments visuels. -->
    <div
      v-if="comment"
      class="p-5"
    >
      <!--  Affiche une information courte ou décorative. -->
      <span class="block text-xs font-black uppercase tracking-wide text-slate-400">Commentaire</span>

      <!--  Affiche un paragraphe de texte. -->
      <p class="mt-3 text-sm font-semibold leading-7 text-slate-600">
        <!--  Affiche une donnée dynamique dans l’interface. -->
        {{ comment }}
      <!--  Ferme l’élément p. -->
      </p>
    <!--  Ferme l’élément div. -->
    </div>

  <!--  Ferme l’élément section. -->
  </section>
</template>
