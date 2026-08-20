<script setup>
// NB : aucune maquette Figma n'a encore été fournie pour le Dashboard.
// Cette vue reprend la charte graphique (sidebar/header/couleurs) avec un
// contenu minimal, à ajuster dès que la maquette sera disponible.
import { computed } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import AppIcon from '../components/icons/AppIcon.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { mockTests } from '../data/mockTests.js'

const kpis = computed(() => [
  { label: 'Candidatures reçues', value: '128', icon: 'file' },
  { label: 'Tests actifs', value: mockTests.filter((t) => t.status === 'actif').length, icon: 'tests' },
  { label: 'Entretiens planifiés', value: '14', icon: 'interview' },
  { label: 'Apprenants admis', value: '32', icon: 'users' }
])

const recentTests = mockTests.slice(0, 3)
</script>

<template>
  <div class="dashboard-view">
    <AppHeader title="Dashboard" />

    <main class="dashboard-view__body">
      <section class="kpi-grid">
        <article v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
          <span class="kpi-card__icon">
            <AppIcon :name="kpi.icon" :size="20" />
          </span>
          <div>
            <p class="kpi-card__value">{{ kpi.value }}</p>
            <p class="kpi-card__label">{{ kpi.label }}</p>
          </div>
        </article>
      </section>

      <section class="recent-tests">
        <h2>Tests récents</h2>
        <ul>
          <li v-for="test in recentTests" :key="test.id">
            <span class="recent-tests__name">{{ test.name }}</span>
            <span class="recent-tests__formation">{{ test.formation }}</span>
            <StatusBadge :status="test.status" />
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dashboard-view__body {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.kpi-card {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-card__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--color-pink-50);
  color: var(--color-pink-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-card__value {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-text-primary);
}

.kpi-card__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.recent-tests {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.recent-tests h2 {
  font-size: var(--font-size-md);
  font-weight: 700;
  margin-bottom: 16px;
}

.recent-tests ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-tests li {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.recent-tests li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.recent-tests__name {
  font-weight: 700;
  flex: 1;
}

.recent-tests__formation {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
