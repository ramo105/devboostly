import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: [true, 'L\'offre est requise']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  paymentId: {
    type: String, // ID transaction PayPal
    default: null
  },
  paymentMethod: {
    type: String,
    default: 'paypal'
  },
  projectDetails: {
    siteType: {
      type: String,
      required: true
    },
    budget: String,
    deadline: String,
    description: {
      type: String,
      required: true
    },
    additionalInfo: String
  },
  billingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Générer le numéro de commande automatiquement
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CMD-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Index
orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;