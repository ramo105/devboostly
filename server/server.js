import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

import app from './src/app.js'
import connectDB from './src/config/db.js'
import { logger } from './src/utils/logger.js'
import fs from 'fs'

// Connecter à la base de données
connectDB()

// Créer les dossiers nécessaires
const folders = [
  'uploads/temp',
  'uploads/invoices',
  'uploads/quotes',
  'uploads/projects',
  'logs'
]

folders.forEach(folder => {
  const folderPath = join(__dirname, folder)
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
    logger.info(`Dossier créé: ${folder}`)
  }
})

// Port
const PORT = process.env.PORT || 5000

// Démarrer le serveur
const server = app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`)
  logger.info(`📍 URL: http://localhost:${PORT}`)
  logger.info(`🔗 API: http://localhost:${PORT}/api`)
})

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  logger.error(`Erreur non gérée: ${err.message}`)
  server.close(() => {
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  logger.error(`Exception non capturée: ${err.message}`)
  process.exit(1)
})

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux du serveur')
  server.close(() => {
    logger.info('Processus terminé')
  })
})

export default server