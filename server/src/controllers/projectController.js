import Project from '../models/Project.js'
import Order from '../models/Order.js'
import { logger } from '../utils/logger.js'
import { PROJECT_STATUS } from '../utils/constants.js'

// @desc    Récupérer tous les projets
// @route   GET /api/projects
// @access  Private/Admin
export const getAllProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = {}
    if (status) query.status = status

    const projects = await Project.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderNumber amount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Project.countDocuments(query)

    res.status(200).json({
      success: true,
      count: projects.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: projects
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer projets utilisateur
// @route   GET /api/projects/user
// @access  Private
export const getUserProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber amount')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer un projet
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderNumber amount offerId')

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      })
    }

    // Vérifier propriétaire ou admin
    if (project.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    res.status(200).json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Créer un projet
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res, next) => {
  try {
    const { orderId, userId, name, description } = req.body

    // Vérifier que la commande existe
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      })
    }

    const project = await Project.create({
      orderId,
      userId: userId || order.userId,
      name,
      description
    })

    await project.populate('userId orderId')

    res.status(201).json({
      success: true,
      message: 'Projet créé',
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier un projet
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, progress, notes } = req.body

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      })
    }

    project.name = name || project.name
    project.description = description || project.description
    project.status = status || project.status
    project.progress = progress !== undefined ? progress : project.progress
    project.notes = notes || project.notes

    if (status === PROJECT_STATUS.COMPLETED && !project.completedAt) {
      project.completedAt = new Date()
    }

    await project.save()

    res.status(200).json({
      success: true,
      message: 'Projet modifié',
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Ajouter fichier au projet
// @route   POST /api/projects/:id/files
// @access  Private/Admin
export const addProjectFile = async (req, res, next) => {
  try {
    const { name, url, type } = req.body

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      })
    }

    project.files.push({
      name,
      url,
      type,
      uploadedBy: req.user.id
    })

    await project.save()

    res.status(200).json({
      success: true,
      message: 'Fichier ajouté',
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer fichier du projet
// @route   DELETE /api/projects/:id/files/:fileId
// @access  Private/Admin
export const deleteProjectFile = async (req, res, next) => {
  try {
    const { id, fileId } = req.params

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      })
    }

    project.files = project.files.filter(
      file => file._id.toString() !== fileId
    )

    await project.save()

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé',
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Ajouter commentaire au projet
// @route   POST /api/projects/:id/comments
// @access  Private
export const addProjectComment = async (req, res, next) => {
  try {
    const { text } = req.body

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      })
    }

    // Vérifier propriétaire ou admin
    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      })
    }

    project.comments.push({
      userId: req.user.id,
      text
    })

    await project.save()
    await project.populate('comments.userId', 'firstName lastName')

    res.status(200).json({
      success: true,
      message: 'Commentaire ajouté',
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer un projet
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Projet supprimé'
    })
  } catch (error) {
    next(error)
  }
}