import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PDFService {
  // Générer une facture PDF
  async generateInvoice(invoice, user, order) {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`
      const filePath = path.join(__dirname, '../../uploads/invoices', fileName)

      // Créer le dossier s'il n'existe pas
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Pipe vers un fichier
      const writeStream = fs.createWriteStream(filePath)
      doc.pipe(writeStream)

      // En-tête
      doc
        .fontSize(20)
        .text('FACTURE', 50, 50, { align: 'center' })
        .moveDown()

      // Informations entreprise
      doc
        .fontSize(10)
        .text('Devboostly', 50, 100)
        .text('contact@devboostly.fr', 50, 115)
        .text('www.devboostly.fr', 50, 130)

      // Informations client
      doc
        .text(`Facturé à:`, 350, 100)
        .text(`${user.firstName} ${user.lastName}`, 350, 115)
        .text(user.email, 350, 130)

      // Ligne de séparation
      doc
        .moveTo(50, 160)
        .lineTo(550, 160)
        .stroke()

      // Détails facture
      doc
        .moveDown()
        .fontSize(10)
        .text(`Numéro de facture: ${invoice.invoiceNumber}`, 50, 180)
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 50, 195)
        .text(`Statut: ${invoice.status === 'paid' ? 'Payée' : 'En attente'}`, 50, 210)

      // Tableau des articles
      const tableTop = 250
      doc
        .fontSize(12)
        .text('Description', 50, tableTop)
        .text('Quantité', 300, tableTop)
        .text('Prix unitaire', 370, tableTop)
        .text('Total', 480, tableTop)

      // Ligne de séparation
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke()

      let yPosition = tableTop + 30

      // Articles
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
          doc
            .fontSize(10)
            .text(item.description, 50, yPosition)
            .text(item.quantity, 300, yPosition)
            .text(`${item.unitPrice.toFixed(2)}€`, 370, yPosition)
            .text(`${item.total.toFixed(2)}€`, 480, yPosition)
          
          yPosition += 25
        })
      } else {
        doc
          .fontSize(10)
          .text(order.projectDetails.siteType, 50, yPosition)
          .text('1', 300, yPosition)
          .text(`${invoice.amount.toFixed(2)}€`, 370, yPosition)
          .text(`${invoice.amount.toFixed(2)}€`, 480, yPosition)
        
        yPosition += 25
      }

      // Ligne de séparation
      doc
        .moveTo(50, yPosition + 10)
        .lineTo(550, yPosition + 10)
        .stroke()

      yPosition += 30

      // Totaux
      doc
        .fontSize(10)
        .text('Sous-total HT:', 370, yPosition)
        .text(`${invoice.amount.toFixed(2)}€`, 480, yPosition)

      yPosition += 20

      doc
        .text('TVA (20%):', 370, yPosition)
        .text(`${invoice.tax.toFixed(2)}€`, 480, yPosition)

      yPosition += 20

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total TTC:', 370, yPosition)
        .text(`${invoice.total.toFixed(2)}€`, 480, yPosition)

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text('Merci pour votre confiance !', 50, 700, { align: 'center' })
        .text('Devboostly - Tous droits réservés', 50, 715, { align: 'center' })

      // Finaliser le PDF
      doc.end()

      // Attendre que le fichier soit écrit
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      logger.info(`Facture PDF générée: ${fileName}`)
      return filePath

    } catch (error) {
      logger.error(`Erreur génération PDF: ${error.message}`)
      throw error
    }
  }

  // Générer un devis PDF
  async generateQuote(quote) {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const fileName = `quote-${quote.quoteNumber}.pdf`
      const filePath = path.join(__dirname, '../../uploads/quotes', fileName)

      // Créer le dossier s'il n'existe pas
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const writeStream = fs.createWriteStream(filePath)
      doc.pipe(writeStream)

      // En-tête
      doc
        .fontSize(20)
        .text('DEVIS', 50, 50, { align: 'center' })
        .moveDown()

      // Informations
      doc
        .fontSize(10)
        .text('Devboostly', 50, 100)
        .text('contact@devboostly.fr', 50, 115)

      doc
        .text(`Client:`, 350, 100)
        .text(quote.name, 350, 115)
        .text(quote.email, 350, 130)

      // Détails devis
      doc
        .moveDown()
        .text(`Numéro: ${quote.quoteNumber}`, 50, 180)
        .text(`Date: ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}`, 50, 195)
        .text(`Type: ${quote.siteType}`, 50, 210)
        .text(`Budget estimé: ${quote.budget}`, 50, 225)

      // Description
      doc
        .moveDown()
        .fontSize(12)
        .text('Description du projet:', 50, 270)
        .fontSize(10)
        .text(quote.description, 50, 290, { width: 500 })

      // Montant proposé
      if (quote.proposedAmount) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(`Montant proposé: ${quote.proposedAmount}€ TTC`, 50, 400)
      }

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text('Ce devis est valable 30 jours', 50, 700, { align: 'center' })

      doc.end()

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      logger.info(`Devis PDF généré: ${fileName}`)
      return filePath

    } catch (error) {
      logger.error(`Erreur génération devis PDF: ${error.message}`)
      throw error
    }
  }
}

export default new PDFService()