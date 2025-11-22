import express from 'express'
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  changeUserRole,
  adminResetPassword ,getUserHistory,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Toutes les routes sont protégées et réservées aux admins
router.use(protect, admin)

router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.get('/:id/history', protect, admin, getUserHistory)
router.patch('/:id/toggle-active', toggleUserActive)
router.patch('/:id/role', changeUserRole)
router.post('/:id/reset-password', adminResetPassword)

export default router