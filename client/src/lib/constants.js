// Informations entreprise
export const COMPANY_INFO = {
  name: import.meta.env.VITE_COMPANY_NAME || 'Devboostly',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'contact@devboostly.fr',
  phone: import.meta.env.VITE_COMPANY_PHONE || '+33 X XX XX XX XX',
  address: import.meta.env.VITE_COMPANY_ADDRESS || 'Adresse de votre entreprise',
  domain: 'www.devboostly.fr',
}

// URLs
export const URLS = {
  api: import.meta.env.VITE_API_URL,
  site: import.meta.env.VITE_SITE_URL,
}

// Offres de sites
export const SITE_OFFERS = [
  {
    id: 'vitrine',
    name: 'Site Vitrine',
    price: 599,
    slug: 'site-vitrine',
    type: 'vitrine',
    popular: false,
    features: [
      'Site vitrine professionnel (3 à 5 pages)',
      'Design moderne et personnalisé',
      'Formulaire de contact',
      'Adapté à tous les écrans',
      'Référencement naturel de base (SEO)',
      'Intégration Google Maps et réseaux sociaux',
    ],
  },
  {
    id: 'ecommerce',
    name: 'Site E-commerce',
    price: 899,
    slug: 'site-ecommerce',
    type: 'ecommerce',
    popular: true,
    features: [
      'Site e-commerce complet (jusqu\'à 50 produits)',
      'Panier et paiement sécurisé',
      'Gestion des produits, commandes et stocks',
      'Référencement naturel de base (SEO)',
      'Support technique 1 mois inclus',
    ],
  },
  {
    id: 'surmesure',
    name: 'Site Sur Mesure',
    price: 1790,
    slug: 'site-sur-mesure',
    type: 'surmesure',
    popular: false,
    features: [
      'Site totalement personnalisé selon le besoin du client',
      'Fonctionnalités avancées (espace client, réservation, etc.)',
      'Optimisation vitesse et sécurité',
      'Maintenance 3 mois incluse',
      'Accompagnement technique dédié',
    ],
  },
]

// Packs maintenance
export const MAINTENANCE_PACKS = [
  {
    id: 'basique',
    name: 'Pack Basique',
    price: 49,
    slug: 'pack-basique',
    popular: false,
    features: [
      'Hébergement inclus',
      'Sauvegardes automatiques',
      'Petites mises à jour',
    ],
  },
  {
    id: 'standard',
    name: 'Pack Standard',
    price: 79,
    slug: 'pack-standard',
    popular: true,
    features: [
      'Hébergement inclus',
      'Mises à jour régulières',
      'Sécurité renforcée',
      'Assistance par email',
    ],
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    price: 129,
    slug: 'pack-premium',
    popular: false,
    features: [
      'Hébergement premium',
      'Maintenance complète',
      'Support prioritaire',
      'Optimisation continue',
    ],
  },
]

// Services
export const SERVICES = [
  {
    id: 'creation',
    name: 'Création de sites web',
    icon: '🌐',
    description: 'Création de sites web professionnels sur mesure',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Solutions e-commerce complètes et performantes',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: '🔧',
    description: 'Maintenance et support technique continu',
  },
  {
    id: 'seo',
    name: 'Référencement SEO',
    icon: '📈',
    description: 'Optimisation pour les moteurs de recherche',
  },
]

// Statuts de commande
export const ORDER_STATUS = {
  pending: 'En attente',
  paid: 'Payée',
  processing: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

// Statuts de projet
export const PROJECT_STATUS = {
  waiting: 'En attente',
  in_progress: 'En cours',
  review: 'En révision',
  completed: 'Terminé',
  on_hold: 'En pause',
}

// Statuts de devis
export const QUOTE_STATUS = {
  pending: 'En attente',
  reviewed: 'Examiné',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
}