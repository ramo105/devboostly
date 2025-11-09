// Statuts de commande
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Statuts de projet
export const PROJECT_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold'
}

// Statuts de devis
export const QUOTE_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
}

// Statuts de facture
export const INVOICE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue'
}

// Statuts de message contact
export const CONTACT_STATUS = {
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
  ARCHIVED: 'archived'
}

// Rôles utilisateur
export const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

// Types d'offres
export const OFFER_TYPES = {
  VITRINE: 'vitrine',
  ECOMMERCE: 'ecommerce',
  SURMESURE: 'surmesure',
  MAINTENANCE: 'maintenance'
}

// Période de facturation
export const BILLING_PERIOD = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
}

// Méthodes de paiement
export const PAYMENT_METHODS = {
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  BANK_TRANSFER: 'bank_transfer'
}

// Devise
export const CURRENCY = 'EUR'

// TVA par défaut
export const DEFAULT_TAX_RATE = 0.20 // 20%

// Délai d'expiration du token de réinitialisation
export const RESET_PASSWORD_EXPIRE = 3600000 // 1 heure en ms

// Limite de fichiers
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Extensions autorisées
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]