<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})

const emit = defineEmits(['change'])

const goTo = (page) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('change', page)
}
</script>

<template>
  <nav class="pagination" aria-label="Pagination">
    <button
      type="button"
      class="pagination__nav"
      :disabled="currentPage === 1"
      @click="goTo(currentPage - 1)"
    >
      Précédent
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      type="button"
      class="pagination__page"
      :class="{ 'pagination__page--active': page === currentPage }"
      @click="goTo(page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="pagination__nav"
      :disabled="currentPage === totalPages"
      @click="goTo(currentPage + 1)"
    >
      Suivant
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination__nav,
.pagination__page {
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.pagination__page {
  min-width: 38px;
}

.pagination__nav:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.pagination__nav:not(:disabled):hover,
.pagination__page:not(.pagination__page--active):hover {
  background-color: var(--color-bg);
}

.pagination__page--active {
  background-color: var(--color-pink-600);
  border-color: var(--color-pink-600);
  color: var(--color-white);
}
</style>
