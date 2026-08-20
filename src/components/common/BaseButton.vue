<script setup>
// Bouton générique. `variant` pilote l'apparence :
// - primary   : fond navy (ex : "Créer un test", "Créer le test")
// - secondary : fond gris clair (ex : "Annuler")
// - ghost     : sans fond, utilisé pour les icônes d'action du tableau
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  type: { type: String, default: 'button' }
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="`base-button--${variant}`"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 11px 20px;
  transition: background-color var(--transition-fast), color var(--transition-fast),
    box-shadow var(--transition-fast);
  white-space: nowrap;
}

.base-button--primary {
  background-color: var(--color-navy-900);
  color: var(--color-white);
}

.base-button--primary:hover,
.base-button--primary:focus-visible,
.base-button--primary:active {
  background-color: var(--color-navy-800);
  color: var(--color-white);
  outline: none;
}

.base-button--secondary {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.base-button--secondary:hover {
  background-color: #ececef;
}

.base-button--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  padding: 8px;
  border-radius: var(--radius-sm);
}

.base-button--ghost:hover {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}
</style>
