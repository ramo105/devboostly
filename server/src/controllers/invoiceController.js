// src/controllers/invoiceController.js
import Invoice from '../models/Invoice.js'
import Order from '../models/Order.js'
import pdfService from '../services/pdfService.js'
import { INVOICE_STATUS } from '../utils/constants.js'

// Synchroniser automatiquement le statut de la facture avec la commande liée
const syncInvoiceStatusWithOrder = (invoice) => {
  const order = invoice.orderId
  if (!order) return false

  const paymentStatus = order.paymentStatus
  const orderStatus = order.status

  let newStatus = invoice.status

  // Si la commande est payée / terminée -> facture payée, sinon en attente
  if (paymentStatus === 'paid' || orderStatus === 'completed') {
    newStatus = 'paid'
  } else {
    newStatus = 'pending'
  }

  if (newStatus !== invoice.status) {
    invoice.status = newStatus
    return true
  }
  return false
}

// GET /api/invoices  (admin)
export const getAllInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = {}
    if (status) query.status = status

    const invoices = await Invoice.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderNumber paymentStatus status')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    // sync statut avec la commande
    const updates = []
    for (const inv of invoices) {
      if (syncInvoiceStatusWithOrder(inv)) {
        updates.push(inv.save())
      }
    }
    if (updates.length) {
      await Promise.all(updates)
    }

    const count = await Invoice.countDocuments(query)

    res.status(200).json({
      success: true,
      count: invoices.length,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: invoices,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/invoices/user  (utilisateur connecté)
export const getUserInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber paymentStatus status')
      .sort({ createdAt: -1 })

    const updates = []
    for (const inv of invoices) {
      if (syncInvoiceStatusWithOrder(inv)) {
        updates.push(inv.save())
      }
    }
    if (updates.length) {
      await Promise.all(updates)
    }

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/invoices/:id
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('orderId', 'orderNumber projectDetails paymentStatus status')

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée' })
    }

    // contrôle d'accès
    if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Accès non autorisé' })
    }

    // sync statut avec la commande
    if (syncInvoiceStatusWithOrder(invoice)) {
      await invoice.save()
    }

    res.status(200).json({ success: true, data: invoice })
  } catch (error) {
    next(error)
  }
}

// POST /api/invoices  (admin)
export const createInvoice = async (req, res, next) => {
  try {
    const { orderId, userId, amount, tax = 0, items = [] } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Commande non trouvée' })
    }

    const total = Number(amount) + Number(tax)

    const invoice = await Invoice.create({
      // si ton modèle a un default pour invoiceNumber, on laisse faire le modèle
      orderId,
      userId: userId || order.userId,
      amount,
      tax,
      total,
      items,
    })

    await invoice.populate('userId orderId')

    res.status(201).json({
      success: true,
      message: 'Facture créée',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/invoices/:id  (admin)
export const updateInvoice = async (req, res, next) => {
  try {
    const { status, amount, tax, items } = req.body

    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée' })
    }

    invoice.status = status || invoice.status
    invoice.amount = typeof amount !== 'undefined' ? amount : invoice.amount
    invoice.tax = typeof tax !== 'undefined' ? tax : invoice.tax
    invoice.items = items || invoice.items

    // recalcul total si montant/taxe changent
    invoice.total = Number(invoice.amount) + Number(invoice.tax)

    if (status === INVOICE_STATUS.PAID && !invoice.paidDate) {
      invoice.paidDate = new Date()
    }

    await invoice.save()

    res.status(200).json({
      success: true,
      message: 'Facture modifiée',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/invoices/:id/pdf  → génère le PDF et renvoie juste l’URL
export const generateInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('orderId', 'orderNumber projectDetails paymentStatus status')

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée' })
    }

    if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Accès non autorisé' })
    }

    // sync statut avec la commande avant génération
    if (syncInvoiceStatusWithOrder(invoice)) {
      await invoice.save()
    }

    const pdfPath = await pdfService.generateInvoice(
      invoice,
      invoice.userId,
      invoice.orderId
    )

    invoice.pdfUrl = pdfPath
    await invoice.save()

    res.status(200).json({
      success: true,
      message: 'PDF généré',
      pdfUrl: pdfPath,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/invoices/:id/download  → si pas de PDF, on le fabrique d’abord
export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('orderId', 'orderNumber projectDetails paymentStatus status')

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée' })
    }

    if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Accès non autorisé' })
    }

    // sync statut avec la commande avant téléchargement
    if (syncInvoiceStatusWithOrder(invoice)) {
      await invoice.save()
    }

    // si pas encore de pdf → on le génère
    if (!invoice.pdfUrl) {
      const pdfPath = await pdfService.generateInvoice(
        invoice,
        invoice.userId,
        invoice.orderId
      )
      invoice.pdfUrl = pdfPath
      await invoice.save()
    }

    return res.download(invoice.pdfUrl)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/invoices/:id  (admin)
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id)

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée' })
    }

    res.status(200).json({ success: true, message: 'Facture supprimée' })
  } catch (error) {
    next(error)
  }
}
