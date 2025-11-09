import api from '../lib/api'

export const paymentService = {
  // Créer ordre PayPal
  createPayPalOrder: async (orderData) => {
    const response = await api.post('/payments/create-order', orderData)
    return response.data
  },

  // Capturer paiement
  capturePayment: async (orderId) => {
    const response = await api.post('/payments/capture-order', { orderId })
    return response.data
  },

  // Vérifier statut paiement
  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/${orderId}/status`)
    return response.data
  },
}