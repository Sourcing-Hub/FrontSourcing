<script setup>
import AppIcon from '../icons/AppIcon.vue'

defineProps({
  // Texte avant et après la partie mise en évidence (ex: le nom du test)
  prefix: { type: String, default: '' },
  highlight: { type: String, default: '' },
  suffix: { type: String, default: '' }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="alert-banner" role="status">
    <div class="alert-banner__content">
      <span class="alert-banner__icon">
        <AppIcon name="person" :size="16" />
      </span>
      <p>{{ prefix }} <strong>"{{ highlight }}"</strong> {{ suffix }}</p>
    </div>
    <button
      type="button"
      class="alert-banner__close"
      aria-label="Masquer le message"
      @click="emit('close')"
    >
      <AppIcon name="arrow-up" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.alert-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
}

.alert-banner__content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.alert-banner__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-navy-900);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-banner__close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.alert-banner__close:hover {
  background-color: var(--color-bg);
}
</style>
