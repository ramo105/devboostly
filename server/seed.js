// seed.js
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

// essaie d'abord MONGODB_URI puis MONGO_URI
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ Pas de variable MONGODB_URI ou MONGO_URI dans le .env')
  process.exit(1)
}

async function runSeed() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(MONGO_URI)

    const db = mongoose.connection

    // ---------------- OFFRES ----------------
    const offersData = [
      {
        name: 'Site Vitrine',
        slug: 'site-vitrine',
        price: 599,
        description: "Parfait pour présenter votre activité",
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
        features: [
          'Site vitrine professionnel (3 à 5 pages)',
          'Design moderne et personnalisé',
          'Formulaire de contact',
          'Adapté à tous les écrans (responsive)',
          'Référencement naturel de base (SEO)',
          'Intégration Google Maps et réseaux sociaux'
        ],
        color: 'from-blue-500 to-cyan-600',
        icon: 'Globe',
        isActive: true,
        type: 'offer',
        popular: false
      },
      {
        name: 'Site E-commerce',
        slug: 'site-ecommerce',
        price: 899,
        description: 'Vendez en ligne dès maintenant',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
        features: [
          "Site e-commerce complet (jusqu'à 50 produits)",
          'Panier et paiement sécurisé',
          'Gestion des produits, commandes et stocks',
          'Référencement naturel de base (SEO)',
          'Support technique 1 mois inclus',
          'Tableau de bord admin intuitif'
        ],
        color: 'from-[#3ae5ae] to-emerald-500',
        icon: 'ShoppingCart',
        isActive: true,
        type: 'offer',
        popular: true
      },
      {
        name: 'Site Sur Mesure',
        slug: 'site-sur-mesure',
        price: 1790,
        description: 'Solution unique pour vos besoins spécifiques',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        features: [
          'Site totalement personnalisé selon vos besoins',
          'Fonctionnalités avancées (espace client, réservation, etc.)',
          'Optimisation vitesse et sécurité maximale',
          'Maintenance 3 mois incluse',
          'Accompagnement technique dédié',
          "Formation complète à l'utilisation"
        ],
        color: 'from-orange-500 to-red-600',
        icon: 'Layers',
        isActive: true,
        type: 'offer',
        popular: false
      }
    ]

    // ---------------- PACKS ----------------
    const packsData = [
      {
        name: 'Pack Basique',
        slug: 'pack-basique',
        price: 49,
        billingPeriod: 'monthly',
        description: "L'essentiel pour votre site",
        features: [
          'Hébergement web performant',
          'Sauvegardes automatiques hebdomadaires',
          'Petites mises à jour de contenu',
          'Certificat SSL inclus',
          'Support par email'
        ],
        color: 'from-green-500 to-emerald-600',
        icon: 'Server',
        isActive: true,
        popular: false
      },
      {
        name: 'Pack Standard',
        slug: 'pack-standard',
        price: 89,
        billingPeriod: 'monthly',
        description: 'Sécurité et mises à jour',
        features: [
          'Tout du Pack Basique',
          'Mises à jour régulières du site',
          'Sécurité renforcée et monitoring',
          'Assistance mail prioritaire',
          'Sauvegardes quotidiennes',
          'Rapport mensuel de performance'
        ],
        color: 'from-[#3ae5ae] to-emerald-500',
        icon: 'Shield',
        isActive: true,
        popular: true
      },
      {
        name: 'Pack Premium',
        slug: 'pack-premium',
        price: 129,
        billingPeriod: 'monthly',
        description: 'Service VIP complet',
        features: [
          'Tout du Pack Standard',
          'Maintenance complète et proactive',
          'Support prioritaire 24/7',
          'Optimisation continue des performances',
          'Mises à jour de sécurité en temps réel',
          'Consultant dédié',
          'Modifications illimitées'
        ],
        color: 'from-yellow-500 to-orange-600',
        icon: 'Zap',
        isActive: true,
        popular: false
      }
    ]

    console.log('🗑️ Vidage des anciennes données (offers, maintenancepacks)...')
    await db.collection('offers').deleteMany({})
    await db.collection('maintenancepacks').deleteMany({})

    console.log('✍️ Insertion des nouvelles offres...')
    await db.collection('offers').insertMany(offersData)

    console.log('✍️ Insertion des packs de maintenance...')
    await db.collection('maintenancepacks').insertMany(packsData)

    console.log('✅ Seed terminé.')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ Erreur seed :', err)
    process.exit(1)
  }
}

runSeed()
