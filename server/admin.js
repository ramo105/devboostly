#!/usr/bin/env node

/**
 * Script pour créer un compte administrateur
 * Usage: node create-admin.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Interface pour lire l'entrée utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Fonction pour poser une question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

// Définir le modèle User (inline pour éviter les dépendances)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function createAdmin() {
  console.log('\n🔐 Création d\'un compte Administrateur\n')

  try {
    // Connexion à MongoDB
    console.log('📡 Connexion à MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connecté à MongoDB\n')

    // Demander les informations
    const firstName = await question('Prénom [Admin]: ') || 'Admin'
    const lastName = await question('Nom [Principal]: ') || 'Principal'
    const email = await question('Email [admin@devweb.com]: ') || 'admin@devweb.com'
    const phone = await question('Téléphone [+212600000000]: ') || '+212600000000'
    
    // Demander le mot de passe (avec confirmation)
    let password = await question('Mot de passe [admin123]: ') || 'admin123'
    
    if (password !== 'admin123') {
      const confirmPassword = await question('Confirmer le mot de passe: ')
      if (password !== confirmPassword) {
        console.log('❌ Les mots de passe ne correspondent pas!')
        process.exit(1)
      }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('\n⚠️  Un utilisateur avec cet email existe déjà!')
      const promote = await question('Voulez-vous le promouvoir en admin ? (o/n): ')
      
      if (promote.toLowerCase() === 'o' || promote.toLowerCase() === 'oui') {
        existingUser.role = 'admin'
        existingUser.isVerified = true
        await existingUser.save()
        
        console.log('\n✅ Utilisateur promu en administrateur!')
        console.log('📧 Email:', existingUser.email)
        console.log('👤 Nom:', existingUser.firstName, existingUser.lastName)
      } else {
        console.log('\n❌ Opération annulée')
      }
      
      rl.close()
      process.exit(0)
    }

    // Hasher le mot de passe
    console.log('\n🔒 Hashage du mot de passe...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'admin
    console.log('👤 Création du compte...')
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: 'admin',
      isVerified: true
    })

    console.log('\n✅ Administrateur créé avec succès!\n')
    console.log('═══════════════════════════════════')
    console.log('📧 Email:', admin.email)
    console.log('👤 Nom:', admin.firstName, admin.lastName)
    console.log('📱 Téléphone:', admin.phone)
    console.log('🔑 Mot de passe:', password === 'admin123' ? 'admin123' : '[celui que vous avez entré]')
    console.log('═══════════════════════════════════\n')
    
    if (password === 'admin123') {
      console.log('⚠️  IMPORTANT: Changez ce mot de passe après connexion!\n')
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error.message)
    process.exit(1)
  } finally {
    rl.close()
    await mongoose.connection.close()
    console.log('👋 Déconnecté de MongoDB\n')
    process.exit(0)
  }
}

// Lancer le script
createAdmin()