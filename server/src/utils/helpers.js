import crypto from 'crypto'

// Générer un token aléatoire
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

// Générer un numéro unique
export const generateOrderNumber = (prefix, count) => {
  const year = new Date().getFullYear()
  const number = String(count + 1).padStart(5, '0')
  return `${prefix}-${year}-${number}`
}

// Formater un prix
export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Calculer la TVA
export const calculateTax = (amount, taxRate = 0.20) => {
  return amount * taxRate
}

// Générer un slug
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Vérifier si une date est expirée
export const isExpired = (date) => {
  return new Date(date) < new Date()
}

// Ajouter des jours à une date
export const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Masquer l'email
export const maskEmail = (email) => {
  const [name, domain] = email.split('@')
  const maskedName = name.charAt(0) + '***' + name.charAt(name.length - 1)
  return `${maskedName}@${domain}`
}

// Tronquer le texte
export const truncate = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Capitaliser la première lettre
export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Nettoyer les données
export const sanitize = (data) => {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      sanitized[key] = value
    }
  }
  
  return sanitized
}