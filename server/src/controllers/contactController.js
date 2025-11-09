import Contact from '../models/Contact.js'
import emailService from '../services/emailService.js'
import { logger } from '../utils/logger.js'
import { CONTACT_STATUS } from '../utils/constants.js'

// @desc    Envoyer message contact
// @route   POST /api/contact
// @access  Public
export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Créer le message
    const contact = await Contact.create({
      userId: req.user?.id || null,
      name,
      email,
      phone,
      subject,
      message
    })

    // Envoyer les emails
    try {
      await emailService.sendContactMessage(contact)
    } catch (error) {
      logger.error(`Erreur envoi emails contact: ${error.message}`)
    }

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: contact
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer tous les messages
// @route   GET /api/contact
// @access  Private/Admin
export const getAllMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = {}
    if (status) query.status = status

    const messages = await Contact.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Contact.countDocuments(query)

    res.status(200).json({
      success: true,
      count: messages.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: messages
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer un message
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getMessageById = async (req, res, next) => {
  try {
    const message = await Contact.findById(req.params.id)
      .populate('userId', 'firstName lastName email')

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    // Marquer comme lu
    if (message.status === CONTACT_STATUS.NEW) {
      message.status = CONTACT_STATUS.READ
      message.readAt = new Date()
      await message.save()
    }

    res.status(200).json({
      success: true,
      data: message
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier statut message
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    const message = await Contact.findById(req.params.id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    message.status = status

    if (status === CONTACT_STATUS.READ && !message.readAt) {
      message.readAt = new Date()
    }

    if (status === CONTACT_STATUS.REPLIED && !message.repliedAt) {
      message.repliedAt = new Date()
      message.repliedBy = req.user.id
    }

    await message.save()

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      data: message
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer un message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Message supprimé'
    })
  } catch (error) {
    next(error)
  }
}