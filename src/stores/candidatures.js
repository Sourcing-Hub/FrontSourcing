import { defineStore } from 'pinia'
import api from '../services/api'

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
        this.error = err.response?.data?.detail || 'Erreur lors du chargement des candidatures'
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
        this.error = err.response?.data?.detail || 'Erreur lors du chargement de la candidature'
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
        if (err.response?.data?.detail) {
          this.error = err.response.data.detail
        } else if (err.response?.data) {
          // Flatten dictionary errors (e.g. required field missing)
          const messages = []
          for (const key in err.response.data) {
            messages.push(`${key}: ${err.response.data[key]}`)
          }
          this.error = messages.join(' | ')
        } else {
          this.error = 'Erreur lors de la soumission de la candidature'
        }
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
