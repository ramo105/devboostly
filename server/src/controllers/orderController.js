// src/controllers/orderController.js
import Order from '../models/Order.js'
import Offer from '../models/Offer.js'
import MaintenancePack from '../models/MaintenancePack.js'
import Invoice from '../models/Invoice.js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

const makeSlug = (name = '') => {
  return (
    name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-') + '-' + Date.now()
  )
}

const makeInvoiceNumber = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rnd = Math.floor(Math.random() * 9000 + 1000)
  return `INV-${y}${m}${d}-${rnd}`
}

const makeOrderNumber = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rnd = Math.floor(Math.random() * 90000 + 10000)
  return `CMD-${y}${m}${d}-${rnd}`
}

/**
 * Commande entièrement payée ?
 * - soit paymentStatus === 'paid'
 * - soit acompte payé + (pas de solde OU solde payé)
 */
const isOrderFullyPaid = (order) => {
  if (order.paymentStatus === 'paid') return true

  const depositPaid = !!order.deposit?.paid
  const balanceAmount = Number(order.balance?.amount || 0)
  const balancePaid = !!order.balance?.paid

  if (!depositPaid) return false
  if (balanceAmount > 0 && !balancePaid) return false

  return true
}

/**
 * Crée la facture finale UNIQUEMENT si :
 * - commande terminée (status === 'completed')
 * - commande 100% payée (40% + 60% ou 100% d’un pack)
 * - aucune facture n’existe encore pour cette commande
 */
const maybeCreateFinalInvoiceForOrder = async (order) => {
  // rechargement au cas où le hook pre('save') a modifié paymentStatus
  const freshOrder = await Order.findById(order._id)

  if (!freshOrder) return null

  if (freshOrder.status !== 'completed') return null
  if (!isOrderFullyPaid(freshOrder)) return null

  const existing = await Invoice.findOne({ orderId: freshOrder._id })
  if (existing) return existing

  const amount = Number(freshOrder.amount || 0)
  const tax = 0
  const total = amount + tax

  const description =
    freshOrder.projectDetails?.description ||
    freshOrder.projectDetails?.siteType ||
    'Prestation de service'

  const invoice = await Invoice.create({
    userId: freshOrder.userId,
    orderId: freshOrder._id,
    amount,
    tax,
    total,
    status: 'paid',
    paidDate: new Date(),
    items: [
      {
        description,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
  })

  return invoice
}

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifie' })
    }

    const {
      itemId,
      itemType,
      projectDetails,
      billingInfo,
      isTempItem,
      itemName,
      itemPrice,
    } = req.body

    if (!itemId || !itemType) {
      return res.status(400).json({ message: 'itemId et itemType sont requis' })
    }

    const isTemp = Boolean(isTempItem) || String(itemId).startsWith('temp_')

    let offerIdToSave
    let finalName = itemName
    let finalPrice = typeof itemPrice !== 'undefined' ? Number(itemPrice) : undefined

    if (isTemp) {
      if (!finalName || typeof finalPrice === 'undefined') {
        return res.status(400).json({
          message: 'Nom et prix sont requis pour un element temporaire',
        })
      }

      const createdOffer = await Offer.create({
        name: finalName,
        slug: makeSlug(finalName),
        type: 'vitrine',
        price: finalPrice,
        description: projectDetails?.description || 'Offre creee depuis le checkout',
        features: [],
        isActive: true,
      })

      offerIdToSave = createdOffer._id
    } else {
      if (itemType === 'offer') {
        const offer = await Offer.findById(itemId)
        if (!offer) {
          return res.status(404).json({ message: 'Offre non trouvee' })
        }
        offerIdToSave = offer._id
        finalName = offer.name
        finalPrice = offer.price
      } else if (itemType === 'pack') {
        const pack = await MaintenancePack.findById(itemId)
        if (!pack) {
          return res.status(404).json({ message: 'Pack non trouve' })
        }

        const createdOffer = await Offer.create({
          name: pack.name,
          slug: makeSlug(pack.name),
          type: 'vitrine',
          price: pack.price,
          description: pack.description || 'Pack converti en offre pour commande',
          features: pack.features || [],
          isActive: true,
        })

        offerIdToSave = createdOffer._id
        finalName = pack.name
        finalPrice = pack.price
      } else {
        return res.status(400).json({ message: 'Type element invalide' })
      }
    }

    if (typeof finalPrice === 'undefined' || Number.isNaN(finalPrice)) {
      return res.status(400).json({ message: 'Montant invalide pour la commande' })
    }

    const finalProjectDetails = {
      siteType: projectDetails?.siteType || finalName,
      budget: projectDetails?.budget || String(finalPrice),
      deadline: projectDetails?.deadline || 'Non precise',
      description: projectDetails?.description || `Commande de ${finalName}`,
      additionalInfo: projectDetails?.additionalInfo || '',
    }

    const finalBillingInfo = billingInfo
      ? {
          firstName: billingInfo.firstName || null,
          lastName: billingInfo.lastName || null,
          email: billingInfo.email || null,
          phone: billingInfo.phone || null,
          address: billingInfo.address || {},
        }
      : {}

    const order = await Order.create({
      userId,
      offerId: offerIdToSave,
      amount: finalPrice,
      currency: 'EUR',
      projectDetails: finalProjectDetails,
      billingInfo: finalBillingInfo,
      paymentMethod: 'stripe',
      status: 'pending',
      metadata: {
        source: 'checkout',
        originalItemId: itemId,
        originalItemType: itemType,
        isTempItem: isTemp,
      },
    })

    // ⚠️ IMPORTANT :
    // ❌ On NE crée PLUS de facture ici.
    // La facture finale sera créée uniquement quand :
    // - commande = completed
    // - paiement = 100% payé (acompte + solde, ou 100% pack)

    return res.status(201).json(order)
  } catch (err) {
    console.error('Erreur createOrder:', err)
    return res.status(500).json({
      message: 'Erreur serveur lors de la creation de la commande',
      error: err.message,
    })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id
    const orders = await Order.find({ userId })
      .populate('offerId')
      .sort({ createdAt: -1 })

    return res.status(200).json(orders)
  } catch (err) {
    console.error('Erreur getUserOrders:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const initDepositPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Acces interdit a cette commande' })
    }

    if (order.deposit.paid) {
      return res.status(400).json({ message: 'Acompte deja paye' })
    }

    const amountCents = Math.round(order.deposit.amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: order.currency || 'eur',
      metadata: {
        orderId: order._id.toString(),
        type: 'deposit',
      },
    })

    order.deposit.stripePaymentIntentId = paymentIntent.id
    await order.save()

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: order.deposit.amount,
      currency: order.currency || 'EUR',
    })
  } catch (err) {
    console.error('initDepositPayment error:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const initBalancePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Acces interdit a cette commande' })
    }

    if (!order.deposit.paid) {
      return res.status(400).json({ message: 'Acompte non paye' })
    }

    if (order.balance.paid) {
      return res.status(400).json({ message: 'Solde deja paye' })
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        message: 'La commande doit etre terminee avant de payer le solde.',
      })
    }

    const amountCents = Math.round(order.balance.amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: order.currency || 'eur',
      metadata: {
        orderId: order._id.toString(),
        type: 'balance',
      },
    })

    order.balance.stripePaymentIntentId = paymentIntent.id
    await order.save()

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: order.balance.amount,
      currency: order.currency || 'EUR',
    })
  } catch (err) {
    console.error('initBalancePayment error:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('offerId')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })

    return res.status(200).json(orders)
  } catch (err) {
    console.error('Erreur getAllOrders:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('offerId')
      .populate('userId', 'firstName lastName email')

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    return res.status(200).json(order)
  } catch (err) {
    console.error('Erreur getOrderById:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    order.status = status || order.status
    await order.save()

    // Tente de créer la facture finale si conditions OK
    await maybeCreateFinalInvoiceForOrder(order)

    return res.status(200).json(order)
  } catch (err) {
    console.error('Erreur updateOrderStatus:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    order.status = 'cancelled'
    await order.save()

    return res.status(200).json({ message: 'Commande annulee' })
  } catch (err) {
    console.error('Erreur cancelOrder:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const { orderId, type } = paymentIntent.metadata

    if (!orderId || !type) {
      console.error('Missing orderId or type in metadata')
      return res.status(400).json({ error: 'Missing metadata' })
    }

    try {
      const order = await Order.findById(orderId)

      if (!order) {
        console.error('Order not found:', orderId)
        return res.status(404).json({ error: 'Order not found' })
      }

      if (type === 'deposit') {
        order.deposit.paid = true
        order.deposit.paidAt = new Date()
        console.log(`Acompte paye pour commande ${orderId}`)
      } else if (type === 'balance') {
        order.balance.paid = true
        order.balance.paidAt = new Date()
        console.log(`Solde paye pour commande ${orderId}`)
      }

      await order.save()

      // Essaye aussi de créer la facture finale (au cas où status est déjà completed)
      await maybeCreateFinalInvoiceForOrder(order)
    } catch (err) {
      console.error('Error updating order:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.json({ received: true })
}

export const confirmDepositPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body

    if (!orderId) {
      return res.status(400).json({ message: 'orderId requis' })
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Acces interdit' })
    }

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        order.deposit.paid = true
        order.deposit.paidAt = new Date()
        order.deposit.stripePaymentIntentId = paymentIntentId
        await order.save()

        console.log(`✅ Acompte confirme pour commande ${orderId}`)

        // Pas de facture ici : seulement après 100% + completed

        return res.status(200).json({
          success: true,
          message: 'Acompte confirme',
          order,
        })
      } else {
        return res.status(400).json({
          message: 'Paiement non reussi',
          status: paymentIntent.status,
        })
      }
    }

    return res.status(400).json({ message: 'paymentIntentId requis' })
  } catch (err) {
    console.error('confirmDepositPayment error:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const confirmBalancePayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body

    if (!orderId) {
      return res.status(400).json({ message: 'orderId requis' })
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvee' })
    }

    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Acces interdit' })
    }

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        order.balance.paid = true
        order.balance.paidAt = new Date()
        order.balance.stripePaymentIntentId = paymentIntentId
        await order.save()

        console.log(`✅ Solde confirme pour commande ${orderId}`)

        // Tente de créer la facture finale (si status déjà completed)
        await maybeCreateFinalInvoiceForOrder(order)

        return res.status(200).json({
          success: true,
          message: 'Solde confirme',
          order,
        })
      } else {
        return res.status(400).json({
          message: 'Paiement non reussi',
          status: paymentIntent.status,
        })
      }
    }

    return res.status(400).json({ message: 'paymentIntentId requis' })
  } catch (err) {
    console.error('confirmBalancePayment error:', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}