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
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      // Token expiré ou invalide
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expirée, veuillez vous reconnecter',
          code: 'TOKEN_EXPIRED'
        })
      }
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'TOKEN_INVALID'
      })
    }

    // Récupérer l'utilisateur
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      })
    }

    // Vérifier si l'utilisateur est actif
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
        code: 'ACCOUNT_DISABLED'
      })
    }

    next()
  } catch (error) {
    console.error('Erreur auth middleware:', error)
    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification',
      code: 'AUTH_ERROR'
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
      message: 'Accès refusé - Administrateur requis',
      code: 'ADMIN_REQUIRED'
    })
  }
}

// NOUVEAU: Middleware optionnel (ne bloque pas si pas de token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
      } catch (error) {
        // Ignore l'erreur, l'utilisateur ne sera juste pas connecté
        req.user = null
      }
    }

    next()
  } catch (error) {
    next()
  }
}