<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import AppIcon from '../icons/AppIcon.vue'

const props = defineProps({
  formations: { type: Array, required: true }, // [{ id, label }]
  initialData: { type: Object, default: null },
  isEditMode: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'submit', 'publish'])

const form = reactive({
  nom: '',
  campagne_assossiee: '',
  lien_ressource: '',
  fichier_ressource: null,
  description: '',
  statut: '',
  date_ouverture: '',
  date_cloture: ''
})

// Remplissage du formulaire si on est en mode édition
const populateForm = () => {
  if (props.isEditMode && props.initialData) {
    form.nom = props.initialData.nom || props.initialData.name || ''
    form.campagne_assossiee = props.initialData.campagne_assossiee || props.initialData.formation || ''
    form.lien_ressource = props.initialData.lien_ressource || ''
    form.description = props.initialData.description || ''
    form.statut = props.initialData.statut || ''
    form.date_ouverture = props.initialData.date_ouverture || ''
    form.date_cloture = props.initialData.date_cloture || ''
    form.fichier_ressource = null
  } else {
    // Réinitialisation pour la création
    form.nom = ''
    form.campagne_assossiee = ''
    form.lien_ressource = ''
    form.fichier_ressource = null
    form.description = ''
    form.statut = ''
    form.date_ouverture = ''
    form.date_cloture = ''
  }
}

onMounted(() => {
  populateForm()
})

watch(() => props.initialData, () => {
  populateForm()
}, { deep: true })

const fileInput = ref(null)
const isDragging = ref(false)

const openFileDialog = () => fileInput.value?.click()

const onFileChange = (event) => {
  const [file] = event.target.files
  if (file) form.fichier_ressource = file
}

const onDrop = (event) => {
  isDragging.value = false
  const [file] = event.dataTransfer.files
  if (file) form.fichier_ressource = file
}

const handleSubmit = () => {
  if (!form.nom.trim()) return
  emit('submit', { ...form })
}

const handleCreateAndPublish = () => {
  if (!form.nom.trim()) return
  emit('publish', { ...form })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="create-test-title">
      <header class="modal__header">
        <h2 id="create-test-title">
          {{ isEditMode ? 'Modifier le test' : 'Créer un nouveau test' }}
        </h2>
        <button
          type="button"
          class="modal__close"
          aria-label="Fermer la fenêtre"
          @click="emit('close')"
        >
          <AppIcon name="x" :size="20" />
        </button>
      </header>

      <form class="modal__body" @submit.prevent="handleSubmit">
        <!-- Nom du test -->
        <div class="form-field">
          <label for="test-name">Nom du test</label>
          <input
            id="test-name"
            v-model="form.nom"
            type="text"
            placeholder="Ex: Algorithmique Avancée"
            required
          />
        </div>

        <!-- Candidature / Offre associée -->
        <div class="form-field">
          <label for="test-formation">Candidature associée</label>
          <div class="form-field__select">
            <select id="test-formation" v-model="form.campagne_assossiee">
              <option value="" disabled>Sélectionner une offre</option>
              <option v-for="f in formations" :key="f.id" :value="f.id">
                {{ f.label }}
              </option>
            </select>
            <AppIcon name="chevron-down" :size="16" class="form-field__caret" />
          </div>
        </div>

        <!-- Dates -->
        <div class="form-field-row">
          <div class="form-field">
            <label for="test-opening-date">Date d'ouverture</label>
            <input id="test-opening-date" v-model="form.date_ouverture" type="date" />
          </div>
          <div class="form-field">
            <label for="test-closing-date">Date de clôture</label>
            <input
              id="test-closing-date"
              v-model="form.date_cloture"
              type="date"
              :min="form.date_ouverture || undefined"
            />
          </div>
        </div>

        <!-- Lien (URL) -->
        <div class="form-field">
          <label for="test-url">Lien de la ressource (URL)</label>
          <div class="form-field__with-icon">
            <AppIcon name="link" :size="16" />
            <input
              id="test-url"
              v-model="form.lien_ressource"
              type="url"
              placeholder="https://exemple.com/mon-test"
            />
          </div>
        </div>

        <!-- Fichier -->
        <div class="form-field">
          <label>Importer les ressources (PDF/Doc)</label>
          <div
            class="dropzone"
            :class="{ 'dropzone--active': isDragging }"
            @click="openFileDialog"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <AppIcon name="upload" :size="26" />
            <p class="dropzone__title">Cliquez pour uploader ou glissez-déposez</p>
            <p class="dropzone__hint">PDF, DOCX jusqu'à 10MB</p>
            <p v-if="form.fichier_ressource" class="dropzone__file">
              {{ form.fichier_ressource.name }}
            </p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            class="dropzone__input"
            style="display: none;"
            @change="onFileChange"
          />
        </div>

        <!-- Description -->
        <div class="form-field">
          <label for="test-description">Description / Consignes</label>
          <textarea
            id="test-description"
            v-model="form.description"
            rows="4"
            placeholder="Décrivez les objectifs et les consignes du test..."
          ></textarea>
        </div>

        <footer class="modal__footer">
          <BaseButton variant="secondary" type="button" @click="emit('close')">
            Annuler
          </BaseButton>
          
          <BaseButton 
            v-if="!isEditMode" 
            variant="secondary" 
            type="button" 
            @click="handleCreateAndPublish"
          >
            Publier le test
          </BaseButton>

          <BaseButton variant="primary" type="submit">
            {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le test' }}
          </BaseButton>
        </footer>
      </form>
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

.modal__close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.modal__close:hover {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
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

.form-field-row {
  display: flex;
  gap: 16px;
}

.form-field-row .form-field {
  flex: 1;
}

.form-field input[type='date'] {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 11px 14px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.form-field input[type='date']:focus {
  border-color: var(--color-navy-700);
}

.form-field input[type='text'],
.form-field input[type='url'],
.form-field textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
  resize: vertical;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  border-color: var(--color-navy-700);
}

.form-field__select {
  position: relative;
  display: flex;
  align-items: center;
}

.form-field__select select {
  width: 100%;
  appearance: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 40px 12px 14px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  cursor: pointer;
}

.form-field__caret {
  position: absolute;
  right: 14px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.form-field__with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 14px;
  color: var(--color-text-secondary);
}

.form-field__with-icon input {
  border: none;
  outline: none;
  flex: 1;
  padding: 12px 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.dropzone {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.dropzone:hover,
.dropzone--active {
  border-color: var(--color-navy-700);
  background-color: var(--color-pink-50);
}

.dropzone__title {
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.dropzone__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.dropzone__file {
  margin-top: 6px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-pink-600);
}

.dropzone__input {
  display: none;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
  padding-top: 20px;
}
</style>