<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filter'])

const search = ref('')
const type = ref('Tous')
const status = ref('Tous')

function emitFilters() {
  emit('filter', {
    search: search.value,
    type: type.value,
    status: status.value,
  })
}

function reset() {
  search.value = ''
  type.value = 'Tous'
  status.value = 'Tous'

  emitFilters()
}
</script>

<template>
  <section
    class="grid gap-3 rounded-3xl border border-[#64CCC9]/20 bg-white p-3 shadow-xl shadow-[#00313C]/10 backdrop-blur xl:grid-cols-[1fr_190px_190px_auto]"
  >

    <!-- =====================================================
         RECHERCHE
         ===================================================== -->
    <div
      class="flex h-12 min-w-0 items-center gap-3 rounded-2xl border border-[#64CCC9]/30 bg-white px-4 transition focus-within:border-[#64CCC9] focus-within:ring-4 focus-within:ring-[#64CCC9]/15"
    >

      <!-- Icône recherche -->
      <span
        class="text-lg text-[#00313C]"
      >
        ⌕
      </span>

      <!-- Input -->
      <input
        v-model="search"
        class="w-full border-0 bg-white text-sm font-semibold text-[#00313C] outline-none placeholder:text-[#00313C]/40"
        type="search"
        placeholder="Rechercher un candidat..."
        @input="emitFilters"
      />

    </div>


    <!-- =====================================================
         FILTRE TYPE
         ===================================================== -->
    <select
      v-model="type"
      class="h-12 rounded-2xl border border-[#64CCC9]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#64CCC9] focus:ring-4 focus:ring-[#64CCC9]/15"
      @change="emitFilters"
    >
      <option
        value="Tous"
        class="bg-white text-[#00313C]"
      >
        Tous les types
      </option>

      <option
        value="Motivation"
        class="bg-white text-[#00313C]"
      >
        Motivation
      </option>

      <option
        value="Technique"
        class="bg-white text-[#00313C]"
      >
        Technique
      </option>
    </select>


    <!-- =====================================================
         FILTRE STATUT
         ===================================================== -->
    <select
      v-model="status"
      class="h-12 rounded-2xl border border-[#64CCC9]/30 bg-white px-4 text-sm font-bold text-[#00313C] outline-none transition focus:border-[#64CCC9] focus:ring-4 focus:ring-[#64CCC9]/15"
      @change="emitFilters"
    >
      <option
        value="Tous"
        class="bg-white text-[#00313C]"
      >
        Tous les statuts
      </option>

      <option
        value="En-attente"
        class="bg-white text-[#00313C]"
      >
        En-attente
      </option>

      <option
        value="En cours"
        class="bg-white text-[#00313C]"
      >
        En cours
      </option>

      <option
        value="Terminé"
        class="bg-white text-[#00313C]"
      >
        Terminé
      </option>
    </select>


    <!-- =====================================================
         BOUTON RÉINITIALISER
         ===================================================== -->
    <button
      type="button"
      class="h-12 rounded-2xl bg-[#00313C] px-5 text-sm font-black text-white shadow-lg shadow-[#00313C]/10 transition hover:-translate-y-0.5 hover:bg-[#E40046] hover:shadow-lg hover:shadow-[#E40046]/10 focus:outline-none focus:ring-4 focus:ring-[#64CCC9]/20 active:scale-[0.98]"
      @click="reset"
    >
      Réinitialiser
    </button>

  </section>
</template>