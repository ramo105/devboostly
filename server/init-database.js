import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// CORRECTION : Cherche .env dans le même dossier que ce script
dotenv.config({ path: join(__dirname, '.env') });

// Schéma User (copié depuis User.js)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'France'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Fonction principale
async function initDatabase() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    // Vérifier que MONGODB_URI existe
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERREUR: MONGODB_URI n\'est pas défini dans le fichier .env');
      console.error('📍 Vérifiez que le fichier .env existe dans:', __dirname);
      console.error('📝 Et qu\'il contient: MONGODB_URI=votre_uri_mongodb');
      process.exit(1);
    }
    
    console.log('📍 Dossier du script:', __dirname);
    console.log('🔗 URI MongoDB trouvée:', process.env.MONGODB_URI.substring(0, 30) + '...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB');
    
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('⚠️  Un compte administrateur existe déjà!');
      console.log(`📧 Email: ${adminExists.email}`);
      console.log('\n💡 Si vous avez oublié le mot de passe, supprimez ce compte et relancez le script.');
      await mongoose.connection.close();
      return;
    }
    
    // Créer un utilisateur admin
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'DevBoostly',
      email: 'admin@devboostly.fr',
      password: 'Admin123!', // À CHANGER après la première connexion
      role: 'admin',
      phone: '+33 6 00 00 00 00',
      emailVerified: true,
      isActive: true,
      address: {
        street: '123 Rue de la Tech',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      }
    });
    
    await adminUser.save();
    
    console.log('\n✅ Base de données initialisée avec succès!');
    console.log('\n📋 Compte Administrateur créé:');
    console.log('   📧 Email: admin@devboostly.fr');
    console.log('   🔑 Mot de passe: Admin123!');
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après votre première connexion!\n');
    
    // Créer aussi un utilisateur client de test
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Client',
      email: 'client@test.fr',
      password: 'Test123!',
      role: 'client',
      phone: '+33 6 11 11 11 11',
      emailVerified: true,
      isActive: true
    });
    
    await testUser.save();
    
    console.log('📋 Compte Client de test créé:');
    console.log('   📧 Email: client@test.fr');
    console.log('   🔑 Mot de passe: Test123!\n');
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔒 Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Lancer le script
initDatabase();