// server/src/routes/analyticsRoutes.js
import express from 'express'
import { protect, admin } from '../middleware/auth.middleware.js'
import { getAnalytics } from '../middleware/analytics.middleware.js'

const router = express.Router()

// Route pour obtenir les analytics (admin seulement)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { period = '7' } = req.query

    const now = new Date()
    const startDate = new Date()

    // Calculer la date de début selon la période
    switch (period) {
      case '7':
        startDate.setDate(now.getDate() - 7)
        break
      case '30':
        startDate.setDate(now.getDate() - 30)
        break
      case '90':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    startDate.setHours(0, 0, 0, 0)

    const analytics = await getAnalytics(startDate, now)

    return res.status(200).json({
      success: true,
      period: parseInt(period),
      data: analytics,
    })
  } catch (error) {
    console.error('Erreur route analytics:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    })
  }
})

export default router