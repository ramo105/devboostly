import mongoose from 'mongoose'

const quoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // C'est cette valeur par défaut qui permet les devis publics non connectés
  },
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    lowercase: true,
    trim: true
  },
  phone: { type: String, trim: true },
  siteType: { type: String, required: [true, 'Le type de site est requis'] },
  budget: { type: String, required: [true, 'Le budget est requis'] },
  deadline: { type: String, required: [true, 'Le délai est requis'] },
  description: { type: String, required: [true, 'La description est requise'] },
  status: {
  type: String,
  enum: ['pending', 'reviewed', 'sent', 'accepted', 'completed', 'cancelled', 'rejected'],
  default: 'pending',
},

  adminNotes: { type: String, default: null },
  proposedAmount: { type: Number, default: null },
  validUntil: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  pdfUrl: { type: String, default: null }, // URL du PDF généré
  reviewedAt: { type: Date, default: null }, // Date de révision par l'administrateur
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // ID de l'admin qui a révisé
}, { timestamps: true })

// ✅ Générer un numéro de devis unique avant la validation
quoteSchema.pre('validate', async function (next) {
  try {
    // Si le numéro existe déjà (update, etc.), on ne touche pas
    if (this.quoteNumber) return next()

    const date = new Date()
    const year = date.getFullYear()
    const prefix = `DEVIS-${year}-`

    const QuoteModel = mongoose.model('Quote')

    // On compte uniquement les devis de l'année courante (pour le départ)
    const existingCount = await QuoteModel.countDocuments({
      quoteNumber: { $regex: `^${prefix}` },
    })

    let counter = existingCount
    let candidate = null
    let attempts = 0
    const MAX_ATTEMPTS = 50 // largement suffisant pour ton usage

    while (attempts < MAX_ATTEMPTS) {
      counter += 1
      candidate = `${prefix}${String(counter).padStart(5, '0')}`

      // On vérifie que ce numéro n'existe pas déjà vraiment en base
      const exists = await QuoteModel.exists({ quoteNumber: candidate })

      if (!exists) {
        this.quoteNumber = candidate
        return next()
      }

      attempts += 1
    }

    // Si on sort de la boucle, il y a un vrai problème de cohérence
    return next(
      new Error(
        "Impossible de générer un numéro de devis unique (trop de collisions)."
      )
    )
  } catch (error) {
    console.error('Erreur lors de la génération du quoteNumber', error)
    next(error)
  }
})


const Quote = mongoose.model('Quote', quoteSchema)

export default Quote