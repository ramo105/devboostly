import api from '../lib/api'

class AuthService {
  // Inscription
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  }

  // Connexion
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  }

  // Récupérer utilisateur connecté
  async getMe() {
    const response = await api.get('/auth/me')
    return response.data.data
  }

  // Déconnexion
  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  }

  // Mot de passe oublié
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  }

  // Réinitialiser mot de passe
  async resetPassword(token, password) {
    const response = await api.post(`/auth/reset-password/${token}`, { password })
    return response.data
  }

  // Mettre à jour profil
  async updateProfile(userData) {
    const response = await api.put('/auth/update-profile', userData)
    return response.data
  }

  // Changer mot de passe
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  }
}

export const authService = new AuthService()