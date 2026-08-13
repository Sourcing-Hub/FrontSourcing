import { defineStore } from 'pinia'
import api from '../services/api'
import { parseBackendError } from '../utils/errorHandler'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('sourcing_token') || null,
    user: JSON.parse(localStorage.getItem('sourcing_user')) || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'Administrateur',
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('auth/connexion/', {
          username: email,
          password: password,
        })

        // Simple JWT returns access token
        this.token = response.data.access
        localStorage.setItem('sourcing_token', this.token)

        // Pour cet exemple, on décode le JWT ou on fetch le profil
        // Le serializer JWT que nous avons codé inclut nom, prenom, role dans les claims
        const tokenPayload = JSON.parse(atob(this.token.split('.')[1]))

        this.user = {
          id: tokenPayload.user_id,
          nom: tokenPayload.nom,
          prenom: tokenPayload.prenom,
          role: tokenPayload.role,
          profilComplet: tokenPayload.profilComplet,
        }
        localStorage.setItem('sourcing_user', JSON.stringify(this.user))

        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('sourcing_token')
      localStorage.removeItem('sourcing_user')
      // Redirection optionnelle si appelée depuis un composant
    },

    async activateAccount(token, password, confirmPassword) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('auth/activer/', {
          token: token,
          mot_de_passe: password,
          mot_de_passe_confirmation: confirmPassword
        })
        return response.data
      } catch (err) {
        this.error = parseBackendError(err)
        return null
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put('utilisateurs/mon-profil/', profileData)
        
        // Update user state and local storage with new info
        this.user = {
          ...this.user,
          ...response.data,
          profilComplet: true
        }
        localStorage.setItem('sourcing_user', JSON.stringify(this.user))
        
        return true
      } catch (err) {
        this.error = parseBackendError(err)
        return false
      } finally {
        this.loading = false
      }
    }
  },
})
