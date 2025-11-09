import api from '../lib/api'

export const quoteService = {
  // Demander un devis
  createQuote: async (quoteData) => {
    const response = await api.post('/quotes', quoteData)
    return response.data
  },
  async getMyQuotes() {
    // ⚠️ Protégé : nécessite Authorization: Bearer <token>
    const { data } = await api.get('/quotes/user')
    // Normaliser: renvoyer toujours un tableau
    return Array.isArray(data) ? data : (data?.data || [])
  },
  // Récupérer un devis
  getQuoteById: async (id) => {
    const response = await api.get(`/quotes/${id}`)
    return response.data
  },
}