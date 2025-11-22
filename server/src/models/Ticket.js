import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
}, { _id: false })

const MessageSchema = new mongoose.Schema({
  senderRole: { type: String, enum: ['client', 'staff'], required: true },
  message: { type: String, required: true },
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now }
})

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  category: { type: String, default: 'Autre' },
  priority: { type: String, enum: ['Normal', 'Haute', 'Urgente'], default: 'Normal' },
  status: { type: String, enum: ['open', 'pending', 'answered', 'resolved', 'refunded', 'closed'], default: 'open' },
  messages: { type: [MessageSchema], default: [] },
  isDeleted: { type: Boolean, default: false },
  closedAt: { type: Date, default: null },
}, { timestamps: true })

// Index
TicketSchema.index({ user: 1 })
TicketSchema.index({ status: 1 })

export default mongoose.model('Ticket', TicketSchema)