import Quote from '../models/Quote.js'
import User from '../models/User.js'
import emailService from '../services/emailService.js'
import pdfService from '../services/pdfService.js'
import { logger } from '../utils/logger.js'
import { QUOTE_STATUS } from '../utils/constants.js'
import Order from '../models/Order.js'
import Stripe from 'stripe'
// @desc    Créer demande de devis
// @route   POST /api/quotes
// @access  Public
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const createQuote = async (req, res, next) => {
  try {
    const { name, email, phone, siteType, budget, deadline, description } = req.body || {}

    // --- Validation simple ---
    const required = { name, email, siteType, budget, deadline, description }
    for (const [k, v] of Object.entries(required)) {
      if (!v || String(v).trim() === '') {
        return res
          .status(400)
          .json({ success: false, message: `Le champ "${k}" est requis.` })
      }
    }

    const emailOk = /^\S+@\S+\.\S+$/.test(String(email))
    if (!emailOk) {
      return res
        .status(400)
        .json({ success: false, message: 'Email invalide.' })
    }

    if (String(description).trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'La description doit contenir au moins 10 caractères.',
      })
    }

    // --- Données de base du devis ---
    const userId = req.user ? (req.user.id || req.user._id) : null

    const baseData = {
      userId,
      name,
      email: email.toLowerCase(),
      phone,
      siteType,
      budget,
      deadline,
      description,
      status: QUOTE_STATUS.PENDING,
    }

    // --- Tentatives de sauvegarde en cas de conflit sur quoteNumber ---
    const MAX_ATTEMPTS = 5
    let savedQuote = null
    let lastError = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        // ⚠️ Très important : NOUVELLE instance à chaque tentative
        const quote = new Quote(baseData)
        savedQuote = await quote.save()
        lastError = null
        break
      } catch (err) {
        // Tout E11000 vient du quoteNumber (c'est le seul unique) :contentReference[oaicite:4]{index=4}
        if (err?.code === 11000) {
          console.warn(
            `Conflit quoteNumber (tentative ${attempt}) : ${
              err?.message || ''
            }`
          )
          lastError = err
          // on réessaye avec une nouvelle instance → nouveau pre('validate') → nouveau numéro
          continue
        }

        // autre erreur : on arrête
        lastError = err
        break
      }
    }

    if (!savedQuote) {
      // Ici, soit on a eu que des E11000, soit une autre erreur
      console.error('Impossible de créer le devis après plusieurs tentatives', lastError)
      return res.status(500).json({
        success: false,
        message:
          "Impossible de générer un numéro de devis unique après plusieurs tentatives.",
      })
    }

    // --- Emails (meilleure-effort, ne bloque pas la création) ---
    try {
      await emailService.sendQuoteConfirmation(savedQuote)
      await emailService.sendNewQuoteNotification(savedQuote)
    } catch (emailError) {
      logger.error(
        `Erreur lors de l'envoi des emails de devis pour ${savedQuote._id}: ${emailError.message}`
      )
    }

    return res
      .status(201)
      .json({ success: true, message: 'Demande de devis créée', data: savedQuote })
  } catch (error) {
    next(error)
  }
}



// @desc    Get quotes for current user
// @route   GET /api/quotes/user
// @access  Private (via `protect` middleware)
export const getUserQuotes = async (req, res, next) => {
  try {
    // 1. Chercher TOUS les devis par ID de l'utilisateur ou par email.
    // L'email de l'utilisateur connecté est en minuscules (grâce à Mongoose/User.js).
    const userEmail = req.user.email ? req.user.email.toLowerCase() : null;

    const quotesToProcess = await Quote.find({
      $or: [
        { userId: req.user._id }, 
        { email: userEmail } 
      ]
    }).sort({ createdAt: -1 })

    
    // 2. Identifier et lier les devis non liés (userId: null)
    const quotesToLink = quotesToProcess.filter(q => !q.userId);
    
    if (quotesToLink.length > 0) {
        const idsToUpdate = quotesToLink.map(q => q._id);

        // Lier à l'ID de l'utilisateur, mais uniquement si userId est encore null
        await Quote.updateMany(
            { _id: { $in: idsToUpdate }, userId: null }, 
            { $set: { userId: req.user._id } }
        );
    }
    
    // 3. Recherche finale : On recherche TOUS les devis qui sont maintenant liés à l'ID de l'utilisateur.
    // Cette étape est essentielle pour garantir que les devis récemment liés (étape 2) sont inclus dans le résultat.
    const finalQuotes = await Quote.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: finalQuotes });

  } catch (error) {
    next(error)
  }
}

// @desc    Get all quotes (Admin)
// @route   GET /api/quotes
// @access  Private/Admin
export const getAllQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find({}).sort({ createdAt: -1 }).populate('userId', 'firstName lastName email')
    res.status(200).json({ success: true, count: quotes.length, data: quotes })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single quote by ID
// @route   GET /api/quotes/:id
// @access  Private
export const getQuoteById = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('userId', 'firstName lastName email')
    if (!quote) return res.status(404).json({ success: false, message: 'Devis non trouvé' })

    // Sécurité: vérifier si l'utilisateur est le propriétaire du devis ou un administrateur
    const isOwner = quote.userId && String(quote.userId) === String(req.user.id)
    const isAdmin = req.user.role === 'admin'
    
    // Si l'utilisateur n'est pas l'administrateur ET n'est pas le propriétaire
    if (!isAdmin && !isOwner && quote.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Non autorisé à accéder à ce devis' })
    }

    res.status(200).json({ success: true, data: quote })
  } catch (error) {
    next(error)
  }
}


// @desc    Initialiser le paiement de l'acompte d'un devis (Stripe PaymentIntent)
// @route   POST /api/quotes/:id/init-payment
// @access  Private (user connecté)
export const initQuoteDepositPayment = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id)

    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: 'Devis non trouvé' })
    }

    const isOwner = quote.userId && String(quote.userId) === String(req.user.id)
    const isAdmin = req.user.role === 'admin'
    const isSameEmail =
      quote.email &&
      req.user.email &&
      quote.email.toLowerCase() === req.user.email.toLowerCase()

    if (!isOwner && !isAdmin && !isSameEmail) {
      return res
        .status(403)
        .json({ success: false, message: 'Non autorisé à payer ce devis' })
    }

    if (!quote.proposedAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Ce devis n'a pas encore de montant proposé. Merci d'attendre l'envoi de l'offre par l'administrateur.",
      })
    }

    // On autorise le paiement seulement si le devis a bien été envoyé/revu
    if (quote.status !== 'sent' && quote.status !== 'reviewed') {
      return res.status(400).json({
        success: false,
        message: "Ce devis n'est pas dans un état permettant le paiement.",
      })
    }

    // Vérifier la validité
    if (quote.validUntil && quote.validUntil < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La date de validité de ce devis est dépassée.',
      })
    }

    const totalAmount = Number(quote.proposedAmount)
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant de devis invalide.',
      })
    }

    const depositPercentage = 40
    const depositAmount = Math.round((totalAmount * depositPercentage) / 100)
    const amountInCents = depositAmount * 100

    if (!amountInCents || amountInCents <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant d'acompte calculé est invalide.",
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        quoteId: quote._id.toString(),
        userId: req.user.id.toString(),
        type: 'quote_deposit',
      },
    })

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: depositAmount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Accepter un devis côté client APRÈS paiement et créer la commande
// @route   POST /api/quotes/:id/accept
// @access  Private (user connecté)
export const acceptQuoteAndCreateOrder = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id)

    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: 'Devis non trouvé' })
    }

    const isOwner = quote.userId && String(quote.userId) === String(req.user.id)
    const isAdmin = req.user.role === 'admin'
    const isSameEmail =
      quote.email &&
      req.user.email &&
      quote.email.toLowerCase() === req.user.email.toLowerCase()

    if (!isOwner && !isAdmin && !isSameEmail) {
      return res
        .status(403)
        .json({ success: false, message: 'Non autorisé à accepter ce devis' })
    }

    if (!quote.proposedAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Ce devis n'a pas encore de montant proposé. Merci d'attendre l'envoi de l'offre par l'administrateur.",
      })
    }

    // On n'autorise l'acceptation que si le devis a été envoyé/revu
    if (quote.status !== 'sent' && quote.status !== 'reviewed') {
      return res.status(400).json({
        success: false,
        message: "Ce devis n'est pas dans un état permettant l'acceptation.",
      })
    }

    // Vérifier la validité
    if (quote.validUntil && quote.validUntil < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La date de validité de ce devis est dépassée.',
      })
    }

    // ⚠️ On attend le paymentIntentId du front (paiement déjà effectué)
    const { paymentIntentId } = req.body || {}
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message:
          'paymentIntentId manquant. Le devis ne peut être accepté qu’après un paiement réussi.',
      })
    }

    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Paiement introuvable ou invalide.',
      })
    }

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Paiement non effectué ou incomplet.',
      })
    }

    const totalAmount = Number(quote.proposedAmount)
    const depositPercentage = 40
    const depositAmount = Math.round((totalAmount * depositPercentage) / 100)
    const balanceAmount = Math.max(totalAmount - depositAmount, 0)

    // Sécurité : vérifier que le montant reçu couvre bien l'acompte
    const received =
      (paymentIntent.amount_received ?? paymentIntent.amount ?? 0) / 100
    if (received + 0.01 < depositAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Le montant payé est insuffisant pour couvrir l'acompte de 40 %.",
      })
    }

    // Mise à jour du devis
    if (!quote.userId) {
      quote.userId = req.user.id
    }
    quote.status = 'accepted'
    await quote.save()

    // ==== Infos de facturation pour la commande ====
    let billingInfo = null
    const userId = quote.userId || req.user.id

    if (userId) {
      const user = await User.findById(userId)

      if (user) {
        billingInfo = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        }

        if (user.address) {
          billingInfo.address = {
            street: user.address.street || user.address.line1 || '',
            postalCode: user.address.postalCode || user.address.zip || '',
            city: user.address.city || '',
            country: user.address.country || '',
          }
        }
      }
    }

    // fallback si pas d'utilisateur complet -> on utilise les infos du devis
    if (!billingInfo) {
      billingInfo = {
        firstName: quote.name || '',
        lastName: '',
        email: quote.email || '',
      }
    }
    // ===============================================

    // Création de la commande liée
    const order = await Order.create({
      userId: quote.userId,
      amount: totalAmount,
      status: 'pending',
      // 🔴 AVANT: 'unpaid'
      // ✅ MAINTENANT: acompte déjà payé, reste le solde
      paymentStatus: balanceAmount > 0 ? 'deposit_paid' : 'paid',
      billingInfo,
      projectDetails: {
        source: 'quote',
        quoteId: quote._id,
        quoteNumber: quote.quoteNumber,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        siteType: quote.siteType,
        description: quote.description,
        initialBudget: quote.budget,
        deadline: quote.deadline,
        finalAmount: totalAmount,
      },
      // 🔴 AVANT: paid: false
      // ✅ MAINTENANT: acompte payé + date + PI Stripe
      deposit: {
        percentage: depositPercentage,
        amount: depositAmount,
        paid: true,
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      },
      balance: {
        amount: balanceAmount,
        paid: balanceAmount === 0,
      },
      metadata: {
        originalItemType: 'Devis',
        originalItemName: quote.siteType || 'Projet sur-mesure',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Devis accepté, acompte payé et commande créée.',
      data: {
        quote,
        order,
      },
    })
  } catch (error) {
    next(error)
  }
}




// @desc    Mettre à jour le statut du devis (Admin)
// @route   PUT /api/quotes/:id/status
// @access  Private/Admin
export const updateQuoteStatus = async (req, res, next) => {
  try {
    const { status, proposedAmount, adminNotes, validUntil } = req.body
    
    // Valider le statut
    if (status && !Object.values(QUOTE_STATUS).includes(status)) {
        return res.status(400).json({ success: false, message: 'Statut de devis invalide' })
    }

    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ success: false, message: 'Devis non trouvé' })

    quote.status = status || quote.status
    quote.proposedAmount = proposedAmount ?? quote.proposedAmount
    quote.adminNotes = adminNotes ?? quote.adminNotes
    quote.validUntil = validUntil ?? quote.validUntil 

    if (status === QUOTE_STATUS.REVIEWED) {
      quote.reviewedAt = new Date()
      quote.reviewedBy = req.user.id
      if (!quote.quoteNumber) await quote.validate() 
    }
    
    if (status === QUOTE_STATUS.SENT) {
        quote.sentAt = new Date()
        if (quote.pdfUrl) {
             await emailService.sendQuoteToClient(quote) 
        }
    }


    await quote.save()
    res.status(200).json({ success: true, message: 'Statut mis à jour', data: quote })
  } catch (error) {
    next(error)
  }
}

// @desc    Générer PDF devis
// @route   GET /api/quotes/:id/pdf
// @access  Private/Admin
export const generateQuotePDF = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ success: false, message: 'Devis non trouvé' })

    const pdfPath = await pdfService.generateQuote(quote)
    quote.pdfUrl = pdfPath
    await quote.save()

    res.status(200).json({ success: true, message: 'PDF généré', pdfUrl: pdfPath })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer un devis (Admin)
// @route   DELETE /api/quotes/:id
// @access  Private/Admin
export const deleteQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ success: false, message: 'Devis non trouvé' })

    if (quote.pdfUrl) {
      logger.warn(`PDF du devis ${quote.quoteNumber} (path: ${quote.pdfUrl}) n'a pas été supprimé du système de fichiers (Logique manquante).`)
    }

    await quote.deleteOne()
    res.status(200).json({ success: true, message: 'Devis supprimé avec succès' })
  } catch (error) {
    next(error)
  }
}