// controllers/userController.js
import User from '../models/User.js'
import Order from '../models/Order.js'
import Invoice from '../models/Invoice.js'
import Project from '../models/Project.js'
import Quote from '../models/Quote.js'
// si tu as vraiment un logger, garde-le, sinon tu peux enlever
import { logger } from '../utils/logger.js'

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 10, search } = req.query

    const query = {}
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive === 'true'
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const count = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer un utilisateur + stats
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    const [orderCount, invoiceCount, projectCount, quoteCount] = await Promise.all([
      Order.countDocuments({ userId: user._id }),
      Invoice.countDocuments({ userId: user._id }),
      Project.countDocuments({ userId: user._id }),
      Quote.countDocuments({ userId: user._id }),
    ])

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          orders: orderCount,
          invoices: invoiceCount,
          projects: projectCount,
          quotes: quoteCount,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// 🔥 NOUVEAU
// @desc    Récupérer l’historique (commandes, factures, devis) d’un user
// @route   GET /api/users/:id/history
// @access  Private/Admin
export const getUserHistory = async (req, res, next) => {
  try {
    const { id } = req.params

    // on vérifie que l’utilisateur existe
    const user = await User.findById(id).select('-password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    const [orders, invoices, quotes] = await Promise.all([
      // commandes de l’utilisateur
      Order.find({ userId: id })
        .sort({ createdAt: -1 })
        .populate('offerId', 'name price')
        .lean(),

      // factures de l’utilisateur
      Invoice.find({ userId: id })
        .sort({ createdAt: -1 })
        .populate('orderId', 'orderNumber')
        .lean(),

      // devis de l’utilisateur
      Quote.find({ userId: id }).sort({ createdAt: -1 }).lean(),
    ])

    res.status(200).json({
      success: true,
      data: {
        user,
        orders,
        invoices,
        quotes,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Créer un utilisateur
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, address } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'client',
      phone,
      address,
    })

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier un utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, phone, address, isActive } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // si on change l’email, vérifier qu’il n’est pas déjà pris
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email })
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé',
        })
      }
    }

    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.email = email || user.email
    user.role = role || user.role
    user.phone = phone || user.phone
    user.address = address || user.address
    if (isActive !== undefined) user.isActive = isActive

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Utilisateur modifié',
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Activer / désactiver un utilisateur
// @route   PATCH /api/users/:id/toggle-active
// @access  Private/Admin
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    user.isActive = !user.isActive
    await user.save()

    res.status(200).json({
      success: true,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}`,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Changer le rôle d’un utilisateur
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body

    if (!role || !['client', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide',
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // petite sécurité: ne pas enlever le dernier admin
    if (user.role === 'admin' && role === 'client') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de retirer le rôle au dernier administrateur',
        })
      }
    }

    user.role = role
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Rôle modifié',
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Réinitialiser le mot de passe d’un user (par admin)
// @route   POST /api/users/:id/reset-password
// @access  Private/Admin
export const adminResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé',
    })
  } catch (error) {
    next(error)
  }
}