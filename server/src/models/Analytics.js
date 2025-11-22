// server/src/models/Analytics.js
import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    visitors: {
      type: Number,
      default: 0,
    },
    pageViews: {
      type: Number,
      default: 0,
    },

    // Liste d'IP en tableau (pas Set → Mongoose ne supporte pas Set)
    uniqueVisitors: {
      type: [String],
      default: [],
    },

    // Map pour les pages, avec nombre de vues
    pages: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)


// Méthode pour obtenir les stats d'une période
analyticsSchema.statics.getStatsByPeriod = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: '$visitors' },
        totalPageViews: { $sum: '$pageViews' },
        days: { $sum: 1 },
      },
    },
  ])

  return stats[0] || { totalVisitors: 0, totalPageViews: 0, days: 0 }
}

// Méthode pour obtenir les stats par jour
analyticsSchema.statics.getStatsByDay = async function (startDate, endDate) {
  return await this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: 1 })
    .select('date visitors pageViews')
}

const Analytics = mongoose.model('Analytics', analyticsSchema)

export default Analytics
