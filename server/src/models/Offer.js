import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'offre est requis'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Le type d\'offre est requis'],
    enum: ['vitrine', 'ecommerce', 'surmesure'],
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  features: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour la recherche
offerSchema.index({ type: 1 });
offerSchema.index({ isActive: 1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;