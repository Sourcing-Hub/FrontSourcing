import { defineStore } from 'pinia'
import api from '../services/api'
import { parseBackendError } from '../utils/errorHandler'

/**
 * Store Pinia pour l'administration et le suivi des comptes utilisateurs/personnel.
 */
export const useUtilisateursStore = defineStore('utilisateurs', {
  state: () => ({
    utilisateurs: [],
    loading: false,
    error: null,
  }),

  getters: {
    adminUsers: (state) => state.utilisateurs.filter((u) => u.role_nom === 'Administrateur'),
    pedagogieUsers: (state) => state.utilisateurs.filter((u) => u.role_nom === 'Équipe Pédagogique'),
    gestionUsers: (state) => state.utilisateurs.filter((u) => u.role_nom === 'Équipe Gestion de Projet'),
  },

  actions: {
    async fetchUtilisateurs() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('utilisateurs/')
        this.utilisateurs = response.data
      } catch (err) {
        this.error = parseBackendError(err)
      } finally {
        this.loading = false
      }
    },

    async createPersonnel(data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('utilisateurs/creer-personnel/', data)
        // Re-fetch users to get the full object including IDs and dates
        await this.fetchUtilisateurs()
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async toggleBlockUser(id, blockAction) {
      this.loading = true
      this.error = null
      try {
        const response = await api.patch(`utilisateurs/${id}/`, { action: blockAction })
        await this.fetchUtilisateurs()
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.delete(`utilisateurs/${id}/`)
        await this.fetchUtilisateurs()
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
