import express from 'express'
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  initDepositPayment,
  initBalancePayment,
  stripeWebhook,
  confirmDepositPayment,
  confirmBalancePayment,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.middleware.js'
import { orderValidation } from '../utils/validators.js'

const router = express.Router()

// Routes protegees
router.post('/', protect, createOrder)
router.get('/user', protect, getUserOrders)

// Routes de paiement
router.post('/:id/pay-deposit', protect, initDepositPayment)
router.post('/:id/pay-balance', protect, initBalancePayment)

// Routes de confirmation (solution alternative sans webhook)
router.post('/:id/confirm-deposit', protect, confirmDepositPayment)
router.post('/:id/confirm-balance', protect, confirmBalancePayment)

router.get('/:id', protect, getOrderById)
router.delete('/:id', protect, cancelOrder)

// Routes admin
router.get('/', protect, admin, getAllOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

export default router