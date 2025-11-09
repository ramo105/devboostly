import { body } from 'express-validator'

// Validation inscription
export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
]

// Validation connexion
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
]

// Validation devis
export const quoteValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('siteType')
    .notEmpty().withMessage('Le type de site est requis'),
  
  body('budget')
    .notEmpty().withMessage('Le budget est requis'),
  
  body('deadline')
    .notEmpty().withMessage('Le délai est requis'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 20 }).withMessage('La description doit contenir au moins 20 caractères'),
]

// Validation contact
export const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Le message est requis')
    .isLength({ min: 10 }).withMessage('Le message doit contenir au moins 10 caractères'),
]

// Validation commande
export const orderValidation = [
  body('offerId')
    .notEmpty().withMessage('L\'offre est requise'),
  
  body('amount')
    .notEmpty().withMessage('Le montant est requis')
    .isNumeric().withMessage('Le montant doit être un nombre'),
  
  body('projectDetails.siteType')
    .notEmpty().withMessage('Le type de site est requis'),
  
  body('projectDetails.description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 20 }).withMessage('La description doit contenir au moins 20 caractères'),
]