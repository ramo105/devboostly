import api from '../lib/api'

export const invoiceService = {
  // Récupérer mes factures
  getMyInvoices: async () => {
    const response = await api.get('/invoices/user')
    return response.data
  },

  // Récupérer une facture
  getInvoiceById: async (id) => {
    const response = await api.get(`/invoices/${id}`)
    return response.data
  },

  // Télécharger facture PDF
  downloadInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}