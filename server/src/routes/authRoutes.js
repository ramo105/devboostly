import express from 'express'
import {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.middleware.js'
import { registerValidation, loginValidation } from '../utils/validators.js'
import { authLimiter } from '../middleware/rateLimiter.middleware.js'

const router = express.Router()

// Routes publiques
router.post('/register', authLimiter, registerValidation, validate, register)
router.post('/login', authLimiter, loginValidation, validate, login)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', resetPassword)

// Routes protégées
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.put('/update-profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

export default router