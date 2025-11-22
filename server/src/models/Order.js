import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
  type: String,
  unique: true,
},

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est requis"],
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: false, // on autorise les offres "temp_"
    },

    // Statut de traitement de la commande (production)
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },

    // Statut du paiement (indépendant du statut projet)
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'deposit_paid', 'paid'],
      default: 'unpaid',
    },

    // Montant TOTAL (100%)
    amount: {
      type: Number,
      required: [true, 'Le montant est requis'],
      min: 0,
    },

    currency: {
      type: String,
      default: 'EUR',
    },

    // Ancien ID de paiement (PayPal, etc.)
    paymentId: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'other'],
      default: 'stripe',
    },

    projectDetails: {
      siteType: {
        type: String,
        required: true,
      },
      budget: String,
      deadline: String,
      description: {
        type: String,
        required: true,
      },
      additionalInfo: String,
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
        country: String,
      },
    },

    // Acompte (40 % par défaut)
    deposit: {
      percentage: { type: Number, default: 40 },
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      paidAt: { type: Date },
      stripePaymentIntentId: { type: String },
      invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    },

    // Solde (reste à payer)
    balance: {
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      paidAt: { type: Date },
      stripePaymentIntentId: { type: String },
      invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    },

    stripeCustomerId: { type: String },
    stripeCheckoutSessionId: { type: String },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Générer le numéro de commande + recalcul acompte/solde
// Générer le numéro de commande + recalcul acompte/solde
orderSchema.pre('save', async function (next) {
  try {
    const isPack =
      this.metadata && this.metadata.originalItemType === 'pack';

    // 🔹 Recalcul acompte / solde quand montant ou pourcentage changent
    if (
      this.isNew ||
      this.isModified('amount') ||
      this.isModified('deposit.percentage') ||
      this.isModified('metadata')
    ) {
      const total = this.amount || 0;

      let perc;
      if (isPack) {
        // 👉 Pour les PACKS : paiement en une seule fois
        perc = 100;
      } else if (
        this.deposit &&
        typeof this.deposit.percentage === 'number'
      ) {
        perc = this.deposit.percentage;
      } else {
        // 👉 Par défaut : 40 % d'acompte pour les OFFRES
        perc = 40;
      }

      const depositAmount = Math.round((total * perc) / 100);
      const balanceAmount = total - depositAmount;

      const existingDeposit =
        this.deposit && typeof this.deposit === 'object' ? this.deposit : {};
      const existingBalance =
        this.balance && typeof this.balance === 'object' ? this.balance : {};

      this.deposit = {
        ...existingDeposit,
        percentage: perc,
        amount: depositAmount,
      };

      this.balance = {
        ...existingBalance,
        amount: balanceAmount,
      };

      // Si pas de solde (cas pack payé 100 %), on marque le solde comme "virtuellement" réglé
      if (isPack && balanceAmount === 0 && this.deposit?.paid) {
        this.balance.paid = true;
        this.balance.paidAt =
          this.balance.paidAt || this.deposit.paidAt || new Date();
      }
    }

    // 🔹 Statut de paiement
    let depositPaid = !!(this.deposit && this.deposit.paid);
    let balancePaid = !!(this.balance && this.balance.paid);

    // 👉 Pour les PACKS : si l'acompte (en réalité 100 %) est payé,
    // on force le solde à "payé" et la commande à "paid"
    if (isPack && depositPaid && !balancePaid) {
      this.balance = this.balance || {};
      this.balance.paid = true;
      this.balance.paidAt =
        this.balance.paidAt || this.deposit?.paidAt || new Date();
      balancePaid = true;
    }

    if (depositPaid && balancePaid) {
      this.paymentStatus = 'paid';
    } else if (depositPaid) {
      this.paymentStatus = 'deposit_paid';
    } else {
      this.paymentStatus = 'unpaid';
    }

    // 🔹 Génération du numéro de commande (inchangé)
        // 🔹 Génération du numéro de commande : CMD-2001, CMD-2002, ...
    if (!this.orderNumber) {
      const OrderModel = mongoose.model('Order');

      // On prend la dernière commande créée
      const lastOrder = await OrderModel.findOne({})
        .sort({ createdAt: -1 })
        .select('orderNumber')
        .lean();

      // Base de départ : 2000 → la première sera 2001
      let lastSeq = 2000;

      if (lastOrder?.orderNumber) {
        // Nouveau format : CMD-XXXX → on récupère le nombre
        const simpleMatch = lastOrder.orderNumber.match(/^CMD-(\d{4,})$/);
        if (simpleMatch) {
          lastSeq = parseInt(simpleMatch[1], 10);
        }
        // Ancien format (CMD-2024-00001, etc.) → ignoré, on repart à 2001
      }

      const nextSeq = lastSeq + 1;
      this.orderNumber = `CMD-${nextSeq}`;
    }


    next();
  } catch (error) {
    next(error);
  }
});


// Index
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;