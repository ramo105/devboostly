import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  paidDate: {
    type: Date
  },
  pdfUrl: {
    type: String,
    default: null
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Générer le numéro de facture automatiquement
// Générer le numéro de facture automatiquement : INV-2001, INV-2002, ...
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const InvoiceModel = mongoose.model('Invoice');

    const lastInvoice = await InvoiceModel.findOne({})
      .sort({ createdAt: -1 })
      .select('invoiceNumber')
      .lean();

    let lastSeq = 2000;

    if (lastInvoice?.invoiceNumber) {
      // Nouveau format : INV-XXXX
      const simpleMatch = lastInvoice.invoiceNumber.match(/^INV-(\d{4,})$/);
      if (simpleMatch) {
        lastSeq = parseInt(simpleMatch[1], 10);
      }
      // Ancien format éventuel : ignoré → on repart à 2001
    }

    const nextSeq = lastSeq + 1;
    this.invoiceNumber = `INV-${nextSeq}`;
  }
  next();
});


// Index
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;