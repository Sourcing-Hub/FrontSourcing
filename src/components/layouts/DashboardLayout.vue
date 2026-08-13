<script setup>
/**
 * Layout principal englobant le Sidebar et la zone de contenu principale des dashboards.
 */
import Sidebar from './Sidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar Modularisé -->
    <Sidebar />

    <!-- Main Content -->
    <main class="flex-1 ml-64 flex flex-col min-h-screen">
      <header
        class="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center px-8 sticky top-0 z-10"
      >
        <slot name="header">
          <h2 class="text-lg font-medium text-gray-900">Bienvenue</h2>
        </slot>
      </header>

      <div class="p-8 flex-1 overflow-y-auto">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
