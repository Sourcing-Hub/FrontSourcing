<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from '../icons/AppIcon.vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  test: { type: Object, required: true },
  // Candidats déjà filtrés (rattachés à la formation du test) par la vue parente.
  candidates: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'confirm'])

// Message pré-rempli, modifiable avant l'envoi.
const form = reactive({
  subject: `Votre test "${props.test.name}" est disponible`,
  description:
    "Bonjour,\n\nLe test est maintenant disponible. Nous vous invitons à le réaliser dans les meilleurs délais.\n\nBonne chance !"
})

// Tous les candidats sont notifiés par défaut ; on peut en décocher certains.
const selectedIds = ref(props.candidates.map((c) => c.id))

const allSelected = computed(
  () => props.candidates.length > 0 && selectedIds.value.length === props.candidates.length
)

const toggleAll = () => {
  selectedIds.value = allSelected.value ? [] : props.candidates.map((c) => c.id)
}

const toggleOne = (id) => {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((i) => i !== id)
    : [...selectedIds.value, id]
}

// Si la liste des candidats change après ouverture, on resélectionne tout le monde.
watch(
  () => props.candidates,
  (list) => {
    selectedIds.value = list.map((c) => c.id)
  }
)

const handleConfirm = () => {
  if (!form.subject.trim() || selectedIds.value.length === 0) return
  emit('confirm', {
    subject: form.subject,
    description: form.description,
    candidateIds: [...selectedIds.value]
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="publish-test-title">
      <header class="modal__header">
        <div>
          <h2 id="publish-test-title">Publier le test</h2>
          <p class="modal__subtitle">{{ test.name }}</p>
        </div>
        <span class="modal__header-icon">
          <AppIcon name="send" :size="20" />
        </span>
      </header>

      <div class="modal__body">
        <!-- Objet du mail -->
        <div class="form-field">
          <label for="publish-subject">Objet</label>
          <input id="publish-subject" v-model="form.subject" type="text" required />
        </div>

        <!-- Description / corps du mail -->
        <div class="form-field">
          <label for="publish-description">Description</label>
          <textarea id="publish-description" v-model="form.description" rows="4"></textarea>
        </div>

        <!-- Liste des candidats à notifier -->
        <div class="form-field">
          <div class="recipients__header">
            <label>Candidats qui recevront le mail</label>
            <button type="button" class="recipients__toggle-all" @click="toggleAll">
              {{ allSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
            </button>
          </div>

          <ul v-if="candidates.length" class="recipients">
            <li v-for="candidate in candidates" :key="candidate.id" class="recipients__item">
              <label class="recipients__checkbox">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(candidate.id)"
                  @change="toggleOne(candidate.id)"
                />
                <span class="recipients__name">{{ candidate.name }}</span>
                <span class="recipients__email">{{ candidate.email }}</span>
              </label>
            </li>
          </ul>
          <p v-else class="recipients__empty">
            Aucun candidat rattaché à cette offre pour le moment.
          </p>

          <p class="recipients__count">
            {{ selectedIds.length }} candidat(s) sélectionné(s) sur {{ candidates.length }}
          </p>
        </div>
      </div>

      <footer class="modal__footer">
        <BaseButton variant="secondary" type="button" @click="emit('close')">
          Annuler
        </BaseButton>
        <BaseButton variant="primary" type="button" @click="handleConfirm">
          Publier et notifier
        </BaseButton>
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
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid var(--color-border);
}

.modal__header h2 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.modal__subtitle {
  margin-top: 4px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-primary);
}

.form-field input[type='text'],
.form-field textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--color-navy-700);
}

.recipients__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recipients__toggle-all {
  background: none;
  border: none;
  color: var(--color-pink-600);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.recipients__toggle-all:hover {
  text-decoration: underline;
}

.recipients {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  max-height: 220px;
  overflow-y: auto;
}

.recipients__item {
  border-bottom: 1px solid var(--color-border);
}

.recipients__item:last-child {
  border-bottom: none;
}

.recipients__checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
}

.recipients__checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-pink-600);
  flex-shrink: 0;
}

.recipients__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.recipients__email {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.recipients__empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  padding: 12px 0;
}

.recipients__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid var(--color-border);
}
</style>
