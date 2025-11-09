import api from '../lib/api'

export const orderService = {
  // Créer une commande
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  // Récupérer mes commandes
  getMyOrders: async () => {
    const response = await api.get('/orders/user')
    return response.data
  },

  // Récupérer une commande
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  // Annuler une commande
  cancelOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  },
}