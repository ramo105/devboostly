import express from 'express'
import {
  getAllInvoices,
  getUserInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  generateInvoicePDF,
  downloadInvoicePDF,
  deleteInvoice
} from '../controllers/invoiceController.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Routes protégées
router.get('/user', protect, getUserInvoices)
router.get('/:id', protect, getInvoiceById)
router.get('/:id/pdf', protect, generateInvoicePDF)
router.get('/:id/download', protect, downloadInvoicePDF)

// Routes admin
router.get('/', protect, admin, getAllInvoices)
router.post('/', protect, admin, createInvoice)
router.put('/:id', protect, admin, updateInvoice)
router.delete('/:id', protect, admin, deleteInvoice)

export default router