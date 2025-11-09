import express from 'express'
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPaymentStatus,
  paypalWebhook
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Routes protégées
router.post('/create-order', protect, createPayPalOrder)
router.post('/capture-order', protect, capturePayPalOrder)
router.get('/:orderId/status', protect, getPaymentStatus)

// Webhook PayPal (public)
router.post('/webhook', paypalWebhook)

export default router