import { defineStore } from 'pinia'
import api from '../services/api'

export const useFormulairesStore = defineStore('formulaires', {
  state: () => ({
    formulaires: [],
    currentFormulaire: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchFormulaires() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('formulaires/')
        this.formulaires = response.data
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erreur lors du chargement des formulaires'
      } finally {
        this.loading = false
      }
    },

    async fetchFormulaire(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`formulaires/${id}/`)
        this.currentFormulaire = response.data
        return response.data
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erreur lors du chargement du formulaire'
        return null
      } finally {
        this.loading = false
      }
    },

    async createFormulaire(data) {
      this.loading = true
      try {
        const response = await api.post('formulaires/', data)
        this.formulaires.unshift(response.data)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erreur lors de la création'
        return null
      } finally {
        this.loading = false
      }
    },

    async updateFormulaire(id, data) {
      try {
        const response = await api.put(`formulaires/${id}/`, data)
        this.currentFormulaire = { ...this.currentFormulaire, ...response.data }
        return response.data
      } catch (err) {
        console.error(err)
        return null
      }
    },

    async deleteFormulaire(id) {
      try {
        await api.delete(`formulaires/${id}/`)
        this.formulaires = this.formulaires.filter((f) => f.id !== id)
        return true
      } catch (err) {
        return false
      }
    },

    // --- Champs ---
    async addField(formulaireId, fieldData) {
      try {
        const response = await api.post(`formulaires/${formulaireId}/champs/`, fieldData)
        if (this.currentFormulaire && this.currentFormulaire.id === formulaireId) {
          if (!this.currentFormulaire.champs) this.currentFormulaire.champs = []
          this.currentFormulaire.champs.push(response.data)
        }
        return response.data
      } catch (err) {
        console.error(err)
        return null
      }
    },

    async updateField(fieldId, fieldData) {
      try {
        const response = await api.put(`formulaires/champs/${fieldId}/`, fieldData)
        if (this.currentFormulaire && this.currentFormulaire.champs) {
          const index = this.currentFormulaire.champs.findIndex(c => c.id === fieldId)
          if (index !== -1) {
            this.currentFormulaire.champs[index] = response.data
          }
        }
        return response.data
      } catch (err) {
        console.error(err)
        return null
      }
    },

    async deleteField(fieldId) {
      try {
        await api.delete(`formulaires/champs/${fieldId}/`)
        if (this.currentFormulaire && this.currentFormulaire.champs) {
          this.currentFormulaire.champs = this.currentFormulaire.champs.filter(c => c.id !== fieldId)
        }
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },

    async reorderFields(formulaireId, fieldsIdsOrdered) {
      try {
        await api.post(`formulaires/${formulaireId}/reorganiser-champs/`, {
          ordre: fieldsIdsOrdered
        })
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },

    // --- Options ---
    async addOption(fieldId, optionData) {
      try {
        const response = await api.post(`formulaires/champs/${fieldId}/options/`, optionData)
        if (this.currentFormulaire && this.currentFormulaire.champs) {
          const field = this.currentFormulaire.champs.find(c => c.id === fieldId)
          if (field) {
            if (!field.options) field.options = []
            field.options.push(response.data)
          }
        }
        return response.data
      } catch (err) {
        console.error(err)
        return null
      }
    },

    async updateOption(optionId, optionData) {
      try {
        const response = await api.put(`formulaires/options/${optionId}/`, optionData)
        if (this.currentFormulaire && this.currentFormulaire.champs) {
          this.currentFormulaire.champs.forEach(field => {
            if (field.options) {
              const idx = field.options.findIndex(o => o.id === optionId)
              if (idx !== -1) {
                field.options[idx] = response.data
              }
            }
          })
        }
        return response.data
      } catch (err) {
        console.error(err)
        return null
      }
    },

    async deleteOption(optionId) {
      try {
        await api.delete(`formulaires/options/${optionId}/`)
        if (this.currentFormulaire && this.currentFormulaire.champs) {
          this.currentFormulaire.champs.forEach(field => {
            if (field.options) {
              field.options = field.options.filter(o => o.id !== optionId)
            }
          })
        }
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },
  },
})
