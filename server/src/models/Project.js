import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectNumber: {
    type: String,
    required: true,
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
  name: {
    type: String,
    required: [true, 'Le nom du projet est requis'],
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'review', 'completed', 'on_hold'],
    default: 'waiting'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    default: null
  },
  expectedEndDate: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    dueDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  files: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Générer le numéro de projet automatiquement
projectSchema.pre('save', async function(next) {
  if (!this.projectNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model('Project').countDocuments();
    this.projectNumber = `PROJ-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Index
projectSchema.index({ userId: 1 });
projectSchema.index({ orderId: 1 });
projectSchema.index({ projectNumber: 1 });
projectSchema.index({ status: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;