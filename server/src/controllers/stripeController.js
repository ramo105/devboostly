// controllers/stripeController.js
import Stripe from "stripe"
import Order from "../models/Order.js"
import Quote from "../models/Quote.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

// -----------------------------------------------------------------------------
// 1) INIT PAYMENT INTENT POUR L’ACOMPTE (COMMANDE)
// -----------------------------------------------------------------------------
export const initDepositPayment = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable." })
    }

    const amount = Math.round(order.deposit.amount * 100) // en centimes

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      metadata: { type: "order_deposit", orderId },
      automatic_payment_methods: { enabled: true }
    })

    order.deposit.paymentIntentId = paymentIntent.id
    await order.save()

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount: order.deposit.amount,
      currency: "eur"
    })
  } catch (err) {
    console.error("Erreur initDepositPayment:", err)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}

// -----------------------------------------------------------------------------
// 2) CONFIRMER L’ACOMPTE (COMMANDE)
// -----------------------------------------------------------------------------
export const confirmDepositPayment = async (req, res) => {
  try {
    const { orderId } = req.params
    const { paymentIntentId } = req.body

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: "Commande introuvable." })

    order.deposit.paid = true
    order.paymentStatus = "deposit_paid"

    await order.save()

    return res.json({ message: "Acompte confirmé." })
  } catch (e) {
    console.error("Erreur confirmDeposit:", e)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}

// -----------------------------------------------------------------------------
// 3) INIT PAYMENT INTENT POUR LE SOLDE (60%)
// -----------------------------------------------------------------------------
export const initBalancePayment = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable." })
    }

    const amount = Math.round(order.balance.amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      metadata: { type: "order_balance", orderId },
      automatic_payment_methods: { enabled: true }
    })

    order.balance.paymentIntentId = paymentIntent.id
    await order.save()

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount: order.balance.amount,
      currency: "eur"
    })
  } catch (e) {
    console.error("Erreur initBalance:", e)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}

// -----------------------------------------------------------------------------
// 4) CONFIRMER LE SOLDE
// -----------------------------------------------------------------------------
export const confirmBalancePayment = async (req, res) => {
  try {
    const { orderId } = req.params
    const { paymentIntentId } = req.body

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: "Commande introuvable." })

    order.balance.paid = true
    order.paymentStatus = "paid"
    order.status = "completed"
    await order.save()

    return res.json({ message: "Solde payé avec succès." })
  } catch (e) {
    console.error("Erreur confirmBalance:", e)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}

// -----------------------------------------------------------------------------
// 5) INIT PAYMENT POUR ACOMPTE DEVIS
// -----------------------------------------------------------------------------
export const initQuotePayment = async (req, res) => {
  try {
    const { quoteId } = req.params
    const quote = await Quote.findById(quoteId)

    if (!quote) return res.status(404).json({ message: "Devis introuvable." })

    const depositAmount = Math.round(quote.proposedAmount * 0.4 * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: "eur",
      metadata: { type: "quote_deposit", quoteId },
      automatic_payment_methods: { enabled: true }
    })

    quote.depositPaymentIntentId = paymentIntent.id
    await quote.save()

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount: depositAmount / 100
    })
  } catch (e) {
    console.error("Erreur initQuotePayment:", e)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}

// -----------------------------------------------------------------------------
// 6) WEBHOOK STRIPE
// -----------------------------------------------------------------------------
export const stripeWebhook = async (req, res) => {
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Erreur webhook:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object
    const { type, orderId, quoteId } = intent.metadata || {}

    if (type === "order_deposit") {
      const order = await Order.findById(orderId)
      if (order) {
        order.deposit.paid = true
        order.paymentStatus = "deposit_paid"
        await order.save()
      }
    }

    if (type === "order_balance") {
      const order = await Order.findById(orderId)
      if (order) {
        order.balance.paid = true
        order.paymentStatus = "paid"
        order.status = "completed"
        await order.save()
      }
    }

    if (type === "quote_deposit") {
      const quote = await Quote.findById(quoteId)
      if (quote) {
        quote.status = "accepted"
        await quote.save()
      }
    }
  }

  return res.json({ received: true })
}