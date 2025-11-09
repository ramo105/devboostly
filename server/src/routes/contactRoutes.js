import express from 'express'
import {
  sendContactMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage
} from '../controllers/contactController.js'
import { protect, admin } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.middleware.js'
import { contactValidation } from '../utils/validators.js'
import { emailLimiter } from '../middleware/rateLimiter.middleware.js'

const router = express.Router()

// Routes publiques
router.post('/', emailLimiter, contactValidation, validate, sendContactMessage)

// Routes admin
router.get('/', protect, admin, getAllMessages)
router.get('/:id', protect, admin, getMessageById)
router.put('/:id/status', protect, admin, updateMessageStatus)
router.delete('/:id', protect, admin, deleteMessage)

export default router