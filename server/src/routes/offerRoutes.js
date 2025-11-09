import express from 'express'
import {
  getOffers,
  getOfferById,
  getOfferBySlug,
  createOffer,
  updateOffer,
  deleteOffer,
  getMaintenancePacks,
  getMaintenancePackById,
  createMaintenancePack,
  updateMaintenancePack,
  deleteMaintenancePack
} from '../controllers/offerController.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Routes publiques
router.get('/offers', getOffers)
router.get('/offers/:id', getOfferById)
router.get('/offers/slug/:slug', getOfferBySlug)
router.get('/maintenance-packs', getMaintenancePacks)
router.get('/maintenance-packs/:id', getMaintenancePackById)

// Routes admin
router.post('/offers', protect, admin, createOffer)
router.put('/offers/:id', protect, admin, updateOffer)
router.delete('/offers/:id', protect, admin, deleteOffer)
router.post('/maintenance-packs', protect, admin, createMaintenancePack)
router.put('/maintenance-packs/:id', protect, admin, updateMaintenancePack)
router.delete('/maintenance-packs/:id', protect, admin, deleteMaintenancePack)

export default router