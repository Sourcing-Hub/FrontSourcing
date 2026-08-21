import { defineStore } from 'pinia'
import api from '../services/api'
import { parseBackendError } from '../utils/errorHandler'

export const usePlanningsStore = defineStore('plannings', {
  state: () => ({ plannings: [], loading: false, error: null }),
  actions: {
    async fetchPlannings(etape = '') {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('evaluations/plannings/', { params: etape ? { etape } : {} })
        this.plannings = response.data
      } catch (err) {
        this.error = parseBackendError(err)
      } finally {
        this.loading = false
      }
    },
    async createPlanning(data) {
      return this._save(() => api.post('evaluations/plannings/', data), 'create')
    },
    async configurePlannings(data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('evaluations/plannings/configurer/', data)
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },
    async fetchEncadrants() {
      try {
        const response = await api.get('evaluations/plannings/encadrants/')
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return []
      }
    },
    async fetchConvocationCandidats(planningId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('evaluations/convocations/candidats/', { params: { planning: planningId } })
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },
    async assignerCandidats(planningId, candidatureIds) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('evaluations/convocations/affecter/', {
          planning: planningId,
          candidatures: candidatureIds,
        })
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },
    async updatePlanning(id, data) {
      return this._save(() => api.put(`evaluations/plannings/${id}/`, data), 'update')
    },
    async deletePlanning(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`evaluations/plannings/${id}/`)
        this.plannings = this.plannings.filter((planning) => planning.id !== id)
        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      } finally {
        this.loading = false
      }
    },
    async _save(request, mode) {
      this.loading = true
      this.error = null
      try {
        const response = await request()
        const index = this.plannings.findIndex((planning) => planning.id === response.data.id)
        if (mode === 'create') this.plannings.unshift(response.data)
        else if (index !== -1) this.plannings[index] = response.data
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
