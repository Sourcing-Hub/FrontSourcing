import { defineStore } from 'pinia'
import api from '../services/api'
import { parseBackendError } from '../utils/errorHandler'

export const useCandidaturesStore = defineStore('candidatures', {
  state: () => ({
    candidatures: [],
    currentCandidature: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCandidatures(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('candidatures/', { params })
        this.candidatures = response.data
      } catch (err) {
        this.error = parseBackendError(err)
      } finally {
        this.loading = false
      }
    },

    async fetchCandidature(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`candidatures/${id}/`)
        this.currentCandidature = response.data
      } catch (err) {
        this.error = parseBackendError(err)
      } finally {
        this.loading = false
      }
    },

    async soumettreCandidature(payload, filesMap = {}) {
      this.loading = true
      this.error = null
      try {
        const formData = new FormData()
        
        // Append main properties
        formData.append('campagne', payload.campagne)
        
        if (payload.email) formData.append('email', payload.email)
        if (payload.prenom) formData.append('prenom', payload.prenom)
        if (payload.nom) formData.append('nom', payload.nom)
        if (payload.telephone) formData.append('telephone', payload.telephone)
        if (payload.sexe) formData.append('sexe', payload.sexe)
        
        formData.append('reponses', JSON.stringify(payload.reponses))

        // Append files
        for (const [champId, file] of Object.entries(filesMap)) {
          if (file) {
            formData.append(`file_${champId}`, file)
          }
        }

        const response = await api.post('candidatures/soumettre/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
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
