import express from 'express'
import {
  createQuote,
  getAllQuotes,
  getUserQuotes,
  getQuoteById,
  updateQuoteStatus,
  generateQuotePDF,
  deleteQuote
} from '../controllers/quoteController.js'
import { protect, admin } from '../middleware/auth.middleware.js'

// ⚠️ On retire les validators agressifs qui renvoyaient 400 génériques
// import { validate } from '../middleware/validation.middleware.js'
// import { quoteValidation } from '../utils/validators.js'
import { emailLimiter } from '../middleware/rateLimiter.middleware.js'

const router = express.Router()

// Routes publiques/protégées
router.post('/', emailLimiter, /*quoteValidation, validate,*/ createQuote)
router.get('/user', protect, getUserQuotes)
router.get('/:id', protect, getQuoteById)

// Routes admin
router.get('/', protect, admin, getAllQuotes)
router.put('/:id/status', protect, admin, updateQuoteStatus)
router.get('/:id/pdf', protect, admin, generateQuotePDF)
router.delete('/:id', protect, admin, deleteQuote)

export default router
