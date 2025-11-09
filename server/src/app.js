import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

// Middleware personnalisés
import { errorHandler, notFound } from './middleware/error.middleware.js'
import morganMiddleware from './middleware/logger.middleware.js'
import { generalLimiter } from './middleware/rateLimiter.middleware.js'

// Routes
import authRoutes from './routes/authRoutes.js'
import offerRoutes from './routes/offerRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import quoteRoutes from './routes/quoteRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middlewares de sécurité
app.use(helmet())
app.use(mongoSanitize())

// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Compression
app.use(compression())

// Logger
app.use(morganMiddleware)

// Rate limiting
app.use('/api', generalLimiter)

// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Routes API
app.use('/api/auth', authRoutes)
app.use('/api', offerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

// Route de test
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    environment: process.env.NODE_ENV
  })
})

// Gestion des erreurs 404
app.use(notFound)

// Gestionnaire d'erreurs global
app.use(errorHandler)

export default app