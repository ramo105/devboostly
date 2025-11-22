// src/components/admin/DashboardOverview.jsx
import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import api from '@/lib/api'

const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '0 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('fr-FR').format(num)
}

const DashboardOverview = ({ stats, orders = [], quotes = [] }) => {
  // Période sélectionnée (7, 30 ou 90 jours)
  const [period, setPeriod] = useState(90) // Par défaut 3 mois

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    averageBasket: 0,
    revenueGrowth: 0,
    visitorsCount: 0,
    averageVisitorsPerDay: 0,
  })

  const [chartData, setChartData] = useState({
    revenueByPeriod: [],
    visitorsByPeriod: [],
  })

  const [analyticsData, setAnalyticsData] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Charger les analytics depuis le backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true)
      try {
        const response = await api.get(`/analytics?period=${period}`)
        if (response.data.success) {
          setAnalyticsData(response.data.data)
        }
      } catch (error) {
        console.error('Erreur chargement analytics:', error)
        // Utiliser des données par défaut si erreur
        setAnalyticsData(null)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    fetchAnalytics()
  }, [period])

  // Calculer les analytics financières
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setAnalytics({
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        averageBasket: 0,
        revenueGrowth: 0,
        visitorsCount: 0,
        averageVisitorsPerDay: 0,
      })
      return
    }

    const now = new Date()
    const periodStart = new Date()
    periodStart.setDate(now.getDate() - period)

    // Filtrer les commandes de la période
    const periodOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= periodStart && orderDate <= now
    })

    // Calculer le revenu total
    const paidOrders = periodOrders.filter(
      (o) => o.paymentStatus === 'paid' || o.paymentStatus === 'deposit_paid'
    )

    const totalRevenue = paidOrders.reduce((sum, order) => {
      if (order.paymentStatus === 'paid') {
        return sum + (order.amount || 0)
      } else if (order.paymentStatus === 'deposit_paid') {
        return sum + (order.deposit?.amount || 0)
      }
      return sum
    }, 0)

    // Calculer les dépenses (30% du revenu - à personnaliser)
    const totalExpenses = totalRevenue * 0.3

    // Calculer le bénéfice
    const profit = totalRevenue - totalExpenses

    // Calculer le panier moyen
    const averageBasket =
      paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

    // Calculer la croissance
    const halfPeriod = Math.floor(period / 2)
    const halfPeriodStart = new Date()
    halfPeriodStart.setDate(now.getDate() - halfPeriod)

    const recentRevenue = paidOrders
      .filter((o) => new Date(o.createdAt) >= halfPeriodStart)
      .reduce((sum, o) => {
        if (o.paymentStatus === 'paid') return sum + (o.amount || 0)
        if (o.paymentStatus === 'deposit_paid')
          return sum + (o.deposit?.amount || 0)
        return sum
      }, 0)

    const oldRevenue = paidOrders
      .filter((o) => new Date(o.createdAt) < halfPeriodStart)
      .reduce((sum, o) => {
        if (o.paymentStatus === 'paid') return sum + (o.amount || 0)
        if (o.paymentStatus === 'deposit_paid')
          return sum + (o.deposit?.amount || 0)
        return sum
      }, 0)

    const revenueGrowth =
      oldRevenue > 0 ? ((recentRevenue - oldRevenue) / oldRevenue) * 100 : 0

    setAnalytics({
      totalRevenue,
      totalExpenses,
      profit,
      averageBasket,
      revenueGrowth,
      visitorsCount: analyticsData?.totalVisitors || 0,
      averageVisitorsPerDay: analyticsData?.averageVisitorsPerDay || 0,
    })

    // Préparer les données des graphiques
    prepareChartData(periodOrders, analyticsData?.dailyStats || [])
  }, [orders, period, analyticsData])

  // Préparer les données des graphiques
  const prepareChartData = (periodOrders, dailyAnalytics) => {
    const now = new Date()
    const daysToShow = period === 7 ? 7 : period === 30 ? 30 : 90

    // Créer un tableau des jours
    const days = []
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      days.push(date)
    }

    // Préparer les données de revenu par jour
    const revenueByPeriod = days.map((date) => {
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const dayOrders = periodOrders.filter((o) => {
        const orderDate = new Date(o.createdAt)
        return (
          orderDate >= date &&
          orderDate < nextDate &&
          (o.paymentStatus === 'paid' || o.paymentStatus === 'deposit_paid')
        )
      })

      const revenue = dayOrders.reduce((sum, o) => {
        if (o.paymentStatus === 'paid') return sum + (o.amount || 0)
        if (o.paymentStatus === 'deposit_paid')
          return sum + (o.deposit?.amount || 0)
        return sum
      }, 0)

      return {
        name: formatDateLabel(date, period),
        date: date.toISOString(),
        revenue: Math.round(revenue),
      }
    })

    // Préparer les données de visiteurs par jour
    const visitorsByPeriod = days.map((date) => {
      const dayAnalytics = dailyAnalytics.find((a) => {
        const analyticsDate = new Date(a.date)
        analyticsDate.setHours(0, 0, 0, 0)
        return analyticsDate.getTime() === date.getTime()
      })

      return {
        name: formatDateLabel(date, period),
        date: date.toISOString(),
        visiteurs: dayAnalytics?.visitors || 0,
      }
    })

    setChartData({
      revenueByPeriod,
      visitorsByPeriod,
    })
  }

  // Formater le label de date selon la période
  const formatDateLabel = (date, period) => {
    if (period === 7) {
      // Pour 7 jours: "Lun 15"
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      return `${days[date.getDay()]} ${date.getDate()}`
    } else if (period === 30) {
      // Pour 30 jours: "15 Nov"
      const months = [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Jun',
        'Jul',
        'Aoû',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
      ]
      return `${date.getDate()} ${months[date.getMonth()]}`
    } else {
      // Pour 90 jours: "15/11"
      return `${date.getDate()}/${date.getMonth() + 1}`
    }
  }

  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Administrateur 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Vue d'ensemble de votre plateforme
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex gap-2">
          <Button
            variant={period === 7 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(7)}
          >
            <Calendar className="h-4 w-4 mr-2" />7 jours
          </Button>
          <Button
            variant={period === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(30)}
          >
            <Calendar className="h-4 w-4 mr-2" />1 mois
          </Button>
          <Button
            variant={period === 90 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(90)}
          >
            <Calendar className="h-4 w-4 mr-2" />3 mois
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total des ventes */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total des Ventes
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(analytics.totalRevenue)}
            </div>
            <div className="flex items-center mt-2">
              {analytics.revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-xs font-medium ${
                  analytics.revenueGrowth >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {analytics.revenueGrowth >= 0 ? '+' : ''}
                {analytics.revenueGrowth.toFixed(1)}% sur la période
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bénéfices */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Bénéfices
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(analytics.profit)}
            </div>
           
          </CardContent>
        </Card>

        {/* Panier moyen */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Panier Moyen
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(analytics.averageBasket)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {
                orders.filter(
                  (o) =>
                    o.paymentStatus !== 'unpaid' &&
                    new Date(o.createdAt) >=
                      new Date(Date.now() - period * 24 * 60 * 60 * 1000)
                ).length
              }{' '}
              commandes payées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs secondaires */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingAnalytics ? (
                <span className="text-gray-400">...</span>
              ) : (
                formatNumber(analytics.visitorsCount)
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Moy. {formatNumber(analytics.averageVisitorsPerDay)}/jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                orders.filter(
                  (o) =>
                    new Date(o.createdAt) >=
                    new Date(Date.now() - period * 24 * 60 * 60 * 1000)
                ).length
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Sur la période</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats?.totalUsers || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total inscrits</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Évolution du CA */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
            <CardDescription>
              {period === 7
                ? '7 derniers jours'
                : period === 30
                ? '30 derniers jours'
                : '3 derniers mois'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenueByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="CA (€)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution des visiteurs */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Visiteurs</CardTitle>
            <CardDescription>
              {period === 7
                ? '7 derniers jours'
                : period === 30
                ? '30 derniers jours'
                : '3 derniers mois'}
              {loadingAnalytics && (
                <span className="text-xs ml-2">(Chargement...)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.visitorsByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelStyle={{ color: '#000' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visiteurs"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Visiteurs"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des paiements */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Paiements</CardTitle>
            <CardDescription>Sur la période sélectionnée</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Non payé',
                      value: orders.filter(
                        (o) =>
                          o.paymentStatus === 'unpaid' &&
                          new Date(o.createdAt) >=
                            new Date(Date.now() - period * 24 * 60 * 60 * 1000)
                      ).length,
                    },
                    {
                      name: 'Acompte payé',
                      value: orders.filter(
                        (o) =>
                          o.paymentStatus === 'deposit_paid' &&
                          new Date(o.createdAt) >=
                            new Date(Date.now() - period * 24 * 60 * 60 * 1000)
                      ).length,
                    },
                    {
                      name: 'Payé',
                      value: orders.filter(
                        (o) =>
                          o.paymentStatus === 'paid' &&
                          new Date(o.createdAt) >=
                            new Date(Date.now() - period * 24 * 60 * 60 * 1000)
                      ).length,
                    },
                  ].filter((item) => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardOverview;