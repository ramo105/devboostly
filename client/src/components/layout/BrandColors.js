// brandColors.js - Palette de couleurs extraite du logo sombre

// Couleurs principales du logo sombre (background gradient)
export const logoDarkColors = {
  // Gradient principal du cercle du logo
  darkPurple: '#1e1b4b',      // Bleu-violet très foncé (partie haute du cercle)
  darkBlue: '#1e3a8a',        // Bleu foncé (milieu)
  mediumBlue: '#2563eb',      // Bleu moyen (partie basse)
  lightBlue: '#3b82f6',       // Bleu clair (reflets)
  
  // Variations pour usage dans le site
  primary: '#1e3a8a',         // Bleu foncé principal
  primaryHover: '#1e40af',    // Hover state
  secondary: '#2563eb',       // Bleu secondaire
  secondaryHover: '#1d4ed8',  // Hover state
  
  // Pour les backgrounds de sections
  darkSection: '#1e1b4b',     // Sections sombres
  mediumSection: '#1e3a8a',   // Sections moyennes
  
  // Pour les cartes
  cardDark: '#1e1b4b',
  cardHover: '#312e81',
  
  // Pour les accents
  accent: '#3b82f6',
  accentLight: '#60a5fa',
}

// Export pour Tailwind Config
export const tailwindExtendColors = {
  'logo-dark-purple': '#1e1b4b',
  'logo-dark-blue': '#1e3a8a',
  'logo-medium-blue': '#2563eb',
  'logo-light-blue': '#3b82f6',
  'brand-primary': '#1e3a8a',
  'brand-secondary': '#2563eb',
}

// Exemples d'utilisation dans votre code
export const usageExamples = {
  // Pour un background de section
  sectionBackground: 'bg-[#1e1b4b]',
  
  // Pour un bouton
  buttonPrimary: 'bg-[#1e3a8a] hover:bg-[#1e40af]',
  
  // Pour une carte
  card: 'bg-[#1e1b4b] hover:bg-[#312e81] border-[#2563eb]',
  
  // Pour un gradient (comme le logo)
  gradient: 'bg-gradient-to-br from-[#1e1b4b] via-[#1e3a8a] to-[#2563eb]',
  
  // Pour du texte avec la couleur du logo
  text: 'text-[#3b82f6]',
  
  // Pour une bordure
  border: 'border-[#2563eb]',
}