// src/pages/ClientSpace.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ShoppingBag,
  FileText,
  CreditCard,
  LifeBuoy,
  Loader2,
  Send,
  Eye,
  ChevronDown,
  ChevronUp,
  Download,
  Paperclip,
  LayoutDashboard,
  User,
  Home,
  LogOut,
  Lock,
  EyeOff,
  Menu,
  X,
} from 'lucide-react'
import { orderService } from '@/services/orderService'
import { invoiceService } from '@/services/invoiceService'
import { quoteService } from '@/services/quoteService'
import { authService } from '@/services/authService'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS, QUOTE_STATUS } from '@/lib/constants'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/Dialog'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
// Chart.js
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

// Paiement
const PAYMENT_STATUS_LABELS = {
  unpaid: 'Non payé',
  deposit_paid: 'Acompte payé',
  paid: 'Payé (100 %)',
}

const getPaymentStatusVariant = (paymentStatus) => {
  switch ((paymentStatus || '').toLowerCase()) {
    case 'unpaid':
      return 'destructive'
    case 'deposit_paid':
      return 'warning'
    case 'paid':
      return 'success'
    default:
      return 'default'
  }
}


// Composant de paiement du solde
function BalancePaymentModal({ isOpen, onClose, order, onPaymentSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

    const handlePayBalance = async () => {
    if (!stripe || !elements) {
      setError('Le module de paiement n\'est pas pret')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1) On initialise le paiement du solde (PI Stripe)
      const response = await api.post(`/orders/${order._id}/pay-balance`)
      const { clientSecret, amount } = response.data

      if (!clientSecret) {
        throw new Error('Client secret manquant')
      }

      const cardElement = elements.getElement(CardElement)

      // 2) On confirme le paiement côté Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        })

      if (stripeError) {
        setError(stripeError.message || 'Erreur lors du paiement')
        toast.error(stripeError.message || 'Erreur lors du paiement')
      } else if (paymentIntent?.status === 'succeeded') {
        // 3) ✅ On confirme le solde côté backend
        try {
          await orderService.confirmBalancePayment(order._id, paymentIntent.id)
        } catch (e) {
          console.error('Erreur confirmBalancePayment:', e)
          // on ne bloque pas l'utilisateur, on continue
        }

        toast.success(`Solde de ${formatPrice(amount)} paye avec succes`)

        if (typeof onPaymentSuccess === 'function') {
          await onPaymentSuccess()
        }

        onClose()
      }
    } catch (err) {
      console.error('Erreur paiement solde:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du paiement')
      toast.error(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payer le solde (60%)</DialogTitle>
          <DialogDescription>
            Commande #{order?.orderNumber}
            <br />
            Montant a payer : {formatPrice(order?.balance?.amount || 0)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handlePayBalance} disabled={loading || !stripe}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Paiement...
                </>
              ) : (
                'Payer maintenant'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
// Composant de paiement de l'acompte d'un devis (acceptation + création commande)
function QuotePaymentModal({ isOpen, onClose, quote, onPaymentSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState(null)

  const handlePayAndAccept = async () => {
    if (!stripe || !elements) {
      setError("Le module de paiement n'est pas prêt")
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1) Initialiser le PaymentIntent pour l'acompte du devis
      const initRes = await api.post(`/quotes/${quote._id}/init-payment`)
      const { clientSecret, amount: depositAmount } = initRes.data || {}

      if (!clientSecret) {
        throw new Error('Client secret manquant')
      }

      if (depositAmount != null) {
        setAmount(depositAmount)
      }

      const cardElement = elements.getElement(CardElement)

      // 2) Confirmer le paiement côté Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        })

      if (stripeError) {
        setError(stripeError.message || 'Erreur lors du paiement')
        toast.error(stripeError.message || 'Erreur lors du paiement')
        return
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        setError('Paiement non effectué ou incomplet.')
        toast.error('Paiement non effectué.')
        return
      }

      // 3) Confirmer l'acceptation du devis + création de la commande côté backend
      try {
        const res = await api.post(`/quotes/${quote._id}/accept`, {
          paymentIntentId: paymentIntent.id,
        })

        const payload = res?.data || {}
        const updatedQuote = payload?.data?.quote || payload?.quote
        const newOrder = payload?.data?.order || payload?.order

        toast.success(
          `Devis accepté et acompte de ${
            depositAmount != null ? formatPrice(depositAmount) : '...'
          } payé avec succès.`
        )

        if (typeof onPaymentSuccess === 'function') {
          await onPaymentSuccess(updatedQuote, newOrder)
        }

        onClose()
      } catch (err) {
        console.error('Erreur acceptation devis après paiement:', err)
        const message =
          err?.response?.data?.message ||
          "Paiement réalisé mais erreur lors de la création de la commande. Contactez le support."
        setError(message)
        toast.error(message)
      }
    } catch (err) {
      console.error('Erreur paiement acompte devis:', err)
      const message =
        err?.response?.data?.message ||
        err.message ||
        'Erreur lors du paiement'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Accepter le devis et payer l&apos;acompte (40 %)
          </DialogTitle>
          <DialogDescription>
            Devis {quote.quoteNumber}
            <br />
            Montant du projet :{' '}
            {quote.proposedAmount != null
              ? formatPrice(quote.proposedAmount)
              : '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Carte bancaire</Label>
            <div className="mt-2 rounded-md border p-3 bg-white dark:bg-gray-900">
              <CardElement />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button onClick={handlePayAndAccept} disabled={loading} className="bg-blue-500 text-white">
              {loading ? 'Paiement en cours...' : "Payer l'acompte et accepter"}
            </Button>
          </div>

          {amount != null && (
            <p className="text-xs text-gray-500">
              Montant débité : {formatPrice(amount)} (40&nbsp;% du devis)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ClientSpace() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
    const [orders, setOrders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [quotes, setQuotes] = useState([])
  const [expandedQuoteId, setExpandedQuoteId] = useState(null)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null)
  const [balancePaymentModal, setBalancePaymentModal] = useState(null)
  const [quotePaymentModal, setQuotePaymentModal] = useState(null)

  // password
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  // show / hide password
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // chart
  const [activityRange, setActivityRange] = useState('3m')
  const chartCanvasRef = useRef(null)
  const chartInstanceRef = useRef(null)

  // ===== Support / Tickets =====
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketsError, setTicketsError] = useState('')
  const [ticketFilter, setTicketFilter] = useState('all')
  const [expandedTicketId, setExpandedTicketId] = useState(null)

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Technique',
    priority: 'Normal',
    message: '',
  })
  const [ticketFile, setTicketFile] = useState(null)
  const [ticketCreating, setTicketCreating] = useState(false)

  const [replyByTicketId, setReplyByTicketId] = useState({})
  const [replyLoadingId, setReplyLoadingId] = useState(null)

  // mapping status -> badge variant
  const TICKET_STATUS_LABELS = {
    open: 'Ouvert',
    pending: 'En cours',
    answered: 'Répondu',
    resolved: 'Résolu',
    refunded: 'Remboursé',
    closed: 'Fermé',
  }
  const getTicketBadgeVariant = (s) => {
    switch (s) {
      case 'open':
        return 'secondary'
      case 'pending':
        return 'warning'
      case 'answered':
        return 'default'
      case 'resolved':
      case 'refunded':
        return 'success'
      case 'closed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const isTicketLocked = (status) =>
    ['closed', 'resolved', 'refunded'].includes((status || '').toLowerCase())

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin')
      return
    }
    loadData()
  }, [user, isAdmin, navigate])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const allowed = ['dashboard', 'orders', 'invoices', 'quotes', 'profile', 'support']
    if (tab && allowed.includes(tab)) setActiveTab(tab)
  }, [location.search])

  useEffect(() => {
    if (activeTab === 'support') {
      fetchTickets()
    }
  }, [activeTab])

  const loadData = async () => {
    try {
      const [ordersData, invoicesData, quotesData] = await Promise.all([
        orderService.getMyOrders().catch(() => []),
        invoiceService.getMyInvoices().catch(() => []),
        quoteService.getMyQuotes().catch(() => []),
      ])

      setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.data || [])
      setInvoices(Array.isArray(invoicesData) ? invoicesData : invoicesData?.data || [])
      setQuotes(Array.isArray(quotesData) ? quotesData : quotesData?.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setOrders([])
      setInvoices([])
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  // ===== tickets helpers =====
  const normalizeTickets = (rawList) => {
    return (rawList || []).map((t) => ({
      _id: t._id || t.id,
      subject: t.subject || t.title || 'Sans objet',
      category: t.category || t.type || 'Autre',
      priority: t.priority || t.level || 'Normal',
      status: (t.status || 'open').toLowerCase(),
      isDeleted: !!t.isDeleted,
      createdAt: t.createdAt || t.created_at || t.date || new Date().toISOString(),
      updatedAt: t.updatedAt || t.updated_at || t.lastUpdate || t.createdAt,
      messages: Array.isArray(t.messages)
        ? t.messages.map((m) => ({
            _id: m._id || m.id,
            senderRole: m.senderRole || m.authorRole || (m.isStaff ? 'staff' : 'client'),
            message: m.message || m.content || '',
            attachments: Array.isArray(m.attachments) ? m.attachments : [],
            createdAt: m.createdAt || m.date || new Date().toISOString(),
          }))
        : [],
    }))
  }

  const fetchTickets = async () => {
    setTicketsLoading(true)
    setTicketsError('')
    try {
      let res
      try {
        res = await api.get('/tickets/me')
      } catch {}
      if (!res) {
        try {
          res = await api.get('/tickets?mine=true')
        } catch {}
      }
      if (!res) {
        try {
          res = await api.get('/support/tickets/me')
        } catch {}
      }
      if (!res) {
        try {
          res = await api.get('/helpdesk/tickets/me')
        } catch {}
      }

      const list = res?.data?.data || res?.data || []
      setTickets(normalizeTickets(list))
    } catch (e) {
      console.error('Erreur tickets:', e)
      setTickets([])
      setTicketsError('Impossible de charger les tickets.')
    } finally {
      setTicketsLoading(false)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!ticketForm.subject?.trim() || !ticketForm.message?.trim()) return

    setTicketCreating(true)
    try {
      let response
      if (ticketFile) {
        const fd = new FormData()
        fd.append('subject', ticketForm.subject)
        fd.append('category', ticketForm.category)
        fd.append('priority', ticketForm.priority)
        fd.append('message', ticketForm.message)
        fd.append('attachment', ticketFile)

        try {
          response = await api.post('/tickets', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } catch {}
        if (!response) {
          try {
            response = await api.post('/support/tickets', fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          } catch {}
        }
      } else {
        const payload = { ...ticketForm }
        try {
          response = await api.post('/tickets', payload)
        } catch {}
        if (!response) {
          try {
            response = await api.post('/support/tickets', payload)
          } catch {}
        }
        if (!response) {
          try {
            response = await api.post('/helpdesk/tickets', payload)
          } catch {}
        }
      }

      if (!response) throw new Error('Aucun endpoint /tickets disponible')

      setTicketForm({ subject: '', category: 'Technique', priority: 'Normal', message: '' })
      setTicketFile(null)
      await fetchTickets()
    } catch (e) {
      console.error('Création ticket:', e)
      setTicketsError(e?.response?.data?.message || 'Création du ticket impossible.')
    } finally {
      setTicketCreating(false)
    }
  }

  const handleReplyTicket = async (ticketId) => {
    const content = (replyByTicketId[ticketId] || '').trim()
    if (!content) return

    const current = tickets.find((t) => t._id === ticketId)
    if (!current || isTicketLocked(current.status)) {
      setTicketsError('Ce ticket est fermé, vous ne pouvez plus répondre.')
      return
    }

    setReplyLoadingId(ticketId)
    try {
      let res
      try {
        res = await api.post(`/tickets/${ticketId}/messages`, { message: content })
      } catch {}
      if (!res) {
        try {
          res = await api.post(`/tickets/${ticketId}/reply`, { message: content })
        } catch {}
      }
      if (!res) {
        try {
          res = await api.post(`/support/tickets/${ticketId}/messages`, {
            message: content,
          })
        } catch {}
      }
      if (!res) throw new Error('Aucun endpoint de réponse')

      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    _id: Math.random().toString(36).slice(2),
                    senderRole: 'client',
                    message: content,
                    createdAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
                status: t.status === 'closed' ? 'closed' : 'pending',
              }
            : t
        )
      )
      setReplyByTicketId((prev) => ({ ...prev, [ticketId]: '' }))
    } catch (e) {
      console.error('Réponse ticket:', e)
      setTicketsError(e?.response?.data?.message || 'Envoi de la réponse impossible.')
    } finally {
      setReplyLoadingId(null)
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true
    return (t.status || '').toLowerCase() === ticketFilter
  })

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  const getStatusColor = (status, type) => {
    const colors = {
      order: {
        pending: 'warning',
        paid: 'success',
        processing: 'default',
        completed: 'success',
        cancelled: 'destructive',
      },
      quote: {
        pending: 'warning',
        reviewed: 'default',
        sent: 'secondary',
        accepted: 'success',
        rejected: 'destructive',
      },
      invoice: {
        paid: 'success',
        pending: 'warning',
        draft: 'secondary',
      },
    }
    return colors[type]?.[status] || 'default'
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleRefreshOrders = async () => {
    try {
      const ordersRes = await orderService.getUserOrders()
      setOrders(ordersRes.data || [])
      toast.success('Commandes actualisees')
    } catch (err) {
      console.error('Erreur refresh:', err)
      toast.error('Erreur lors de l\'actualisation')
    }
  }


  // ===== helpers pour le graph =====
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  }

  const buildActivityBuckets = (range) => {
    const now = new Date()

    if (range === '1m') {
      const buckets = []
      for (let i = 3; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i * 7)
        const week = getWeekNumber(d)
        buckets.push({
          key: `w-${d.getFullYear()}-${week}`,
          label: `Sem ${week}`,
          type: 'week',
          year: d.getFullYear(),
          week,
        })
      }
      return buckets
    }

    if (range === '3m') {
      const buckets = []
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        buckets.push({
          key: `m-${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleString('fr-FR', { month: 'short' }),
          type: 'month',
          year: d.getFullYear(),
          month: d.getMonth(),
        })
      }
      return buckets
    }

    const buckets = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        key: `m-${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('fr-FR', { month: 'short' }),
        type: 'month',
        year: d.getFullYear(),
        month: d.getMonth(),
      })
    }
    return buckets
  }

  const groupItemsInBuckets = (items, buckets) => {
    const result = {}
    buckets.forEach((b) => {
      result[b.key] = 0
    })

    items.forEach((item) => {
      if (!item.createdAt) return
      const d = new Date(item.createdAt)
      buckets.forEach((b) => {
        if (b.type === 'week') {
          const week = getWeekNumber(d)
          if (week === b.week && d.getFullYear() === b.year) {
            result[b.key] = result[b.key] + 1
          }
        } else {
          if (d.getFullYear() === b.year && d.getMonth() === b.month) {
            result[b.key] = result[b.key] + 1
          }
        }
      })
    })

    return result
  }

  // build chart
  useEffect(() => {
    if (!chartCanvasRef.current) return

    const buckets = buildActivityBuckets(activityRange)
    const ordersByBucket = groupItemsInBuckets(orders, buckets)
    const invoicesByBucket = groupItemsInBuckets(invoices, buckets)
    const quotesByBucket = groupItemsInBuckets(quotes, buckets)

    const labels = buckets.map((b) => b.label)

    const data = {
      labels,
      datasets: [
        {
          label: 'Commandes',
          data: labels.map((_, i) => ordersByBucket[buckets[i].key] || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          borderRadius: 6,
          barPercentage: 0.25,
          categoryPercentage: 0.6,
        },
        {
          label: 'Factures',
          data: labels.map((_, i) => invoicesByBucket[buckets[i].key] || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.9)',
          borderRadius: 6,
          barPercentage: 0.25,
          categoryPercentage: 0.6,
        },
        {
          label: 'Devis',
          data: labels.map((_, i) => quotesByBucket[buckets[i].key] || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.9)',
          borderRadius: 6,
          barPercentage: 0.25,
          categoryPercentage: 0.6,
        },
      ],
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    chartInstanceRef.current = new Chart(chartCanvasRef.current, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 8,
            padding: 10,
            displayColors: true,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.2)',
            },
          },
        },
      },
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [activityRange, orders, invoices, quotes])

  // download facture
  const handleDownloadInvoice = async (invoice) => {
    try {
      const blob = await invoiceService.downloadInvoice(invoice._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const shortNumber =
        invoice.invoiceNumber?.split('-').slice(0, 3).join('-') || invoice._id
      link.href = url
      link.download = `facture-${shortNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement facture:', err)
    }
  }
  const handleAcceptQuote = (quote) => {
  // On ouvre le modal de paiement de l'acompte pour ce devis
  setAcceptingQuoteId(quote._id)
  setQuotePaymentModal(quote)
}

   

  
  // changement mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')

    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmNewPassword) {
      setPwdError('Veuillez remplir tous les champs.')
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      setPwdError('Les nouveaux mots de passe ne correspondent pas.')
      return
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }

    try {
      setPwdLoading(true)
      await authService.changePassword(pwdForm.currentPassword, pwdForm.newPassword)
      setPwdSuccess('Mot de passe modifié avec succès.')
      setPwdForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setShowCurrentPwd(false)
      setShowNewPwd(false)
      setShowConfirmPwd(false)
    } catch (err) {
      console.error(err)
      setPwdError(err.response?.data?.message || 'Impossible de changer le mot de passe.')
    } finally {
      setPwdLoading(false)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'orders', label: 'Mes Commandes', icon: ShoppingBag },
    { id: 'invoices', label: 'Mes Factures', icon: FileText },
    { id: 'quotes', label: 'Mes Devis', icon: FileText },
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Espace Client</h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-primary/10 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 hover:border-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Espace Client</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Bienvenue, {user?.firstName} 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Voici un aperçu de votre activité
                  </p>
                </div>
              </div>

              {/* Cards top */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Commandes
                    </CardTitle>
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {orders.length}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {orders.length > 0 ? 'Total effectuées' : 'Aucune commande'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Factures
                    </CardTitle>
                    <FileText className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {invoices.length}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {invoices.length > 0 ? 'Documents disponibles' : 'Aucune facture'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Devis
                    </CardTitle>
                    <FileText className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {quotes.length}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {quotes.length > 0 ? 'Demandes envoyées' : 'Aucun devis'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* GRAPH */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Activité</CardTitle>
                    <CardDescription>Commandes, factures et devis</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={activityRange === '1m' ? 'default' : 'outline'}
                      onClick={() => setActivityRange('1m')}
                    >
                      1 mois
                    </Button>
                    <Button
                      size="sm"
                      variant={activityRange === '3m' ? 'default' : 'outline'}
                      onClick={() => setActivityRange('3m')}
                    >
                      3 mois
                    </Button>
                    <Button
                      size="sm"
                      variant={activityRange === '12m' ? 'default' : 'outline'}
                      onClick={() => setActivityRange('12m')}
                    >
                      12 mois
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96 md:h-[420px]">
                    <canvas ref={chartCanvasRef} className="!h-full !w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* bas dashboard */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Commandes récentes</CardTitle>
                    <CardDescription>Vos dernières commandes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Aucune commande pour le moment
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <div
                            key={order._id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div>
                              <p className="font-medium">Commande #{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                              {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
                                order.paymentStatus ||
                                'Paiement inconnu'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Infos compte</CardTitle>
                    <CardDescription>Vos informations personnelles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Nom :</span> {user?.firstName}{' '}
                      {user?.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email :</span> {user?.email}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Mes Commandes */}
           {/* Mes Commandes */}
      {/* Mes Commandes */}
{activeTab === 'orders' && (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Mes Commandes
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Gérez et suivez vos commandes
      </p>
    </div>

    {orders.length === 0 ? (
      <Card>
        <CardContent className="py-16 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
          <p className="text-gray-500 mb-6">
            Vous n&apos;avez pas encore passé de commande
          </p>
          <Button onClick={() => navigate('/offres')}>Découvrir nos offres</Button>
        </CardContent>
      </Card>
    ) : (
      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                N°
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                Offre
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                Montant
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                Paiement
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                Statut
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isOpen = expandedOrderId === order._id
              const depositAmount = order.deposit?.amount
              const balanceAmount = order.balance?.amount
              const canPayBalance =
                order.deposit?.paid &&
                !order.balance?.paid &&
                order.status === 'completed'

              return (
                <>
                  <tr
                    key={order._id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-900/40"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {order.offerId?.name ||
                        order.metadata?.originalItemName ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.amount ? formatPrice(order.amount) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.paymentStatus ? (
                        <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                          {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
                            order.paymentStatus}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={getStatusColor(order.status, 'order')}>
                        {ORDER_STATUS[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedOrderId(isOpen ? null : order._id)
                        }
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {isOpen ? 'Fermer' : 'Détails'}
                      </Button>
                    </td>
                  </tr>

                  {isOpen && (
  <tr>
    <td colSpan={7} className="px-5 pb-4">
      <div className="mt-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-4 text-sm">
        {/* Ligne du haut : Type à gauche / Date + bouton à droite, mais dans une zone limitée */}
        <div className="max-w-xl flex items-start justify-between gap-6">
          <p>
            <span className="font-medium">Type :</span>{' '}
            {order.metadata?.originalItemType || '—'}
          </p>

          <div className="flex flex-col items-end">
            <p>
              <span className="font-medium">Créée le :</span>{' '}
              {formatDate(order.createdAt)}
            </p>

            {canPayBalance && (
              <Button
                size="sm"
                onClick={() => setBalancePaymentModal(order)}
                className="mt-2 cursor-pointer bg-green-500 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payer 60% restant
              </Button>
            )}
          </div>
        </div>

        {order.projectDetails && (
          <div>
            <p className="font-medium mb-1">Détails du projet</p>
            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
              {order.projectDetails.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Délai : {order.projectDetails.deadline}
            </p>
          </div>
        )}

        <div>
          <p className="font-medium mb-1">Paiement</p>
          <p>
            <span className="font-medium">Statut :</span>{' '}
            {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
              order.paymentStatus ||
              '—'}
          </p>
          <p>
            <span className="font-medium">Acompte (40 %) :</span>{' '}
            {depositAmount ? formatPrice(depositAmount) : '—'}{' '}
            {order.deposit?.paid && (
              <span className="text-xs text-green-600 dark:text-green-400">
                (payé)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <p>
              <span className="font-medium">Solde (60 %) :</span>{' '}
              {balanceAmount ? formatPrice(balanceAmount) : '—'}{' '}
              {order.balance?.paid && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  (payé)
                </span>
              )}
            </p>
          </div>
        </div>

        {order.billingInfo &&
          (order.billingInfo.firstName || order.billingInfo.email) && (
            <div>
              <p className="font-medium mb-1">Facturation</p>
              <p>
                {order.billingInfo.firstName} {order.billingInfo.lastName}
              </p>
              <p>{order.billingInfo.email}</p>
            </div>
          )}
      </div>
    </td>
  </tr>
)}

                </>
              )
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}



          {/* Mes Factures */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Mes Factures
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Téléchargez et consultez vos factures liées à vos commandes
                  </p>
                </div>
              </div>

              {invoices.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
                    <p className="text-gray-500">
                      Vos factures apparaîtront ici après vos commandes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                          Facture
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                          Commande
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                          Montant
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                          Statut
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const isOpen = expandedInvoiceId === invoice._id
                        const shortNumber =
                          invoice.invoiceNumber?.split('-').slice(0, 3).join('-') ||
                          invoice.invoiceNumber

                        return (
                          <>
                            <tr
                              key={invoice._id}
                              className="border-t dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-900/40"
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                Facture {shortNumber}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatDate(invoice.createdAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
  {invoice.orderId?.orderNumber || '—'}
</td>

                              <td className="px-4 py-3 whitespace-nowrap">
                                {invoice.total ? formatPrice(invoice.total) : '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Badge variant={getStatusColor(invoice.status, 'invoice')}>
                                  {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="cursor-pointer"
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  title="Télécharger la facture"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setExpandedInvoiceId(isOpen ? null : invoice._id)
                                  }
                                  title="Voir détails"
                                >
                                  {isOpen ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>

                            {isOpen && (
                              <tr>
                                <td colSpan={6} className="px-4 pb-4">
                                  <div className="mt-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2 text-sm">
                                    <p>
                                      <span className="font-medium">Client :</span>{' '}
                                      {invoice.clientInfo?.name ||
                                        `${user?.firstName} ${user?.lastName}`}
                                    </p>
                                    <p>
                                      <span className="font-medium">Email :</span>{' '}
                                      {invoice.clientInfo?.email || user?.email}
                                    </p>
                                    <p>
                                      <span className="font-medium">Statut :</span>{' '}
                                      {invoice.status === 'paid'
                                        ? 'Payée'
                                        : 'En attente'}
                                    </p>
                                    {invoice.items && invoice.items.length > 0 && (
                                      <div className="pt-2">
                                        <p className="font-medium mb-1">
                                          Lignes de facture
                                        </p>
                                        <ul className="space-y-1">
                                          {invoice.items.map((it, idx) => {
                                            const lineAmount =
                                              it.amount ?? it.price ?? it.total ?? 0
                                            return (
                                              <li
                                                key={idx}
                                                className="flex justify-between"
                                              >
                                                <span>{it.description}</span>
                                                <span>
                                                  {formatPrice(
                                                    lineAmount || invoice.total || 0
                                                  )}
                                                </span>
                                              </li>
                                            )
                                          })}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

                    {/* Mes Devis */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mes Devis
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Suivez vos demandes de devis
                </p>
              </div>

              {quotes.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Aucun devis lié à ce compte
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Si vous avez envoyé un devis avec un autre email, il ne
                      s’affichera pas ici.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/devis')}>
                        Demander un devis
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate('/espace-client?tab=dashboard')
                        }
                      >
                        Retour au tableau de bord
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => {
                    const isOpen = expandedQuoteId === quote._id
                    const canAccept =
  (quote.status === 'sent' || quote.status === 'reviewed') &&
  !!quote.proposedAmount &&
  quote.status !== 'accepted'


                    return (
                      <Card
                        key={quote._id}
                        className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <span className="truncate">{quote.name}</span>
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                  • Devis {quote.quoteNumber}
                                </span>
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm">
                                Demande du {formatDate(quote.createdAt)}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getStatusColor(quote.status, 'quote')}
                              >
                                {QUOTE_STATUS[quote.status]}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setExpandedQuoteId(
                                    isOpen ? null : quote._id
                                  )
                                }
                                className="cursor-pointer"
                              >
                                {isOpen ? (
                                  <>
                                    <ChevronUp className="mr-2 h-4 w-4" /> Masquer
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="mr-2 h-4 w-4" /> Plus
                                    de détails
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          {/* résumé rapide */}
                          <div className="grid gap-2 sm:grid-cols-3 text-sm">
                            <p>
                              <span className="font-medium">Type :</span>{' '}
                              {quote.siteType || '—'}
                            </p>
                            <p>
                              <span className="font-medium">Budget :</span>{' '}
                              {quote.budget ? quote.budget : '—'}
                            </p>
                            {quote.proposedAmount && (
                              <p>
                                <span className="font-medium">
                                  Montant proposé :
                                </span>{' '}
                                {formatPrice(quote.proposedAmount)}
                              </p>
                            )}
                          </div>

                          {isOpen && (
                            <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 p-4 space-y-3 text-sm">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <p>
                                  <span className="font-medium">Email :</span>{' '}
                                  {quote.email}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Téléphone :
                                  </span>{' '}
                                  {quote.phone || '—'}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Délai estimé :
                                  </span>{' '}
                                  {quote.deadlineDays
                                    ? `${quote.deadlineDays} jours`
                                    : '—'}
                                </p>
                                {quote.reference && (
                                  <p>
                                    <span className="font-medium">
                                      Référence :
                                    </span>{' '}
                                    {quote.reference}
                                  </p>
                                )}
                                {quote.validUntil && (
                                  <p>
                                    <span className="font-medium">
                                      Offre valable jusqu’au :
                                    </span>{' '}
                                    {formatDate(quote.validUntil)}
                                  </p>
                                )}
                              </div>

                              {quote.description && (
                                <div>
                                  <p className="font-medium mb-1">
                                    Détails de votre projet
                                  </p>
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {quote.description}
                                  </p>
                                </div>
                              )}

                              {quote.adminNotes && (
                                <div>
                                  <p className="font-medium mb-1">
                                    Commentaire de LUM
                                  </p>
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {quote.adminNotes}
                                  </p>
                                </div>
                              )}

                              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <Badge
                                    variant={getStatusColor(
                                      quote.status,
                                      'quote'
                                    )}
                                  >
                                    {QUOTE_STATUS[quote.status] ||
                                      'Demande envoyée'}
                                  </Badge>

                                  {quote.proposedAmount &&
                                    quote.status === 'sent' && (
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        Offre envoyée à{' '}
                                        {formatPrice(quote.proposedAmount)}
                                      </span>
                                    )}
                                </div>

                                {canAccept && (
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleAcceptQuote(quote)}
                                    disabled={
                                      acceptingQuoteId === quote._id
                                    }
                                  >
                                    {acceptingQuoteId === quote._id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Traitement...
                                      </>
                                    ) : (
                                      "Accepter l'offre"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}



          {/* Mon Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mon Profil
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Gérez vos informations personnelles
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Vos informations de compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">
                        Prénom
                      </label>
                      <p className="text-base font-medium">{user?.firstName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">
                        Nom
                      </label>
                      <p className="text-base font-medium">{user?.lastName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-base font-medium">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">
                        Téléphone
                      </label>
                      <p className="text-base font-medium">
                        {user?.phone || 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Changer le mot de passe
                  </CardTitle>
                  <CardDescription>
                    Utilisez votre mot de passe actuel pour en définir un nouveau
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handlePasswordChange}>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPwd ? 'text' : 'password'}
                          value={pwdForm.currentPassword}
                          onChange={(e) =>
                            setPwdForm({
                              ...pwdForm,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPwd((v) => !v)}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPwd ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPwd ? 'text' : 'password'}
                          value={pwdForm.newPassword}
                          onChange={(e) =>
                            setPwdForm({
                              ...pwdForm,
                              newPassword: e.target.value,
                            })
                          }
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd((v) => !v)}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showNewPwd ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">
                        Confirmer le nouveau mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={pwdForm.confirmNewPassword}
                          onChange={(e) =>
                            setPwdForm({
                              ...pwdForm,
                              confirmNewPassword: e.target.value,
                            })
                          }
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd((v) => !v)}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPwd ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {pwdError && <p className="text-sm text-red-500">{pwdError}</p>}
                    {pwdSuccess && (
                      <p className="text-sm text-green-500">{pwdSuccess}</p>
                    )}
                    <Button type="submit" disabled={pwdLoading} className="bg-violet-500 text-white">
                      {pwdLoading ? 'Modification...' : 'Mettre à jour le mot de passe'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Support - Tickets */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Support
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Créez un ticket et suivez les réponses.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Filtrer :
                  </label>
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value)}
                    className="text-sm bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="all">Tous</option>
                    <option value="open">Ouverts</option>
                    <option value="pending">En cours</option>
                    <option value="answered">Répondu</option>
                    <option value="closed">Fermés</option>
                  </select>
                  <Button variant="outline" onClick={fetchTickets}>
                    Recharger
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Formulaire nouveau ticket */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Nouveau ticket</CardTitle>
                    <CardDescription>
                      Décrivez précisément votre demande
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleCreateTicket}>
                      <div className="space-y-2">
                        <Label>Sujet *</Label>
                        <Input
                          placeholder="Ex: Erreur de paiement sur ma commande"
                          value={ticketForm.subject}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              subject: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Catégorie</Label>
                          <select
                            value={ticketForm.category}
                            onChange={(e) =>
                              setTicketForm({
                                ...ticketForm,
                                category: e.target.value,
                              })
                            }
                            className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-2 text-sm"
                          >
                            <option>Technique</option>
                            <option>Facturation</option>
                            <option>Commande</option>
                            <option>Devis</option>
                            <option>Autre</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Priorité</Label>
                          <select
                            value={ticketForm.priority}
                            onChange={(e) =>
                              setTicketForm({
                                ...ticketForm,
                                priority: e.target.value,
                              })
                            }
                            className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-2 text-sm"
                          >
                            <option>Normal</option>
                            <option>Haute</option>
                            <option>Urgente</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Message *</Label>
                        <textarea
                          required
                          rows={5}
                          className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-2 text-sm"
                          placeholder="Expliquez le problème, les étapes pour le reproduire, etc."
                          value={ticketForm.message}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Paperclip className="h-4 w-4" />
                          <span>Pièce jointe (optionnel)</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              setTicketFile(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        {ticketFile && (
                          <span className="text-xs text-gray-500 truncate max-w-[220px]">
                            {ticketFile.name}
                          </span>
                        )}
                      </div>

                      {ticketsError && (
                        <p className="text-sm text-red-500">{ticketsError}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={ticketCreating}
                        className="flex items-center gap-2 rounded-full bg-blue-500 text-white hover:bg-primary/90 px-5 py-2 shadow-sm"
                      >
                        {ticketCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Envoyer
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Liste tickets */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Mes tickets</CardTitle>
                    <CardDescription>Suivez l’avancement et répondez</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ticketsLoading ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                      </div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="text-gray-500">Aucun ticket.</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTickets.map((t) => {
                          const open = expandedTicketId === t._id
                          return (
                            <div
                              key={t._id}
                              className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900/40"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{t.subject}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span>Catégorie: {t.category}</span>
                                    <span>•</span>
                                    <span>Priorité: {t.priority}</span>
                                    <span>•</span>
                                    <span>Créé: {formatDate(t.createdAt)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getTicketBadgeVariant(t.status)}>
                                    {TICKET_STATUS_LABELS[t.status] || t.status}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setExpandedTicketId(open ? null : t._id)
                                    }
                                  >
                                    {open ? 'Masquer' : 'Ouvrir'}
                                  </Button>
                                </div>
                              </div>

                              {open && (
                                <div className="mt-3 space-y-3">
                                  <div className="rounded-md bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 max-h-64 overflow-auto">
                                    {t.messages.length === 0 ? (
                                      <p className="text-sm text-gray-500">
                                        Aucun message pour le moment.
                                      </p>
                                    ) : (
                                      <ul className="space-y-2">
                                        {t.messages.map((m) => (
                                          <li key={m._id} className="text-sm">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                                {m.senderRole === 'staff'
                                                  ? 'Support'
                                                  : 'Moi'}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {formatDate(m.createdAt)}
                                              </span>
                                            </div>

                                            <p className="mt-1 whitespace-pre-wrap">
                                              {m.message}
                                            </p>

                                            {m.attachments &&
                                              m.attachments.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                  {m.attachments.map((att, idx) => (
                                                    <a
                                                      key={idx}
                                                      href={`http://localhost:5000${att.path}`}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      className="inline-flex items-center text-xs text-blue-600 hover:underline"
                                                    >
                                                      <Paperclip className="h-3 w-3 mr-1" />
                                                      {att.originalName ||
                                                        `Pièce jointe ${idx + 1}`}
                                                    </a>
                                                  ))}
                                                </div>
                                              )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>

                                  {!isTicketLocked(t.status) && (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        placeholder="Votre réponse..."
                                        value={replyByTicketId[t._id] || ''}
                                        onChange={(e) =>
                                          setReplyByTicketId((prev) => ({
                                            ...prev,
                                            [t._id]: e.target.value,
                                          }))
                                        }
                                      />
                                      <Button
                                        disabled={
                                          replyLoadingId === t._id ||
                                          !(replyByTicketId[t._id] || '').trim()
                                        }
                                        onClick={() => handleReplyTicket(t._id)}
                                        className="flex items-center gap-2"
                                      >
                                        {replyLoadingId === t._id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4" />
                                        )}
                                        Envoyer
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>


      {/* Modal de paiement du solde */}
      {balancePaymentModal && (
        <Elements stripe={stripePromise}>
          <BalancePaymentModal
            isOpen={!!balancePaymentModal}
            onClose={() => setBalancePaymentModal(null)}
            order={balancePaymentModal}
            onPaymentSuccess={handleRefreshOrders}
          />
        </Elements>
      )}
       {/* Modal de paiement de l'acompte sur devis */}
{quotePaymentModal && (
  <Elements stripe={stripePromise}>
    <QuotePaymentModal
      isOpen={!!quotePaymentModal}
      quote={quotePaymentModal}
      onClose={() => {
        setQuotePaymentModal(null)
        setAcceptingQuoteId(null)
      }}
      onPaymentSuccess={async (updatedQuote, newOrder) => {
        if (updatedQuote) {
          setQuotes((prev) =>
            prev.map((q) => (q._id === updatedQuote._id ? updatedQuote : q))
          )
        }

        if (newOrder) {
          setOrders((prev) => {
            if (!Array.isArray(prev)) return [newOrder]
            const exists = prev.some((o) => o._id === newOrder._id)
            return exists ? prev : [newOrder, ...prev]
          })
        }

        // On bascule sur l'onglet Commandes après acceptation + paiement
        setActiveTab('orders')
      }}
    />
  </Elements>
)}

      {/* Bouton WhatsApp fixe */}
      <a
        href="https://wa.me/33699477196"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter sur WhatsApp"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        style={{
          backgroundColor: '#25D366',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="white"
          aria-hidden="true"
        >
          <path d="M19.11 17.24c-.29-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.29-.74.91-.91 1.09-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.76-1.44-1.69-1.61-1.97-.17-.29-.02-.45.12-.59.12-.12.29-.31.43-.46.14-.14.19-.24.29-.43.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.1-.23-.55-.47-.47-.64-.47-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2 3.06 4.83 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.67-.68 1.9-1.33.24-.65.24-1.21.17-1.33-.07-.12-.26-.19-.55-.33zM27.5 4.5C24.7 1.7 20.97.2 17.03.2 7.98.2.63 7.55.63 16.6c0 2.83.74 5.6 2.15 8.03L.2 31.8l7.37-2.53c2.36 1.28 5.02 1.95 7.74 1.95 9.05 0 16.4-7.35 16.4-16.4 0-3.94-1.53-7.67-4.41-10.52zM17.31 28.5c-2.55 0-5.04-.68-7.21-1.96l-.52-.31-4.38 1.5 1.46-4.26-.34-.55c-1.34-2.18-2.05-4.69-2.05-7.21C4.27 9.39 10.29 3.37 17.31 3.37c3.47 0 6.74 1.35 9.19 3.81s3.81 5.72 3.81 9.19c0 7.02-6.02 13.13-13 12.13z" />
        </svg>
      </a>
    </div>
  )
}

export default ClientSpace