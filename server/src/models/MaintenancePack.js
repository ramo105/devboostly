import mongoose from 'mongoose';

const maintenancePackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du pack est requis'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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
  billingPeriod: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  features: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: [true, 'La description est requise']
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

maintenancePackSchema.index({ isActive: 1 });

const MaintenancePack = mongoose.model('MaintenancePack', maintenancePackSchema);

export default MaintenancePack;