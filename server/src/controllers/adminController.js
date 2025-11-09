import User from '../models/User.js'
import Order from '../models/Order.js'
import Invoice from '../models/Invoice.js'
import Project from '../models/Project.js'
import Quote from '../models/Quote.js'
import Contact from '../models/Contact.js'
import { logger } from '../utils/logger.js'
import { ORDER_STATUS, PROJECT_STATUS, QUOTE_STATUS, CONTACT_STATUS } from '../utils/constants.js'

// @desc    Tableau de bord admin
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    // Statistiques générales
    const [
      totalUsers,
      totalOrders,
      totalInvoices,
      totalProjects,
      totalQuotes,
      totalContacts
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Invoice.countDocuments(),
      Project.countDocuments(),
      Quote.countDocuments(),
      Contact.countDocuments()
    ])

    // Commandes par statut
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Projets par statut
    const projectsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Devis par statut
    const quotesByStatus = await Quote.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Revenus totaux (commandes payées)
    const revenueStats = await Order.aggregate([
      {
        $match: { status: ORDER_STATUS.PAID }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    // Revenus du mois en cours
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.PAID,
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    // Dernières commandes
    const recentOrders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .populate('offerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    // Derniers utilisateurs
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)

    // Messages non lus
    const unreadMessages = await Contact.countDocuments({ status: CONTACT_STATUS.NEW })

    // Devis en attente
    const pendingQuotes = await Quote.countDocuments({ status: QUOTE_STATUS.PENDING })

    // Projets actifs
    const activeProjects = await Project.countDocuments({ 
      status: { $in: [PROJECT_STATUS.IN_PROGRESS, PROJECT_STATUS.REVIEW] } 
    })

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalInvoices,
          totalProjects,
          totalQuotes,
          totalContacts,
          unreadMessages,
          pendingQuotes,
          activeProjects
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        projectsByStatus: projectsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        quotesByStatus: quotesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        revenue: {
          total: revenueStats[0]?.total || 0,
          totalOrders: revenueStats[0]?.count || 0,
          monthly: monthlyRevenue[0]?.total || 0,
          monthlyOrders: monthlyRevenue[0]?.count || 0
        },
        recentOrders,
        recentUsers
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Statistiques par période
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    const dateFilter = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const matchStage = Object.keys(dateFilter).length > 0 
      ? { $match: { createdAt: dateFilter } }
      : { $match: {} }

    // Commandes par jour
    const ordersByDay = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Utilisateurs par jour
    const usersByDay = await User.aggregate([
      matchStage,
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Top offres
    const topOffers = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: '$offerId',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'offers',
          localField: '_id',
          foreignField: '_id',
          as: 'offer'
        }
      },
      { $unwind: '$offer' },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    res.status(200).json({
      success: true,
      data: {
        ordersByDay,
        usersByDay,
        topOffers
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Exporter données
// @route   GET /api/admin/export
// @access  Private/Admin
export const exportData = async (req, res, next) => {
  try {
    const { type, format = 'json' } = req.query

    let data
    switch (type) {
      case 'users':
        data = await User.find().select('-password').lean()
        break
      case 'orders':
        data = await Order.find()
          .populate('userId', 'firstName lastName email')
          .populate('offerId', 'name')
          .lean()
        break
      case 'invoices':
        data = await Invoice.find()
          .populate('userId', 'firstName lastName email')
          .lean()
        break
      case 'projects':
        data = await Project.find()
          .populate('userId', 'firstName lastName email')
          .lean()
        break
      case 'quotes':
        data = await Quote.find().lean()
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Type d\'export invalide'
        })
    }

    if (format === 'json') {
      res.status(200).json({
        success: true,
        count: data.length,
        data
      })
    } else if (format === 'csv') {
      // TODO: Implémenter export CSV
      res.status(501).json({
        success: false,
        message: 'Export CSV non implémenté'
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Notifications admin
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getAdminNotifications = async (req, res, next) => {
  try {
    // Messages non lus
    const unreadMessages = await Contact.find({ status: CONTACT_STATUS.NEW })
      .sort({ createdAt: -1 })
      .limit(5)

    // Devis en attente
    const pendingQuotes = await Quote.find({ status: QUOTE_STATUS.PENDING })
      .sort({ createdAt: -1 })
      .limit(5)

    // Commandes en attente
    const pendingOrders = await Order.find({ status: ORDER_STATUS.PENDING })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)

    // Factures impayées
    const unpaidInvoices = await Invoice.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json({
      success: true,
      data: {
        unreadMessages,
        pendingQuotes,
        pendingOrders,
        unpaidInvoices
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Logs système
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getSystemLogs = async (req, res, next) => {
  try {
    // TODO: Implémenter lecture des logs
    res.status(501).json({
      success: false,
      message: 'Fonctionnalité non implémentée'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Paramètres système
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSystemSettings = async (req, res, next) => {
  try {
    // TODO: Implémenter paramètres système
    res.status(200).json({
      success: true,
      data: {
        siteName: process.env.SITE_NAME || 'Devboostly',
        siteUrl: process.env.CLIENT_URL,
        apiUrl: process.env.API_URL,
        emailFrom: process.env.EMAIL_FROM,
        currency: 'EUR',
        taxRate: 0.20
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mettre à jour paramètres
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSystemSettings = async (req, res, next) => {
  try {
    // TODO: Implémenter mise à jour paramètres
    res.status(501).json({
      success: false,
      message: 'Fonctionnalité non implémentée'
    })
  } catch (error) {
    next(error)
  }
}