import api from '../lib/api'

export const offerService = {
  // Récupérer toutes les offres
  getAllOffers: async () => {
    const response = await api.get('/offers')
    return response.data
  },

  // Récupérer une offre
  getOfferById: async (id) => {
    const response = await api.get(`/offers/${id}`)
    return response.data
  },

  // Récupérer offre par slug
  getOfferBySlug: async (slug) => {
    const response = await api.get(`/offers/slug/${slug}`)
    return response.data
  },

  // Récupérer packs maintenance
  getMaintenancePacks: async () => {
    const response = await api.get('/maintenance-packs')
    return response.data
  },

  // Récupérer pack par ID
  getMaintenancePackById: async (id) => {
    const response = await api.get(`/maintenance-packs/${id}`)
    return response.data
  },
}