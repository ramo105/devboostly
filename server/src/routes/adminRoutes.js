import express from 'express'
import {
  getDashboardStats,
  getStats,
  exportData,
  getAdminNotifications,
  getSystemLogs,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Toutes les routes sont protégées et réservées aux admins
router.use(protect, admin)

router.get('/dashboard', getDashboardStats)
router.get('/stats', getStats)
router.get('/export', exportData)
router.get('/notifications', getAdminNotifications)
router.get('/logs', getSystemLogs)
router.get('/settings', getSystemSettings)
router.put('/settings', updateSystemSettings)

export default router