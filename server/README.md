# Devboostly - Backend API

Backend Node.js/Express pour la plateforme Devboostly.

## 🚀 Technologies

- **Node.js** & **Express.js**
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **PayPal SDK** pour les paiements
- **Nodemailer** pour les emails
- **PDFKit** pour la génération de PDF
- **Winston** pour les logs

## 📦 Installation
```bash
# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env

# Configurer les variables d'environnement
nano .env
```

## 🔧 Configuration

### MongoDB
```env
MONGO_URI=mongodb://localhost:27017/devboostly
```

### JWT
```env
JWT_SECRET=votre_secret_super_securise
JWT_EXPIRE=7d
```

### Email (Gmail)

1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Configurer dans `.env`
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application
```

### PayPal

1. Créer un compte développeur sur [PayPal Developer](https://developer.paypal.com)
2. Créer une application sandbox
3. Récupérer Client ID et Secret
```env
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_client_secret
PAYPAL_MODE=sandbox
```

## 🏃 Démarrage
```bash
# Développement avec nodemon
npm run dev

# Production
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password/:token` - Réinitialiser mot de passe

### Orders
- `POST /api/orders` - Créer commande
- `GET /api/orders` - Liste commandes (Admin)
- `GET /api/orders/user` - Mes commandes
- `GET /api/orders/:id` - Détails commande
- `PUT /api/orders/:id/status` - Modifier statut (Admin)

### Payments
- `POST /api/payments/create-order` - Créer ordre PayPal
- `POST /api/payments/capture-order` - Capturer paiement
- `GET /api/payments/:orderId/status` - Statut paiement

### Quotes
- `POST /api/quotes` - Demander devis
- `GET /api/quotes` - Liste devis (Admin)
- `GET /api/quotes/user` - Mes devis
- `PUT /api/quotes/:id/status` - Modifier statut (Admin)

### Projects
- `GET /api/projects` - Liste projets (Admin)
- `GET /api/projects/user` - Mes projets
- `GET /api/projects/:id` - Détails projet
- `POST /api/projects` - Créer projet (Admin)
- `PUT /api/projects/:id` - Modifier projet (Admin)

### Invoices
- `GET /api/invoices` - Liste factures (Admin)
- `GET /api/invoices/user` - Mes factures
- `GET /api/invoices/:id` - Détails facture
- `GET /api/invoices/:id/pdf` - Générer PDF
- `GET /api/invoices/:id/download` - Télécharger PDF

### Contact
- `POST /api/contact` - Envoyer message
- `GET /api/contact` - Liste messages (Admin)
- `PUT /api/contact/:id/status` - Modifier statut (Admin)

### Users (Admin)
- `GET /api/users` - Liste utilisateurs
- `GET /api/users/:id` - Détails utilisateur
- `POST /api/users` - Créer utilisateur
- `PUT /api/users/:id` - Modifier utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur

### Admin
- `GET /api/admin/dashboard` - Statistiques dashboard
- `GET /api/admin/stats` - Statistiques détaillées
- `GET /api/admin/notifications` - Notifications
- `GET /api/admin/export` - Exporter données

## 🗂️ Structure
```
server/
├── src/
│   ├── config/         # Configurations (DB, mail, PayPal)
│   ├── controllers/    # Contrôleurs
│   ├── middleware/     # Middlewares
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   ├── services/       # Services (email, PDF, PayPal)
│   ├── utils/          # Utilitaires
│   └── app.js          # Application Express
├── uploads/            # Fichiers uploadés
├── logs/               # Logs
├── .env                # Variables d'environnement
├── .env.example        # Exemple variables
├── package.json
└── server.js           # Point d'entrée
```

## 🔒 Sécurité

- Helmet pour les headers HTTP
- Rate limiting sur les routes sensibles
- Sanitization MongoDB
- JWT pour l'authentification
- Validation des données avec express-validator
- CORS configuré

## 📝 Logs

Les logs sont générés avec Winston :
- `logs/error.log` - Erreurs
- `logs/combined.log` - Tous les logs

## 🧪 Tests
```bash
npm test
```

## 📄 License

MIT