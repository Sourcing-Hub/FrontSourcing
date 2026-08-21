import api from './api'

/**
 * Service API pour SourcingChat IA de SourcingHub.
 */
export const sourcingChatService = {
  /**
   * Envoie une question à l'assistant IA SourcingChat
   * @param {string} question - Le message / la question de l'utilisateur
   * @returns {Promise<{response: string, provider?: string, warning?: string}>}
   */
  async sendMessage(question) {
    const res = await api.post('sourcingchat/chat/', { question })
    return res.data
  },

  /**
   * Récupère les suggestions de questions rapides
   * @returns {Promise<{suggestions: string[]}>}
   */
  async getSuggestions() {
    const res = await api.get('sourcingchat/suggestions/')
    return res.data
  },
}

export default sourcingChatService
