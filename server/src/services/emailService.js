import transporter from '../config/mail.js'
import { logger } from '../utils/logger.js'

class EmailService {
   // Envoyer email de réinitialisation de mot de passe
async sendPasswordResetEmail(user, resetToken) {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'DevBoostly'} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour ${user.firstName || user.lastName || user.email},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur DevBoostly.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe&nbsp;:</p>
        <p>
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
        <p>Ce lien est valable pendant 1 heure.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    logger.info(`Email réinitialisation envoyé à ${user.email}`)
  } catch (error) {
    logger.error(
      `Erreur lors de l'envoi de l'email de réinitialisation à ${user.email}: ${error.message}`
    )
  }
}

}

// 🔑 EXPORTATION CORRIGÉE : Nous exportons une instance de la classe, pas la classe elle-même.
export default new EmailService()