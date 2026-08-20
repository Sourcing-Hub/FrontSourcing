<script setup>
import AppIcon from '../icons/AppIcon.vue'
import StatusBadge from '../common/StatusBadge.vue'

defineProps({
  tests: { type: Array, required: true }
})

const emit = defineEmits(['view', 'edit', 'delete', 'download', 'publish'])
</script>

<template>
  <div class="tests-table">
    <table>
      <thead>
        <tr>
          <th>Nom du test</th>
          <th>Formation associée</th>
          <th>Statut</th>
          <th>Date de création</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="test in tests" :key="test.id">
          <td>
            <div class="tests-table__name">
              <span class="tests-table__file-icon">
                <AppIcon name="file" :size="16" />
              </span>
              <span class="tests-table__name-text">{{ test.nom }}</span>
              <StatusBadge v-if="test.isNew" status="nouveau" />
            </div>
          </td>
          <td class="tests-table__muted">{{ test.campagne_assossiee }}</td>
          <td><StatusBadge :status="test.statut" /></td>
          <td class="tests-table__muted">{{ test.createdAt }}</td>
          <td>
            <div class="tests-table__actions">
              <button
                type="button"
                class="tests-table__action"
                title="Voir le détail"
                aria-label="Voir le détail du test"
                @click="emit('view', test)"
              >
                <AppIcon name="eye" :size="17" />
              </button>
              <button
                type="button"
                class="tests-table__action"
                title="Modifier"
                aria-label="Modifier le test"
                @click="emit('edit', test)"
              >
                <AppIcon name="edit" :size="17" />
              </button>
              <button
                type="button"
                class="tests-table__action tests-table__action--publish"
                title="Publier le test"
                aria-label="Publier le test et notifier les candidats"
                @click="emit('publish', test)"
              >
                <AppIcon name="send" :size="17" />
              </button>
              <button
                type="button"
                class="tests-table__action"
                title="Télécharger"
                aria-label="Télécharger le test"
                @click="emit('download', test)"
              >
                <AppIcon name="download" :size="17" />
              </button>
              <button
                type="button"
                class="tests-table__action tests-table__action--danger"
                title="Supprimer"
                aria-label="Supprimer le test"
                @click="emit('delete', test)"
              >
                <AppIcon name="trash" :size="17" />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="tests.length === 0">
          <td colspan="5" class="tests-table__empty">Aucun test ne correspond à votre recherche.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tests-table {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background-color: var(--color-pink-600);
}

th {
  text-align: left;
  padding: 14px 24px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-white);
  text-transform: uppercase;
}

tbody tr {
  border-bottom: 1px solid var(--color-border);
}

tbody tr:last-child {
  border-bottom: none;
}

td {
  padding: 18px 24px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.tests-table__muted {
  color: var(--color-text-secondary);
}

.tests-table__name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tests-table__file-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background-color: var(--color-pink-50);
  color: var(--color-pink-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tests-table__name-text {
  font-weight: 700;
}

.tests-table__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tests-table__action {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  padding: 6px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.tests-table__action:hover {
  background-color: var(--color-bg);
  color: var(--color-navy-900);
}

.tests-table__action--danger:hover {
  background-color: #fdecec;
  color: #d33131;
}

.tests-table__action--publish:hover {
  background-color: var(--color-pink-50);
  color: var(--color-pink-600);
}

.tests-table__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: 32px;
}
</style>
