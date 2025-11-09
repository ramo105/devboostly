import express from 'express'
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.middleware.js'
import { orderValidation } from '../utils/validators.js'

const router = express.Router()

// Routes protégées
router.post('/', protect, orderValidation, validate, createOrder)
router.get('/user', protect, getUserOrders)
router.get('/:id', protect, getOrderById)
router.delete('/:id', protect, cancelOrder)

// Routes admin
router.get('/', protect, admin, getAllOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

export default router