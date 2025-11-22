import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../utils/logger.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
class PDFService {
  // Générer une facture PDF
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

      const writeStream = fs.createWriteStream(filePath)
      doc.pipe(writeStream)

      // ====== LOGO ======
      const logoPath = path.join(__dirname, '../uploads/react.png')
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 90 })
      }

      // ====== TITRE FACTURE ======
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('FACTURE', 0, 50, { align: 'right' })

      // ====== INFOS ENTREPRISE ======
      const companyX = 50
      const companyY = 140

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('DevBoostly', companyX, companyY)

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Nom : EL ALAOUY', companyX, companyY + 18)
        .text('Email : devboostly@gmail.com', companyX, companyY + 33)
        .text('Téléphone : 06 99 47 71 96', companyX, companyY + 48)
        .text('Site : devboostly.fr', companyX, companyY + 63)
        .text('SIRET : 933 631 459 00015', companyX, companyY + 78)
        .text(
          'Statut : Auto-entrepreneur — TVA non applicable (article 293 B du CGI)',
          companyX,
          companyY + 93,
          { width: 260 }
        )

      // ====== INFOS CLIENT ======
      const clientX = 350
      const clientY = 140

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Facturé à :', clientX, clientY)

      doc
        .font('Helvetica')
        .text(`${user.firstName} ${user.lastName}`, clientX, clientY + 15)
        .text(user.email || '', clientX, clientY + 30)

      if (user.phone) {
        doc.text(user.phone, clientX, clientY + 45)
      }

      // ====== SÉPARATEUR ======
      const sepY = companyY + 120
      doc
        .moveTo(50, sepY)
        .lineTo(550, sepY)
        .stroke()

      // ====== DÉTAILS FACTURE ======
const detailsY = sepY + 20
const dateStr = new Date(invoice.createdAt).toLocaleDateString('fr-FR')

doc
  .font('Helvetica')
  .fontSize(10)
  .text(`Numéro de facture : ${invoice.invoiceNumber}`, 50, detailsY)
  .text(`Date : ${dateStr}`, 50, detailsY + 15)

// ====== TABLEAU DES ARTICLES ======
const tableTop = detailsY + 55

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Description', 50, tableTop)
        .text('Quantité', 300, tableTop)
        .text('Prix unitaire', 370, tableTop)
        .text('Total', 480, tableTop)

      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke()

      let yPosition = tableTop + 30

      const amount = typeof invoice.amount === 'number' ? invoice.amount : 0
      const tax = typeof invoice.tax === 'number' ? invoice.tax : 0
      const total = typeof invoice.total === 'number' ? invoice.total : amount + tax

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          doc
            .font('Helvetica')
            .fontSize(10)
            .text(item.description, 50, yPosition)
            .text(item.quantity, 300, yPosition)
            .text(`${item.unitPrice.toFixed(2)} €`, 370, yPosition)
            .text(`${item.total.toFixed(2)} €`, 480, yPosition)

          yPosition += 25
        })
      } else {
        // fallback simple si pas d'items détaillés
        const description =
          order?.projectDetails?.siteType ||
          order?.projectDetails?.description ||
          'Prestation de service'

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(description, 50, yPosition)
          .text('1', 300, yPosition)
          .text(`${amount.toFixed(2)} €`, 370, yPosition)
          .text(`${amount.toFixed(2)} €`, 480, yPosition)

        yPosition += 25
      }

      // Ligne sous le tableau
      doc
        .moveTo(50, yPosition + 10)
        .lineTo(550, yPosition + 10)
        .stroke()

      yPosition += 30

      // ====== TOTAUX ======
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Sous-total HT :', 370, yPosition)
        .text(`${amount.toFixed(2)} €`, 480, yPosition)

      yPosition += 20

      doc
        .text('TVA (0 %) :', 370, yPosition)
        .text(`${tax.toFixed(2)} €`, 480, yPosition)

      yPosition += 20

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Total TTC :', 370, yPosition)
        .text(`${total.toFixed(2)} €`, 480, yPosition)

      // ====== FOOTER ======
      doc
        .font('Helvetica')
        .fontSize(8)
        .text('TVA non applicable, article 293 B du CGI', 50, 700, {
          align: 'center',
        })
        .text('Merci pour votre confiance !', 50, 715, { align: 'center' })
        .text('DevBoostly - Tous droits réservés', 50, 730, { align: 'center' })

      // Finaliser le PDF
      doc.end()

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