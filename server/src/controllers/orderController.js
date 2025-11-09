import Order from '../models/Order.js'
import Invoice from '../models/Invoice.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import Offer from '../models/Offer.js'
import emailService from '../services/emailService.js'
import pdfService from '../services/pdfService.js'
import { logger } from '../utils/logger.js'
import { ORDER_STATUS, INVOICE_STATUS } from '../utils/constants.js'

// @desc    Créer une commande
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { offerId, amount, projectDetails, billingInfo } = req.body

    // Vérifier l'offre
    const offer = await Offer.findById(offerId)
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      })
    }

    // Créer la commande
    const order = await Order.create({
      userId: req.user.id,
      offerId,
      amount,
      projectDetails,
      billingInfo: billingInfo || {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
      }
    })

    // Peupler les données
    await order.populate('userId offerId')

    res.status(201).json({
      success: true,
      message: 'Commande créée',
      data: order
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer toutes les commandes
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .populate('offerId', 'name type price')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer commandes utilisateur
// @route   GET /api/orders/user
// @access  Private
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('offerId', 'name type price')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer une commande
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('offerId', 'name type price features')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      })
    }

    // Vérifier propriétaire ou admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier statut commande
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('offerId', 'name type price')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      })
    }

    order.status = status
    await order.save()

    // Si la commande est payée, créer facture et projet
    if (status === ORDER_STATUS.PAID) {
      // Créer facture
      const tax = order.amount * 0.20
      const total = order.amount + tax

      const invoice = await Invoice.create({
        orderId: order._id,
        userId: order.userId._id,
        amount: order.amount,
        tax,
        total,
        status: INVOICE_STATUS.PAID,
        paidDate: new Date(),
        items: [{
          description: order.offerId.name,
          quantity: 1,
          unitPrice: order.amount,
          total: order.amount
        }]
      })

      // Générer PDF facture
      try {
        const pdfPath = await pdfService.generateInvoice(invoice, order.userId, order)
        invoice.pdfUrl = pdfPath
        await invoice.save()
      } catch (error) {
        logger.error(`Erreur génération PDF facture: ${error.message}`)
      }

      // Créer projet
      await Project.create({
        orderId: order._id,
        userId: order.userId._id,
        name: `${order.offerId.name} - ${order.userId.firstName} ${order.userId.lastName}`,
        description: order.projectDetails.description
      })

      // Envoyer email confirmation
      try {
        await emailService.sendOrderConfirmation(order, order.userId)
      } catch (error) {
        logger.error(`Erreur envoi email confirmation: ${error.message}`)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      data: order
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Annuler une commande
// @route   DELETE /api/orders/:id
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      })
    }

    // Vérifier propriétaire
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    // Vérifier si annulable
    if (order.status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut pas être annulée'
      })
    }

    order.status = ORDER_STATUS.CANCELLED
    await order.save()

    res.status(200).json({
      success: true,
      message: 'Commande annulée'
    })
  } catch (error) {
    next(error)
  }
}