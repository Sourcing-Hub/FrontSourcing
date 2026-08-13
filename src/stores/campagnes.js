import { defineStore } from 'pinia'
import api from '../services/api'
import { parseBackendError } from '../utils/errorHandler'

export const useCampagnesStore = defineStore('campagnes', {
  state: () => ({
    campagnes: [],
    formations: [],
    cohortes: [],
    loading: false,
    error: null,
  }),

  getters: {
    getCampagneById: (state) => (id) => state.campagnes.find((c) => c.id === id),
    activeCampagnes: (state) => state.campagnes.filter((c) => c.statut === 'OUVERTE'),
  },

  actions: {
    async fetchCampagnes() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('campagnes/')
        this.campagnes = response.data
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erreur lors de la récupération des campagnes'
      } finally {
        this.loading = false
      }
    },

    async fetchFormations() {
      try {
        const response = await api.get('campagnes/formations/')
        this.formations = response.data
      } catch (err) {
        console.error(err)
      }
    },

    async createFormation(formationData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('campagnes/formations/', formationData)
        this.formations.unshift(response.data)
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async updateFormation(id, formationData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`campagnes/formations/${id}/`, formationData)
        const index = this.formations.findIndex((f) => f.id === id)
        if (index !== -1) {
          this.formations[index] = response.data
        }
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteFormation(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`campagnes/formations/${id}/`)
        this.formations = this.formations.filter((f) => f.id !== id)
        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchCohortes(formationId = null) {
      try {
        const url = formationId
          ? `campagnes/cohortes/?formation=${formationId}`
          : 'campagnes/cohortes/'
        const response = await api.get(url)
        this.cohortes = response.data
      } catch (err) {
        console.error(err)
      }
    },

    async createCohorte(cohorteData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('campagnes/cohortes/', cohorteData)
        this.cohortes.unshift(response.data)
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async updateCohorte(id, cohorteData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`campagnes/cohortes/${id}/`, cohorteData)
        const index = this.cohortes.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.cohortes[index] = response.data
        }
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteCohorte(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`campagnes/cohortes/${id}/`)
        this.cohortes = this.cohortes.filter((c) => c.id !== id)
        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async createCampagne(campagneData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('campagnes/', campagneData)
        this.campagnes.unshift(response.data)
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async updateCampagneStatus(id, action) {
      try {
        // action peut être 'ouvrir', 'fermer'
        await api.post(`campagnes/${id}/${action}/`)
        await this.fetchCampagnes() // Rafraîchir la liste complète
        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      }
    },

    async deleteCampagne(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`campagnes/${id}/`)
        this.campagnes = this.campagnes.filter((c) => c.id !== id)
        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
