<script setup>
import AppIcon from '../icons/AppIcon.vue'

const props = defineProps({
  search: { type: String, required: true },
  formationFilter: { type: String, required: true },
  statusFilter: { type: String, required: true },
  formations: { type: Array, required: true } // [{ id, label }]
})

const emit = defineEmits(['update:search', 'update:formationFilter', 'update:statusFilter'])
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__search">
      <AppIcon name="search" :size="18" />
      <input
        type="text"
        placeholder="Rechercher un test..."
        :value="search"
        @input="emit('update:search', $event.target.value)"
      />
    </div>

    <div class="filter-bar__select">
      <select
        :value="formationFilter"
        @change="emit('update:formationFilter', $event.target.value)"
      >
        <option value="">Candidature : Toutes</option>
        <option v-for="f in formations" :key="f.id" :value="f.id">
          {{ f.label }}
        </option>
      </select>
      <AppIcon name="chevron-down" :size="16" class="filter-bar__caret" />
    </div>

    <div class="filter-bar__select">
      <select :value="statusFilter" @change="emit('update:statusFilter', $event.target.value)">
        <option value="">Statut : Tous</option>
        <option value="actif">Actif</option>
        <option value="inactif">Inactif</option>
      </select>
      <AppIcon name="chevron-down" :size="16" class="filter-bar__caret" />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-bar__search {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  color: var(--color-text-secondary);
}

.filter-bar__search input {
  border: none;
  outline: none;
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: transparent;
}

.filter-bar__search input::placeholder {
  color: var(--color-text-muted);
}

.filter-bar__select {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 40px 0 16px;
}

.filter-bar__select select {
  appearance: none;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  min-width: 170px;
}

.filter-bar__caret {
  position: absolute;
  right: 14px;
  color: var(--color-text-secondary);
  pointer-events: none;
}
</style>
