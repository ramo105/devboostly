import transporter from '../config/mail.js'
import { logger } from '../utils/logger.js'

class EmailService {
  // Envoyer email de bienvenue
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Bienvenue sur Devboostly !',
        html: `
          `
      }

      await transporter.sendMail(mailOptions)
      logger.info(`Email de bienvenue envoyé à ${user.email}`)
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de bienvenue à ${user.email}: ${error.message}`)
    }
  }

  // Envoyer email de réinitialisation de mot de passe
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          `
      }

      await transporter.sendMail(mailOptions)
      logger.info(`Email réinitialisation envoyé à ${user.email}`)
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${user.email}: ${error.message}`)
    }
  }
  
  // 💡 NOUVEAU: Confirmer la réception du devis au client
  async sendQuoteConfirmation(quote) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: quote.email,
            subject: 'Confirmation de réception de votre demande de devis',
            html: `
                <p>Bonjour ${quote.name},</p>
                <p>Nous avons bien reçu votre demande de devis. Nous l'examinerons dans les plus brefs délais et vous recontacterons avec une proposition.</p>
                <p>Référence: ${quote.id}</p>
            ` // Remplacez par votre vrai template HTML
        }
        await transporter.sendMail(mailOptions)
        logger.info(`Email de confirmation devis envoyé à ${quote.email}`)
    } catch (error) {
        logger.error(`Erreur d'envoi de confirmation devis à ${quote.email}: ${error.message}`)
    }
  }

  // 💡 NOUVEAU: Notifier l'administrateur
  async sendNewQuoteNotification(quote) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM // Assurez-vous d'avoir une adresse admin
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: adminEmail,
            subject: `[URGENT] Nouvelle demande de devis reçue de ${quote.name}`,
            html: `
                <p>Une nouvelle demande de devis a été soumise.</p>
                <p>Client: ${quote.name} (${quote.email})</p>
                <p>Type de site: ${quote.siteType}</p>
                <p>Budget: ${quote.budget}</p>
                <p>Voir le devis en admin pour plus de détails.</p>
            ` // Remplacez par votre vrai template HTML
        }
        await transporter.sendMail(mailOptions)
        logger.warn(`Notification de nouveau devis envoyée à ${adminEmail}`)
    } catch (error) {
        logger.error(`Erreur d'envoi de notification admin: ${error.message}`)
    }
  }

  // 💡 NOUVEAU: Envoyer le devis finalisé au client
  async sendQuoteToClient(quote) {
    // Cette fonction nécessitera d'attacher le fichier PDF, ce qui est complexe
    // (Utilisez `attachments` dans mailOptions avec le chemin de `quote.pdfUrl`).
    logger.info(`Devis ${quote.quoteNumber} prêt à être envoyé à ${quote.email} (PDF non attaché dans cet exemple).`)
  }
}

// 🔑 EXPORTATION CORRIGÉE : Nous exportons une instance de la classe, pas la classe elle-même.
export default new EmailService()