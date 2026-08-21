<script setup>
/**
 * Composant Racine (Root Component) englobant la vue active RouterView et la fenêtre modale globale.
 */
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GlobalModal from './components/common/GlobalModal.vue'
import DashboardLayout from './components/layouts/DashboardLayout.vue'

const route = useRoute()

const isEvaluatorRoute = computed(() => {
  return (
    typeof route.name === 'string' &&
    route.name.startsWith('evaluator-')
  )
})
</script>

<template>
  <DashboardLayout v-if="isEvaluatorRoute">
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900">
        Espace évaluateur
      </h2>
    </template>

    <RouterView />
  </DashboardLayout>

  <RouterView v-else />

  <GlobalModal />
</template>

<style>
/* Les styles de base Tailwind sont dans main.css */
</style>

<!-- App optimized -->
