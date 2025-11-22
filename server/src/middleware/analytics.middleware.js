import Analytics from '../models/Analytics.js'

// Middleware pour tracker les visiteurs
export const trackVisitor = async (req, res, next) => {
  try {
    // Ignorer les requêtes d'assets statiques (images, js, css, etc.)
    if (
      req.path.startsWith('/uploads') ||
      req.path.includes('.') // fichiers genre .js, .css, .png...
    ) {
      return next()
    }

    // (optionnel) : ne suivre que les GET
    if (req.method !== 'GET') {
      return next()
    }

    // Date du jour (sans heure)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // IP du visiteur (en prenant en compte un éventuel proxy)
    const visitorIp =
      (req.headers['x-forwarded-for'] &&
        req.headers['x-forwarded-for'].split(',')[0].trim()) ||
      req.ip ||
      req.connection?.remoteAddress ||
      'unknown'

    const pagePath = req.path || '/'

    // Chercher le doc analytics du jour
    let analytics = await Analytics.findOne({ date: today })

    if (analytics) {
      // Incrémenter les pageViews totales
      analytics.pageViews += 1

      // Visiteur unique : on vérifie si l'IP est déjà dans le tableau
      const uniqueList = Array.isArray(analytics.uniqueVisitors)
        ? analytics.uniqueVisitors
        : []

      if (!uniqueList.includes(visitorIp)) {
        uniqueList.push(visitorIp)
        analytics.uniqueVisitors = uniqueList
        analytics.visitors += 1
      }

      // Tracker la page vue
      const currentCount = analytics.pages?.get(pagePath) || 0
      analytics.pages.set(pagePath, currentCount + 1)

      await analytics.save()
    } else {
      // Premier visiteur de la journée : créer le doc
      analytics = await Analytics.create({
        date: today,
        visitors: 1,
        pageViews: 1,
        uniqueVisitors: [visitorIp],
        pages: { [pagePath]: 1 },
      })
    }

    next()
  } catch (error) {
    console.error('Erreur analytics middleware:', error)
    // Ne pas bloquer la requête si analytics échoue
    next()
  }
}

// Fonction pour obtenir les stats
export const getAnalytics = async (startDate, endDate) => {
  try {
    const stats = await Analytics.getStatsByPeriod(startDate, endDate)
    const dailyStats = await Analytics.getStatsByDay(startDate, endDate)

    return {
      totalVisitors: stats.totalVisitors,
      totalPageViews: stats.totalPageViews,
      averageVisitorsPerDay:
        stats.days > 0 ? Math.round(stats.totalVisitors / stats.days) : 0,
      dailyStats: dailyStats.map((day) => ({
        date: day.date,
        visitors: day.visitors,
        pageViews: day.pageViews,
      })),
    }
  } catch (error) {
    console.error('Erreur getAnalytics:', error)
    return {
      totalVisitors: 0,
      totalPageViews: 0,
      averageVisitorsPerDay: 0,
      dailyStats: [],
    }
  }
}
