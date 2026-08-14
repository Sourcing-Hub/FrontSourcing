<script setup>
/**
 * Composant Racine (Root Component) englobant la vue active RouterView et la fenêtre modale globale.
 */
import { RouterView } from 'vue-router'
import GlobalModal from './components/common/GlobalModal.vue'
</script>

<template>
  <RouterView />
  <GlobalModal />
</template>

<style>
/* Les styles de base Tailwind sont dans main.css */
</style>

<!-- App optimized -->
