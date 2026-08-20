<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 'actif' | 'inactif' | 'nouveau'
  status: { type: String, required: true }
})

// Libellé affiché : on garde la casse d'origine sauf pour "nouveau"
// qui s'affiche toujours en majuscules dans la maquette.
const label = computed(() => {
  const labels = {
    actif: 'Actif',
    inactif: 'Inactif',
    nouveau: 'NOUVEAU'
  }
  return labels[props.status] ?? props.status
})
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  white-space: nowrap;
}

.status-badge--actif {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
}

.status-badge--inactif {
  background-color: var(--color-inactive-bg);
  color: var(--color-inactive-text);
}

.status-badge--nouveau {
  background-color: var(--color-navy-900);
  color: var(--color-white);
  letter-spacing: 0.02em;
}
</style>
