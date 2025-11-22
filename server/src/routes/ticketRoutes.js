import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Ticket from '../models/Ticket.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// stockage fichiers: /uploads/support
const UPLOAD_DIR = path.join(__dirname, '../../uploads/support')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_')
    cb(null, `${Date.now()}_${name}${ext}`)
  }
})
const upload = multer({ storage })

// standardise la forme envoyée au front
function toClient(ticket) {
  return {
    _id: ticket._id,
    subject: ticket.subject,
    category: ticket.category || 'Autre',
    priority: ticket.priority || 'Normal',
    status: (ticket.status || 'open').toLowerCase(),
    isDeleted: !!ticket.isDeleted,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    messages: (ticket.messages || []).map(m => ({
      _id: m._id,
      senderRole: m.senderRole,
      message: m.message,
      attachments: m.attachments || [],
      createdAt: m.createdAt
    }))
  }
}


// GET /api/tickets?mine=true  |  GET /api/tickets/me
// GET /api/tickets?mine=true  |  GET /api/tickets/me
router.get('/', async (req, res) => {
  const { mine } = req.query
  const baseFilter = mine === 'true' ? { user: req.user.id } : {}
  const filter = { ...baseFilter, isDeleted: false }

  try {
    const list = await Ticket.find(filter).sort({ updatedAt: -1 })
    return res.json(list.map(toClient))
  } catch (e) {
    return res.status(500).json({ message: 'Erreur chargement tickets' })
  }
})


router.get('/me', async (req, res) => {
  try {
    const list = await Ticket.find({ user: req.user.id, isDeleted: false }).sort({ updatedAt: -1 })
    return res.json(list.map(toClient))
  } catch (e) {
    return res.status(500).json({ message: 'Erreur chargement tickets' })
  }
})

// GET /api/tickets/all (admin seulement - tous les tickets)
// GET /api/tickets/all (admin seulement - tous les tickets)
router.get('/all', async (req, res) => {
  try {
    // Vérifier si admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' })
    }

    const list = await Ticket.find()
      .populate('user', 'firstName lastName email')
      .sort({ updatedAt: -1 })

    return res.json(
      list.map(t => ({
        ...toClient(t),
        user: t.user // Ajouter les infos user pour l'admin
      }))
    )
  } catch (e) {
    return res.status(500).json({ message: 'Erreur chargement tickets' })
  }
})


// POST /api/tickets  (JSON OU multipart avec "attachment")
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { subject, category = 'Autre', priority = 'Normal', message } = req.body
    if (!subject || !message) {
      return res.status(400).json({ message: 'Sujet et message requis.' })
    }

    const attachments = []
    if (req.file) {
      attachments.push({
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: `/uploads/support/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      })
    }

    const t = await Ticket.create({
      user: req.user.id,
      subject,
      category,
      priority,
      status: 'open',
      messages: [{
        senderRole: 'client',
        message,
        attachments
      }]
    })

    return res.status(201).json(toClient(t))
  } catch (e) {
    return res.status(500).json({ message: 'Création du ticket impossible.' })
  }
})

// POST /api/tickets/:id/messages (répondre)
// POST /api/tickets/:id/messages (répondre)
router.post('/:id/messages', upload.single('attachment'), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' })

    const isOwner = String(ticket.user) === String(req.user.id)
    const isStaff = ['admin', 'staff'].includes(req.user.role)
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    // 🔒 Bloque TOUT LE MONDE si le ticket est finalisé
    const lockedStatuses = ['resolved', 'refunded', 'closed']
    if (lockedStatuses.includes((ticket.status || '').toLowerCase())) {
      return res
        .status(403)
        .json({ message: 'Ce ticket est fermé, vous ne pouvez plus envoyer de messages.' })
    }

    const attachments = []
    if (req.file) {
      attachments.push({
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: `/uploads/support/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      })
    }

    ticket.messages.push({
      senderRole: isStaff ? 'staff' : 'client',
      message: req.body.message || '',
      attachments
    })

    // MAJ statut (tant qu’il n’est pas finalisé)
    if (isStaff) {
      ticket.status = 'answered'
    } else if (ticket.status !== 'closed') {
      ticket.status = 'pending'
    }

    await ticket.save()
    return res.json(toClient(ticket))
  } catch (e) {
    return res.status(500).json({ message: 'Envoi de la réponse impossible.' })
  }
})


// PATCH /api/tickets/:id/status  (pour fermer, etc.)
router.patch('/:id/status', async (req, res) => {
  try {
     const { status } = req.body
    const validStatuses = ['open', 'pending', 'answered', 'resolved', 'refunded', 'closed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' })
    }
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' })

    const isOwner = String(ticket.user) === String(req.user.id)
    const isStaff = ['admin', 'staff'].includes(req.user.role)
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Forbidden' })

    ticket.status = status || ticket.status
    await ticket.save()
    return res.json(toClient(ticket))
  } catch (e) {
    return res.status(500).json({ message: 'Mise à jour du statut impossible.' })
  }
})
// PATCH /api/tickets/:id/trash  (mettre à la corbeille)
router.patch('/:id/trash', async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' })

    ticket.isDeleted = true
    await ticket.save()

    return res.json(toClient(ticket))
  } catch (e) {
    return res.status(500).json({ message: 'Mise à la corbeille impossible.' })
  }
})

// PATCH /api/tickets/:id/restore  (restaurer depuis la corbeille)
router.patch('/:id/restore', async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' })

    ticket.isDeleted = false
    await ticket.save()

    return res.json(toClient(ticket))
  } catch (e) {
    return res.status(500).json({ message: 'Restauration impossible.' })
  }
})

export default router