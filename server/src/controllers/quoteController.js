import Quote from '../models/Quote.js'
import User from '../models/User.js'
import emailService from '../services/emailService.js'
import pdfService from '../services/pdfService.js'
import { logger } from '../utils/logger.js'
import { QUOTE_STATUS } from '../utils/constants.js'

// @desc    Créer demande de devis
// @route   POST /api/quotes
// @access  Public
export const createQuote = async (req, res, next) => {
  try {
    const { name, email, phone, siteType, budget, deadline, description } = req.body || {}

    // Validation
    const required = { name, email, siteType, budget, deadline, description }
    for (const [k, v] of Object.entries(required)) {
      if (!v || String(v).trim() === '') {
        return res.status(400).json({ success: false, message: `Le champ "${k}" est requis.` })
      }
    }
    const emailOk = /^\S+@\S+\.\S+$/.test(String(email))
    if (!emailOk) return res.status(400).json({ success: false, message: 'Email invalide.' })
    if (String(description).trim().length < 10) {
      return res.status(400).json({ success: false, message: 'La description doit contenir au moins 10 caractères.' })
    }

    // Récupérer l'ID de l'utilisateur de manière sécurisée
    const userId = req.user ? (req.user.id || req.user._id) : null

    const newQuote = new Quote({
      userId,
      name,
      email: email.toLowerCase(), // IMPORTANT : S'assurer que l'email est en minuscules
      phone,
      siteType,
      budget,
      deadline,
      description,
      status: QUOTE_STATUS.PENDING
    })

    const savedQuote = await newQuote.save()
    
    // Appels au service d'email sécurisés
    try {
        await emailService.sendQuoteConfirmation(savedQuote)
        await emailService.sendNewQuoteNotification(savedQuote)
    } catch(emailError) {
        logger.error(`Erreur lors de l'envoi des emails de devis pour ${savedQuote._id}: ${emailError.message}`)
    }

    res.status(201).json({ success: true, message: 'Demande de devis créée', data: savedQuote })
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