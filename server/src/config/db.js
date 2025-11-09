import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Ces options ne sont plus nécessaires avec Mongoose 6+
      // mais on les garde pour la compatibilité
    });

    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);
    logger.info(`📊 Base de données: ${conn.connection.name}`);
    
    // Gestion des événements de connexion
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB déconnecté');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ Erreur MongoDB: ${err.message}`);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnecté');
    });

    return conn;
  } catch (error) {
    logger.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;