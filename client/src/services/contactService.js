import api from '../lib/api'

export const contactService = {
  // Envoyer message contact
  sendMessage: async (messageData) => {
    const response = await api.post('/contact', messageData)
    return response.data
  },
}