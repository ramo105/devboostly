import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import emailService from '../services/emailService.js'
import { logger } from '../utils/logger.js'

// Générer JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// @desc    Inscription
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body

    // Vérifier si l'utilisateur existe
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      })
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    })

    // Envoyer email de bienvenue
    try {
      await emailService.sendWelcomeEmail(user)
    } catch (error) {
      logger.error(`Erreur envoi email bienvenue: ${error.message}`)
    }

    // Générer token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Vérifier email et password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      })
    }

    // Récupérer l'utilisateur avec le password
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte est désactivé'
      })
    }

    // Générer token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Déconnexion
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur avec cet email'
      })
    }

    // Générer token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash et enregistrer le token
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    user.resetPasswordExpire = Date.now() + 3600000 // 1 heure

    await user.save()

    // Envoyer email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken)

      res.status(200).json({
        success: true,
        message: 'Email de réinitialisation envoyé'
      })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Réinitialiser mot de passe
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // Hash du token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      })
    }

    // Définir nouveau mot de passe
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier profil
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.phone = phone || user.phone
    user.address = address || user.address

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Changer mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      })
    }

    // Définir nouveau mot de passe
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    })
  } catch (error) {
    next(error)
  }
}