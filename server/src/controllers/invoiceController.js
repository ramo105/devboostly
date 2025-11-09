import Invoice from '../models/Invoice.js'
import Order from '../models/Order.js'
import pdfService from '../services/pdfService.js'
import { logger } from '../utils/logger.js'
import { INVOICE_STATUS } from '../utils/constants.js'

// @desc    Récupérer toutes les factures
// @route   GET /api/invoices
// @access  Private/Admin
export const getAllInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = {}
    if (status) query.status = status

    const invoices = await Invoice.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Invoice.countDocuments(query)

    res.status(200).json({
      success: true,
      count: invoices.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: invoices
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer factures utilisateur
// @route   GET /api/invoices/user
// @access  Private
export const getUserInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer une facture
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('orderId', 'orderNumber projectDetails')

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      })
    }

    // Vérifier propriétaire ou admin
    if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    res.status(200).json({
      success: true,
      data: invoice
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Créer facture
// @route   POST /api/invoices
// @access  Private/Admin
export const createInvoice = async (req, res, next) => {
  try {
    const { orderId, userId, amount, tax, items } = req.body

    // Vérifier que la commande existe
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      })
    }

    const total = amount + tax

    const invoice = await Invoice.create({
      orderId,
      userId: userId || order.userId,
      amount,
      tax,
      total,
      items
    })

    await invoice.populate('userId orderId')

    res.status(201).json({
      success: true,
      message: 'Facture créée',
      data: invoice
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier facture
// @route   PUT /api/invoices/:id
// @access  Private/Admin
export const updateInvoice = async (req, res, next) => {
  try {
    const { status, amount, tax, items } = req.body

    const invoice = await Invoice.findById(req.params.id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      })
    }

    invoice.status = status || invoice.status
    invoice.amount = amount || invoice.amount
    invoice.tax = tax || invoice.tax
    invoice.items = items || invoice.items

    if (amount || tax) {
      invoice.total = (amount || invoice.amount) + (tax || invoice.tax)
    }

    if (status === INVOICE_STATUS.PAID && !invoice.paidDate) {
      invoice.paidDate = new Date()
    }

    await invoice.save()

    res.status(200).json({
      success: true,
      message: 'Facture modifiée',
      data: invoice
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Générer PDF facture
// @route   GET /api/invoices/:id/pdf
// @access  Private
export const generateInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('orderId', 'orderNumber projectDetails')

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      })
    }

    // Vérifier propriétaire ou admin
    if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    const pdfPath = await pdfService.generateInvoice(invoice, invoice.userId, invoice.orderId)

    invoice.pdfUrl = pdfPath
    await invoice.save()

    res.status(200).json({
      success: true,
      message: 'PDF généré',
      pdfUrl: pdfPath
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Télécharger PDF facture
// @route   GET /api/invoices/:id/download
// @access  Private
export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      })
    }

    // Vérifier propriétaire ou admin
    if (invoice.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    if (!invoice.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'PDF non disponible'
      })
    }

    res.download(invoice.pdfUrl)
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer facture
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Facture supprimée'
    })
  } catch (error) {
    next(error)
  }
}