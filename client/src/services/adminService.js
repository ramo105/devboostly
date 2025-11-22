// src/services/adminService.js
import api from '../lib/api'

// tout ce qui est réservé au dashboard admin
export const adminService = {
  // stats pour "vue d'ensemble" admin
  getDashboard() {
    return api.get('/admin/dashboard')
  },
  getStats(params) {
    return api.get('/admin/stats', { params })
  },


  // liste de tous les utilisateurs/clients
  getUsers: async () => {
    // GET /api/admin/users
    const res = await api.get('/admin/users')
    return res.data
  },

  // un seul user (si tu veux afficher la fiche)
 async getUsers(params) {
    const res = await api.get('/users', { params })
    // ton back renvoie un truc du style { success, count, data: [...] }
    return res.data
  },
  async getUserHistory(id) {
    const res = await api.get(`/users/${id}/history`)
    return res.data
  },
  createUser(payload) {
    // { firstName, lastName, email, password, role, phone, address }
    return api.post('/users', payload)
  },
  updateUser(id, payload) {
    return api.put(`/users/${id}`, payload)
  },
  deleteUser(id) {
    return api.delete(`/users/${id}`)
  },
  toggleUserActive(id) {
    return api.patch(`/users/${id}/toggle-active`)
  },
  changeUserRole(id, role) {
    return api.patch(`/users/${id}/role`, { role })
  },
  adminResetPassword(id, newPassword) {
    return api.post(`/users/${id}/reset-password`, { newPassword })
  },
  // historique commandes d’un user
  getUserOrders: async (userId) => {
    // GET /api/admin/users/:id/orders
    const res = await api.get(`/admin/users/${userId}/orders`)
    return res.data
  },

  // historique factures d’un user
  getUserInvoices: async (userId) => {
    // GET /api/admin/users/:id/invoices
    const res = await api.get(`/admin/users/${userId}/invoices`)
    return res.data
  },
  async getAllQuotes() {
    const res = await api.get('/admin/export', {
      params: { type: 'quotes' },
    })
    
    return res.data?.data || []
  },
  async updateQuoteStatus(quoteId, status) {
    const res = await api.put(`/quotes/${quoteId}/status`, { status })
    return res.data
  },
  // si tu veux forcer la génération/téléchargement d’une facture côté admin
  downloadInvoice: async (invoiceId) => {
    // GET /api/invoices/:id/download
    const res = await api.get(`/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    })
    return res.data
  },
}