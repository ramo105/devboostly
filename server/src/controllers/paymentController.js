import Order from '../models/Order.js'
import paypalService from '../services/paypalService.js'
import { logger } from '../utils/logger.js'
import { ORDER_STATUS } from '../utils/constants.js'

// @desc    Créer ordre PayPal
// @route   POST /api/payments/create-order
// @access  Private
export const createPayPalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body

    // Récupérer la commande
    const order = await Order.findById(orderId).populate('offerId')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      })
    }

    // Vérifier propriétaire
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    // Créer l'ordre PayPal
    const paypalOrder = await paypalService.createOrder(
      order.amount,
      'EUR',
      `Commande ${order.orderNumber} - ${order.offerId.name}`
    )

    res.status(200).json({
      success: true,
      data: paypalOrder
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Capturer paiement PayPal
// @route   POST /api/payments/capture-order
// @access  Private
export const capturePayPalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body

    // Capturer le paiement
    const capture = await paypalService.capturePayment(orderId)

    // Mettre à jour la commande
    const order = await Order.findOne({ paymentId: orderId })
    
    if (order) {
      order.status = ORDER_STATUS.PAID
      order.paymentId = capture.id
      await order.save()
    }

    res.status(200).json({
      success: true,
      message: 'Paiement capturé',
      data: capture
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Vérifier statut paiement
// @route   GET /api/payments/:orderId/status
// @access  Private
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params

    const orderDetails = await paypalService.getOrderDetails(orderId)

    res.status(200).json({
      success: true,
      data: {
        id: orderDetails.id,
        status: orderDetails.status
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Webhook PayPal
// @route   POST /api/payments/webhook
// @access  Public
export const paypalWebhook = async (req, res, next) => {
  try {
    const event = req.body

    logger.info(`PayPal Webhook: ${event.event_type}`)

    // Traiter selon le type d'événement
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Paiement complété
        const captureId = event.resource.id
        
        const order = await Order.findOne({ paymentId: captureId })
        if (order && order.status !== ORDER_STATUS.PAID) {
          order.status = ORDER_STATUS.PAID
          await order.save()
          logger.info(`Commande ${order.orderNumber} marquée comme payée`)
        }
        break

      case 'PAYMENT.CAPTURE.DENIED':
        // Paiement refusé
        logger.warn('Paiement refusé')
        break

      default:
        logger.info(`Événement non géré: ${event.event_type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    logger.error(`Erreur webhook PayPal: ${error.message}`)
    res.status(500).json({ error: 'Webhook error' })
  }
}