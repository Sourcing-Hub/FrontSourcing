<script setup>
/**
 * Layout principal englobant le Sidebar et la zone de contenu principale des dashboards.
 */
import Sidebar from './Sidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex overflow-x-hidden">
    <!-- Sidebar Modularisé -->
    <Sidebar />

    <!-- Zone de contenu principale -->
    <main class="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 transition-all duration-200">
      <header
        class="bg-white/90 border-b border-gray-200/80 -xs h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20"
      >
        <div class="flex items-center justify-between w-full min-w-0">
          <slot name="header">
            <h2 class="text-lg font-semibold text-gray-900 truncate">Bienvenue</h2>
          </slot>
        </div>
      </header>

      <div class="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto min-w-0">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
