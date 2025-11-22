import rateLimit from 'express-rate-limit'

// Vérifier si on est en développement
const isDev = process.env.NODE_ENV === 'development'

// Limiter général - BEAUCOUP PLUS SOUPLE en dev
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 500, // 10000 en dev, 500 en production
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Ne pas compter les requêtes réussies en développement
  skipSuccessfulRequests: isDev,
})

// Limiter pour l'authentification - Plus souple en dev
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 5, // 100 tentatives en dev, 5 en prod
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  skipSuccessfulRequests: true,
})

// Limiter pour les emails - Plus souple en dev
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: isDev ? 50 : 5, // 50 emails en dev, 3 en prod
  message: {
    success: false,
    message: 'Trop d\'emails envoyés, veuillez réessayer plus tard'
  },
})

// NOUVEAU: Limiter pour les API calls (très souple en dev)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 1500 : 90, // 1000/min en dev, 60/min en prod
  message: {
    success: false,
    message: 'Trop de requêtes API, ralentissez'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: isDev,
})