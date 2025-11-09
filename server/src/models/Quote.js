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
    enum: ['pending', 'reviewed', 'sent', 'accepted', 'rejected'],
    default: 'pending'
  },
  adminNotes: { type: String, default: null },
  proposedAmount: { type: Number, default: null },
  validUntil: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  pdfUrl: { type: String, default: null }, // URL du PDF généré
  reviewedAt: { type: Date, default: null }, // Date de révision par l'administrateur
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // ID de l'admin qui a révisé
}, { timestamps: true })

// ✅ Générer le numéro AVANT la validation (sinon "required" casse)
quoteSchema.pre('validate', async function (next) {
  try {
    if (this.quoteNumber) return next()

    const date = new Date()
    const year = date.getFullYear()

    // Simple incrément basé sur le count (OK pour un usage basique)
    const count = await mongoose.model('Quote').countDocuments()
    this.quoteNumber = `DEVIS-${year}-${String(count + 1).padStart(5, '0')}`

    return next()
  } catch (error) {
    console.error('Erreur lors de la génération du quoteNumber', error)
    next(error)
  }
})

const Quote = mongoose.model('Quote', quoteSchema)

export default Quote