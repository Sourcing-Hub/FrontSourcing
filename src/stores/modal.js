import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false,
    title: '',
    message: '',
    isConfirm: false,
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    variant: 'primary', // 'primary', 'danger', 'success', 'warning'
    resolvePromise: null,
  }),

  actions: {
    showAlert(message, title = 'Information', variant = 'primary') {
      this.title = title
      this.message = message
      this.isConfirm = false
      this.confirmText = 'OK'
      this.variant = variant
      this.isOpen = true

      return new Promise((resolve) => {
        this.resolvePromise = resolve
      })
    },

    showConfirm(message, title = 'Confirmation', options = {}) {
      this.title = title
      this.message = message
      this.isConfirm = true
      this.confirmText = options.confirmText || 'Confirmer'
      this.cancelText = options.cancelText || 'Annuler'
      this.variant = options.variant || 'primary'
      this.isOpen = true

      return new Promise((resolve) => {
        this.resolvePromise = resolve
      })
    },

    error(message, title = 'Erreur') {
      return this.showAlert(message, title, 'danger')
    },

    success(message, title = 'Succès') {
      return this.showAlert(message, title, 'success')
    },

    warning(message, title = 'Attention') {
      return this.showAlert(message, title, 'warning')
    },

    info(message, title = 'Information') {
      return this.showAlert(message, title, 'primary')
    },

    confirm(message, title = 'Confirmation', options = {}) {
      return this.showConfirm(message, title, options)
    },

    accept() {
      if (this.resolvePromise) {
        this.resolvePromise(true)
      }
      this.close()
    },

    cancel() {
      if (this.resolvePromise) {
        this.resolvePromise(false)
      }
      this.close()
    },

    close() {
      this.isOpen = false
      this.title = ''
      this.message = ''
      this.isConfirm = false
      this.resolvePromise = null
    }
  }
})
