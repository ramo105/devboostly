import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);
    
    // Gestion des événements
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ Erreur MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB déconnecté');
    });

    // Fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB déconnecté (fermeture de l\'application)');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;