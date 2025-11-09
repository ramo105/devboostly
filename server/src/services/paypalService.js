import paypalClient from '../config/paypal.js'
import checkoutNodeJssdk from '@paypal/checkout-server-sdk'
import { logger } from '../utils/logger.js'

class PayPalService {
  // Créer un ordre PayPal
  async createOrder(amount, currency = 'EUR', description = 'Commande Devboostly') {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersCreateRequest()
      request.prefer('return=representation')
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            },
            description: description
          }
        ],
        application_context: {
          brand_name: 'Devboostly',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.CLIENT_URL}/payment-success`,
          cancel_url: `${process.env.CLIENT_URL}/payment-cancel`
        }
      })

      const order = await paypalClient().execute(request)
      logger.info(`Ordre PayPal créé: ${order.result.id}`)
      
      return {
        id: order.result.id,
        status: order.result.status,
        links: order.result.links
      }
    } catch (error) {
      logger.error(`Erreur création ordre PayPal: ${error.message}`)
      throw new Error('Erreur lors de la création de l\'ordre PayPal')
    }
  }

  // Capturer le paiement
  async capturePayment(orderId) {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId)
      request.requestBody({})

      const capture = await paypalClient().execute(request)
      logger.info(`Paiement PayPal capturé: ${orderId}`)
      
      return {
        id: capture.result.id,
        status: capture.result.status,
        payer: capture.result.payer,
        purchase_units: capture.result.purchase_units
      }
    } catch (error) {
      logger.error(`Erreur capture paiement PayPal: ${error.message}`)
      throw new Error('Erreur lors de la capture du paiement')
    }
  }

  // Récupérer les détails d'un ordre
  async getOrderDetails(orderId) {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId)
      const order = await paypalClient().execute(request)
      
      return order.result
    } catch (error) {
      logger.error(`Erreur récupération ordre PayPal: ${error.message}`)
      throw new Error('Erreur lors de la récupération de l\'ordre')
    }
  }

  // Rembourser un paiement
  async refundPayment(captureId, amount = null, currency = 'EUR') {
    try {
      const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId)
      
      if (amount) {
        request.requestBody({
          amount: {
            value: amount.toFixed(2),
            currency_code: currency
          }
        })
      }

      const refund = await paypalClient().execute(request)
      logger.info(`Remboursement PayPal effectué: ${refund.result.id}`)
      
      return refund.result
    } catch (error) {
      logger.error(`Erreur remboursement PayPal: ${error.message}`)
      throw new Error('Erreur lors du remboursement')
    }
  }
}

export default new PayPalService()