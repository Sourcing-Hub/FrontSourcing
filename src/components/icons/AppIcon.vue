<script setup>
// AppIcon centralise toutes les icônes SVG de l'application.
// But : éviter une dépendance externe (icon pack) et garder un style
// de trait homogène (stroke) partout, comme dans la maquette.
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="app-icon"
    aria-hidden="true"
  >
    <!-- Tableau de bord -->
    <template v-if="name === 'dashboard'">
      <path d="M3 12 12 3l9 9" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </template>

    <!-- Candidats / groupe de personnes -->
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14a5 5 0 0 1 5.5 5" />
    </template>

    <!-- Gestion des tests -->
    <template v-else-if="name === 'tests'">
      <rect x="4" y="3" width="12" height="16" rx="2" />
      <path d="M8 8h4M8 12h4M8 16h2" />
      <path d="M17 9l3 3-3 3" />
    </template>

    <!-- Formations -->
    <template v-else-if="name === 'book'">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 5.5v15" />
    </template>

    <!-- Entretiens -->
    <template v-else-if="name === 'interview'">
      <path d="M4 4h11v9H8l-4 3z" />
      <path d="M19 9v11l-4-3h-4" />
    </template>

    <!-- Candidatures -->
    <template v-else-if="name === 'file'">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </template>

    <!-- Questionnaires -->
    <template v-else-if="name === 'clipboard'">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M8.5 11h7M8.5 15h7" />
    </template>

    <!-- Planification -->
    <template v-else-if="name === 'calendar'">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </template>

    <!-- Convocations -->
    <template v-else-if="name === 'send'">
      <path d="M4 11l16-7-6 16-3-6-7-3z" />
    </template>

    <!-- Evaluateurs -->
    <template v-else-if="name === 'star'">
      <path
        d="M12 3l2.6 5.5 6 .7-4.4 4.1 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.2l6-.7z"
      />
    </template>

    <!-- Voir / détail -->
    <template v-else-if="name === 'eye'">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </template>

    <!-- Recherche -->
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </template>

    <!-- Chevron bas -->
    <template v-else-if="name === 'chevron-down'">
      <path d="M6 9l6 6 6-6" />
    </template>

    <!-- Chevron droit -->
    <template v-else-if="name === 'chevron-right'">
      <path d="M9 6l6 6-6 6" />
    </template>

    <!-- Modifier -->
    <template v-else-if="name === 'edit'">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" />
      <path d="M13.5 6.5l3 3" />
    </template>

    <!-- Supprimer -->
    <template v-else-if="name === 'trash'">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </template>

    <!-- Télécharger -->
    <template v-else-if="name === 'download'">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </template>

    <!-- Import / mallette -->
    <template v-else-if="name === 'upload'">
      <rect x="3.5" y="8" width="17" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 12v4M10 14h4" />
    </template>

    <!-- Lien / URL -->
    <template v-else-if="name === 'link'">
      <path d="M9.5 14.5l5-5" />
      <path d="M8 16l-2 2a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5-.3" />
      <path d="M16 8l2-2a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 .3" />
    </template>

    <!-- Plus -->
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>

    <!-- Fermer -->
    <template v-else-if="name === 'x'">
      <path d="M6 6l12 12M18 6L6 18" />
    </template>

    <!-- Flèche haut (banniere de succès) -->
    <template v-else-if="name === 'arrow-up'">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </template>

    <!-- Déconnexion -->
    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </template>

    <!-- Personne (avatar générique) -->
    <template v-else-if="name === 'person'">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </template>

    <!-- Camembert (statistiques) -->
    <template v-else-if="name === 'pie-chart'">
      <path d="M12 3v9l7.8 4.5" />
      <path d="M20.9 13.5A9 9 0 1 1 12 3" />
    </template>

    <!-- Coche -->
    <template v-else-if="name === 'check'">
      <path d="M5 13l4 4L19 7" />
    </template>
  </svg>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
}
</style>
