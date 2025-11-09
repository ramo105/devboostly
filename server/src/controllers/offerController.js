import Offer from '../models/Offer.js'
import MaintenancePack from '../models/MaintenancePack.js'

// @desc    Récupérer toutes les offres
// @route   GET /api/offers
// @access  Public
export const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ order: 1 })

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer une offre
// @route   GET /api/offers/:id
// @access  Public
export const getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id)

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      })
    }

    res.status(200).json({
      success: true,
      data: offer
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer offre par slug
// @route   GET /api/offers/slug/:slug
// @access  Public
export const getOfferBySlug = async (req, res, next) => {
  try {
    const offer = await Offer.findOne({ slug: req.params.slug })

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      })
    }

    res.status(200).json({
      success: true,
      data: offer
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Créer une offre
// @route   POST /api/offers
// @access  Private/Admin
export const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body)

    res.status(201).json({
      success: true,
      message: 'Offre créée',
      data: offer
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier une offre
// @route   PUT /api/offers/:id
// @access  Private/Admin
export const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Offre modifiée',
      data: offer
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer une offre
// @route   DELETE /api/offers/:id
// @access  Private/Admin
export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id)

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Offre supprimée'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer packs maintenance
// @route   GET /api/maintenance-packs
// @access  Public
export const getMaintenancePacks = async (req, res, next) => {
  try {
    const packs = await MaintenancePack.find({ isActive: true }).sort({ order: 1 })

    res.status(200).json({
      success: true,
      count: packs.length,
      data: packs
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Récupérer pack par ID
// @route   GET /api/maintenance-packs/:id
// @access  Public
export const getMaintenancePackById = async (req, res, next) => {
  try {
    const pack = await MaintenancePack.findById(req.params.id)

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      })
    }

    res.status(200).json({
      success: true,
      data: pack
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Créer pack maintenance
// @route   POST /api/maintenance-packs
// @access  Private/Admin
export const createMaintenancePack = async (req, res, next) => {
  try {
    const pack = await MaintenancePack.create(req.body)

    res.status(201).json({
      success: true,
      message: 'Pack créé',
      data: pack
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Modifier pack maintenance
// @route   PUT /api/maintenance-packs/:id
// @access  Private/Admin
export const updateMaintenancePack = async (req, res, next) => {
  try {
    const pack = await MaintenancePack.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Pack modifié',
      data: pack
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Supprimer pack maintenance
// @route   DELETE /api/maintenance-packs/:id
// @access  Private/Admin
export const deleteMaintenancePack = async (req, res, next) => {
  try {
    const pack = await MaintenancePack.findByIdAndDelete(req.params.id)

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'Pack non trouvé'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Pack supprimé'
    })
  } catch (error) {
    next(error)
  }
}