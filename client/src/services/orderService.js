import api from '../lib/api'

export const orderService = {
  // Créer une commande
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Erreur createOrder service:', error)
      throw error
    }
  },

  // Récupérer mes commandes (utilisateur connecté)
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders/user')
      return response.data
    } catch (error) {
      console.error('Erreur getUserOrders service:', error)
      throw error
    }
  },

  // Alias pour compatibilité
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/user')
      return response.data
    } catch (error) {
      console.error('Erreur getMyOrders service:', error)
      throw error
    }
  },

  // Récupérer une commande par ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Erreur getOrderById service:', error)
      throw error
    }
  },

  // Annuler une commande
  cancelOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Erreur cancelOrder service:', error)
      throw error
    }
  },

  // Initialiser le paiement de l'acompte (40%)
  initDepositPayment: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/pay-deposit`)
      return response.data
    } catch (error) {
      console.error('Erreur initDepositPayment service:', error)
      throw error
    }
  },

  // Confirmer le paiement de l'acompte
  confirmDepositPayment: async (orderId, paymentIntentId) => {
    try {
      const response = await api.post(`/orders/${orderId}/confirm-deposit`, {
        orderId,
        paymentIntentId
      })
      return response.data
    } catch (error) {
      console.error('Erreur confirmDepositPayment service:', error)
      throw error
    }
  },

  // Initialiser le paiement du solde (60%)
  initBalancePayment: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/pay-balance`)
      return response.data
    } catch (error) {
      console.error('Erreur initBalancePayment service:', error)
      throw error
    }
  },

  // Confirmer le paiement du solde
  confirmBalancePayment: async (orderId, paymentIntentId) => {
    try {
      const response = await api.post(`/orders/${orderId}/confirm-balance`, {
        orderId,
        paymentIntentId
      })
      return response.data
    } catch (error) {
      console.error('Erreur confirmBalancePayment service:', error)
      throw error
    }
  },
}