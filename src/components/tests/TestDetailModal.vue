<script setup>
import AppIcon from '../icons/AppIcon.vue'
import BaseButton from '../common/BaseButton.vue'
import StatusBadge from '../common/StatusBadge.vue'

defineProps({
  test: { type: Object, required: true }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="test-detail-title">
      <header class="modal__header">
        <h2 id="test-detail-title">{{ test.name }}</h2>
        <span class="modal__header-icon">
          <AppIcon name="file" :size="20" />
        </span>
      </header>

      <div class="modal__body">
        <div class="detail-row">
          <span class="detail-row__label">Formation associée</span>
          <span class="detail-row__value">{{ test.formation }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-row__label">Statut</span>
          <StatusBadge :status="test.status" />
        </div>

        <div class="detail-row">
          <span class="detail-row__label">Date de création</span>
          <span class="detail-row__value">{{ test.createdAt }}</span>
        </div>

        <div class="detail-row" v-if="test.url">
          <span class="detail-row__label">Lien de la ressource</span>
          <a class="detail-row__link" :href="test.url" target="_blank" rel="noopener">
            {{ test.url }}
          </a>
        </div>

        <div class="detail-block">
          <span class="detail-row__label">Description / Consignes</span>
          <p class="detail-block__text">
            {{ test.description || 'Aucune description renseignée pour ce test.' }}
          </p>
        </div>
      </div>

      <footer class="modal__footer">
        <BaseButton variant="secondary" type="button" @click="emit('close')">Fermer</BaseButton>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(11, 43, 58, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.modal {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid var(--color-border);
}

.modal__header h2 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.modal__header-icon {
  color: var(--color-pink-600);
  flex-shrink: 0;
}

.modal__body {
  padding: 24px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.detail-row__label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detail-row__value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.detail-row__link {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-pink-600);
  word-break: break-all;
  text-align: right;
}

.detail-row__link:hover {
  text-decoration: underline;
}

.detail-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-block__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
  white-space: pre-line;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 28px;
  border-top: 1px solid var(--color-border);
}
</style>
