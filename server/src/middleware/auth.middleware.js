import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protéger les routes (vérifier le token JWT)
export const protect = async (req, res, next) => {
  try {
    let token

    // Récupérer le token depuis le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token manquant'
      })
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Récupérer l'utilisateur
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    // Vérifier si l'utilisateur est actif
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      })
    }

    next()
  } catch (error) {
    console.error('Erreur auth middleware:', error)
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, token invalide'
    })
  }
}

// Vérifier si l'utilisateur est admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès refusé - Administrateur requis'
    })
  }
}