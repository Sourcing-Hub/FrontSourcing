<script setup>
//  Prépare un import groupé depuis une dépendance.
import { ref } from 'vue'

//  Déclare emit pour stocker une donnée ou un calcul de la vue.
const emit = defineEmits(['filter'])

//  Déclare search pour stocker une donnée ou un calcul de la vue.
const search = ref('')
//  Déclare type pour stocker une donnée ou un calcul de la vue.
const type = ref('Tous')
//  Déclare status pour stocker une donnée ou un calcul de la vue.
const status = ref('Tous')

//  Déclare la fonction emitFilters pour isoler un traitement évaluateur.
function emitFilters() {
  //  Exécute cette ligne de logique propre à la partie évaluateur.
  emit('filter', {
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    search: search.value,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    type: type.value,
    //  Ajoute cette valeur à la structure ou à la liste en cours.
    status: status.value,
  //  Ferme le bloc de configuration ou de traitement.
  })
//  Ferme le bloc de configuration ou de traitement.
}

//  Déclare la fonction reset pour isoler un traitement évaluateur.
function reset() {
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  search.value = ''
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  type.value = 'Tous'
  //  Met à jour ou lit la valeur réactive utilisée par Vue.
  status.value = 'Tous'

  //  Exécute cette ligne de logique propre à la partie évaluateur.
  emitFilters()
//  Ferme le bloc de configuration ou de traitement.
}
</script>

<template>
  <!--  Délimite une zone fonctionnelle de la page. -->
  <section
    class="grid gap-3 rounded-3xl border border-[#00313C]/20 bg-white p-3 xl:grid-cols-[1fr_190px_190px_auto]"
  >

    <!-- =====================================================
         RECHERCHE
         ===================================================== -->
    <!--  Structure un groupe d’éléments visuels. -->
    <div
      class="flex h-12 min-w-0 items-center gap-3 rounded-2xl border border-[#00313C]/30 bg-white px-4 transition focus-within:border-[#00313C] focus-within:ring-4 focus-within:ring-[#00313C]/15"
    >

      <!-- Icône recherche -->
      <!--  Affiche une information courte ou décorative. -->
      <span
        class="text-lg text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        ⌕
      <!--  Ferme l’élément span. -->
      </span>

      <!-- Input -->
      <!--  Affiche un champ de saisie utilisateur. -->
      <input
        v-model="search"
        class="w-full border-0 bg-white text-sm font-semibold text-[#00313C] outline-none placeholder:text-[#00313C]/40"
        type="search"
        placeholder="Rechercher un candidat..."
        @input="emitFilters"
      />

    <!--  Ferme l’élément div. -->
    </div>


    <!-- =====================================================
         FILTRE TYPE
         ===================================================== -->
    <!--  Affiche une liste de choix. -->
    <select
      v-model="type"
      class="h-12 rounded-2xl border border-[#00313C]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#00313C] focus:ring-4 focus:ring-[#00313C]/15"
      @change="emitFilters"
    >
      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="Tous"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Tous les types
      <!--  Ferme l’élément option. -->
      </option>

      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="Motivation"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Motivation
      <!--  Ferme l’élément option. -->
      </option>

      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="Technique"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Technique
      <!--  Ferme l’élément option. -->
      </option>
    <!--  Ferme l’élément select. -->
    </select>


    <!-- =====================================================
         FILTRE STATUT
         ===================================================== -->
    <!--  Affiche une liste de choix. -->
    <select
      v-model="status"
      class="h-12 rounded-2xl border border-[#00313C]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#00313C] focus:ring-4 focus:ring-[#00313C]/15"
      @change="emitFilters"
    >
      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="Tous"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Tous les statuts
      <!--  Ferme l’élément option. -->
      </option>

      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="En-attente"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        En-attente
      <!--  Ferme l’élément option. -->
      </option>

      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="En cours"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        En cours
      <!--  Ferme l’élément option. -->
      </option>

      <!--  Déclare une option disponible dans la liste. -->
      <option
        value="Terminé"
        class="bg-white text-[#00313C]"
      >
        <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
        Terminé
      <!--  Ferme l’élément option. -->
      </option>
    <!--  Ferme l’élément select. -->
    </select>


    <!-- =====================================================
         BOUTON RÉINITIALISER
         ===================================================== -->
    <!--  Affiche un bouton d’action pour l’utilisateur. -->
    <button
      type="button"
      class="h-12 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#E40046] focus:outline-none focus:ring-4 focus:ring-[#00313C]/20 active:scale-[0.98]"
      @click="reset"
    >
      <!--  Affiche ce contenu textuel dans la vue évaluateur. -->
      Réinitialiser
    <!--  Ferme l’élément button. -->
    </button>

  <!--  Ferme l’élément section. -->
  </section>
</template>