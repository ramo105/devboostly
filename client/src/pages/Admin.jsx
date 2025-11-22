// src/pages/Admin.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LifeBuoy, Send, MessageCircle, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import DashboardOverview from './DashboardOverview'
import {
  Users,
  ShoppingBag,
  FileText,
  DollarSign,
  LogOut,
  Shield,
  Home,
  Menu,
  X,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

import { adminService } from '../services/adminService'
import { invoiceService } from '../services/invoiceService.js'
import api from '../lib/api'

function Admin() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingQuotes: 0,
    activeProjects: 0,
    pendingInvoices: 0,
  })

  // users
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userError, setUserError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [userHistory, setUserHistory] = useState({
    orders: [],
    invoices: [],
    quotes: [],
  })
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null)
  const [expandedUserQuoteId, setExpandedUserQuoteId] = useState(null)

  // modal création user
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'client', // ← rôle sélectionnable (client | admin)
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

    // devis admin
  const [quotes, setQuotes] = useState([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [expandedAdminQuoteId, setExpandedAdminQuoteId] = useState(null)
  const [quoteSort, setQuoteSort] = useState('recent')
  const [quoteEdits, setQuoteEdits] = useState({})




  // commandes admin
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedAdminOrderId, setExpandedAdminOrderId] = useState(null)
  const [orderSort, setOrderSort] = useState('recent')
  const [ordersSearch, setOrdersSearch] = useState('')

  // factures admin
  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [expandedAdminInvoiceId, setExpandedAdminInvoiceId] = useState(null)
  const [invoiceSort, setInvoiceSort] = useState('recent')
  const [invoiceSearch, setInvoiceSearch] = useState('')
    const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessages, setReplyMessages] = useState({})
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all')
  const [ticketSearch, setTicketSearch] = useState('')
  const [showTrash, setShowTrash] = useState(false)



const loadTickets = async () => {
  setTicketsLoading(true)
  try {
    const response = await api.get('/tickets/all')
    setTickets(response.data)
  } catch (error) {
    console.error('Erreur chargement tickets:', error)
  } finally {
    setTicketsLoading(false)
  }
}
useEffect(() => {
  if (activeTab === 'support') {
    loadTickets()
  }
}, [activeTab])
const handleChangeStatus = async (ticketId, newStatus) => {
  try {
    await api.patch(`/tickets/${ticketId}/status`, { status: newStatus })
    loadTickets() // Recharger
    alert('Statut modifié avec succès')
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Envoyer une réponse
const handleSendAdminReply = async (ticketId) => {
  const message = replyMessages[ticketId]?.trim()
  if (!message) return

  try {
    await api.post(`/tickets/${ticketId}/messages`, {
      message,
    })
    // on vide juste le champ de ce ticket
    setReplyMessages((prev) => ({
      ...prev,
      [ticketId]: '',
    }))
    loadTickets()
    alert('Réponse envoyée')
  } catch (error) {
    console.error('Erreur envoi réponse:', error)
    alert("Erreur lors de l'envoi")
  }
}
const handleMoveTicketToTrash = async (ticketId) => {
  try {
    await api.patch(`/tickets/${ticketId}/trash`)
    await loadTickets()
  } catch (error) {
    console.error('Erreur mise à la corbeille:', error)
    alert('Erreur lors de la mise à la corbeille du ticket')
  }
}

const handleRestoreTicketFromTrash = async (ticketId) => {
  try {
    await api.patch(`/tickets/${ticketId}/restore`)
    await loadTickets()
  } catch (error) {
    console.error('Erreur restauration ticket:', error)
    alert('Erreur lors de la restauration du ticket')
  }
}


const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'answered':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'refunded':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
const getStatusLabel = (status) => {
  switch (status) {
    case 'open':
      return 'Ouvert'
    case 'answered':
      return 'Répondu'
    case 'pending':
      return 'En attente'
    case 'resolved':
      return 'Résolu'
    case 'refunded':
      return 'Remboursé'
    case 'closed':
      return 'Terminé'
    default:
      return status
  }
}
  const filteredActiveTickets = tickets.filter((t) => {
    // on masque ceux en corbeille
    if (t.isDeleted) return false

    // filtre statut
    if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) {
      return false
    }

    // filtre texte (sujet / email / nom)
    if (!ticketSearch.trim()) return true

    const q = ticketSearch.toLowerCase()
    const subject = (t.subject || '').toLowerCase()
    const email = (t.user?.email || '').toLowerCase()
    const name = `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.toLowerCase()

    return subject.includes(q) || email.includes(q) || name.includes(q)
  })

  const trashedTickets = tickets.filter((t) => t.isDeleted)

  // liste affichée selon le mode (tickets actifs ou corbeille)
  const currentTickets = showTrash ? trashedTickets : filteredActiveTickets


  useEffect(() => {
    if (user && !isAdmin && user?.role !== 'admin') {
      navigate('/espace-client')
      return
    }
    const run = async () => {
      await Promise.all([
        loadDashboard(),
        fetchUsers(),
        fetchAllQuotes(),
        fetchOrders(),
        fetchInvoices(),
      ])
      setLoading(false)
    }
    run()
  }, [user, isAdmin, navigate])

  // ====== utils montant ======
  const parseMoneyLike = (val) => {
    if (val == null) return 0
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^\d.,-]/g, '').replace(',', '.')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const getInvoiceTotal = (inv) => {
    if (!inv) return 0
    if (inv.total != null) return parseMoneyLike(inv.total)
    if (inv.amount != null) return parseMoneyLike(inv.amount)
    return 0
  }

  // ====== deadline facture ======
  const getInvoiceDueDate = (inv) => {
    if (!inv) return null
    return (
      inv.dueDate ||
      inv.paymentDueDate ||
      inv.deadline ||
      inv.deadlines ||
      inv.orderId?.projectDetails?.deadline ||
      inv.orderId?.deadline ||
      null
    )
  }

  // ====== load dashboard ======
  const loadDashboard = async () => {
    try {
      const res = await adminService.getDashboard()
      const payload = res?.data?.data || res?.data || res
      if (payload?.overview) {
        setStats({
          totalUsers: payload.overview.totalUsers || 0,
          totalOrders: payload.overview.totalOrders || 0,
          totalRevenue: payload.overview.totalRevenue || 0,
          pendingQuotes: payload.overview.pendingQuotes || 0,
          activeProjects: payload.overview.activeProjects || 0,
          pendingInvoices: payload.overview.pendingInvoices || 0,
        })
      } else {
        setStats((prev) => ({ ...prev, ...(payload || {}) }))
      }
    } catch (err) {
      console.error('Erreur dashboard admin:', err)
    }
  }

  // ====== users ======
  const fetchUsers = async () => {
    setUsersLoading(true)
    setUserError('')
    try {
      const res = await adminService.getUsers()
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.users)
        ? res.users
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : []
      setUsers(list)

      if (selectedUser && list.every((u) => u._id !== selectedUser._id)) {
        setSelectedUser(null)
        setUserHistory({ orders: [], invoices: [], quotes: [] })
      }
    } catch (err) {
      console.error('Erreur chargement users:', err)
      setUserError("Impossible de charger les utilisateurs.")
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchUserHistory = async (userId) => {
    setHistoryLoading(true)
    setExpandedOrderId(null)
    setExpandedInvoiceId(null)
    setExpandedUserQuoteId(null)
    try {
      const res = await adminService.getUserHistory(userId)
      const payload = res?.data?.data || res?.data || res
      setUserHistory({
        orders: payload?.orders || [],
        invoices: payload?.invoices || [],
        quotes: payload?.quotes || [],
      })
    } catch (err) {
      console.error('Erreur historique user:', err)
      setUserHistory({ orders: [], invoices: [], quotes: [] })
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSelectUser = (u) => {
    setSelectedUser(u)
    fetchUserHistory(u._id)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateError('')

    if (
      !createForm.email ||
      !createForm.password ||
      !createForm.firstName ||
      !createForm.lastName
    ) {
      setCreateError('Prénom, nom, email et mot de passe sont obligatoires.')
      return
    }

    try {
      setCreateLoading(true)

      const role = createForm.role === 'admin' ? 'admin' : 'client'
      const payload = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone?.trim() || undefined,
        password: createForm.password,
        role,
        isAdmin: role === 'admin',
      }

      await adminService.createUser(payload)
      await fetchUsers()
      await loadDashboard()

      setShowCreateModal(false)
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'client',
      })
    } catch (err) {
      console.error(err)
      setCreateError(err.response?.data?.message || "Impossible de créer l'utilisateur.")
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const s = search.toLowerCase()
    return users.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(s) ||
        u.lastName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.phone?.toLowerCase?.().includes(s)
    )
  }, [users, search])

  // ====== devis ======
  const fetchAllQuotes = async () => {
    setQuotesLoading(true)
    try {
      const res = await api.get('/quotes')
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : []
      setQuotes(list)
      setStats((prev) => ({
        ...prev,
        pendingQuotes:
          prev.pendingQuotes && prev.pendingQuotes > 0 ? prev.pendingQuotes : list.length,
      }))
    } catch (err) {
      console.error('Erreur chargement devis admin:', err)
      setQuotes([])
    } finally {
      setQuotesLoading(false)
    }
  }

        const handleUpdateQuoteStatus = async (quoteId, newStatus, options = {}) => {
    try {
      const edits = quoteEdits[quoteId] || {}

      const payload = {
        status: newStatus,
      }

      const proposed =
        options.proposedAmount ?? edits.proposedAmount
      const validUntil =
        options.validUntil ?? edits.validUntil
      const adminNotes =
        options.adminNotes ?? edits.adminNotes

      if (proposed !== undefined && proposed !== '') {
        payload.proposedAmount = Number(proposed)
      }
      if (validUntil) {
        payload.validUntil = validUntil // string 'YYYY-MM-DD', Mongoose cast
      }
      if (adminNotes !== undefined) {
        payload.adminNotes = adminNotes
      }

      const res = await api.put(`/quotes/${quoteId}/status`, payload)
      const updated = res.data?.data || res.data || {}

      setQuotes((prev) =>
        prev.map((q) => (q._id === quoteId ? { ...q, ...updated } : q))
      )

      setUserHistory((prev) => ({
        ...prev,
        quotes: prev.quotes.map((q) =>
          q._id === quoteId ? { ...q, ...updated } : q
        ),
      }))

      setQuoteEdits((prev) => {
        const copy = { ...prev }
        delete copy[quoteId]
        return copy
      })

      if (newStatus === 'sent') {
        alert('Devis envoyé au client.')
      }
    } catch (err) {
      console.error('Erreur maj statut devis:', err)
      alert('Erreur lors de la mise à jour du devis.')
    }
  }



   const handleQuoteFieldChange = (quoteId, field, value) => {
    setQuoteEdits((prev) => ({
      ...prev,
      [quoteId]: {
        ...(prev[quoteId] || {}),
        [field]: value,
      },
    }))
  }

    const sortedQuotes = useMemo(() => {
    const base = Array.isArray(quotes) ? [...quotes] : []

    if (!base.length) return base

    switch (quoteSort) {
      case 'amount-low':
        return base.sort(
          (a, b) =>
            (parseMoneyLike(a.proposedAmount || a.budget || a.total || a.amount) || 0) -
            (parseMoneyLike(b.proposedAmount || b.budget || b.total || b.amount) || 0)
        )
      case 'amount-high':
        return base.sort(
          (a, b) =>
            (parseMoneyLike(b.proposedAmount || b.budget || b.total || b.amount) || 0) -
            (parseMoneyLike(a.proposedAmount || a.budget || a.total || a.amount) || 0)
        )
      case 'oldest':
        return base.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case 'recent':
      default:
        return base.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }, [quotes, quoteSort, parseMoneyLike])


  const QUOTE_STATUS_LABELS = {
    pending: 'En attente',
    reviewed: 'En cours',
    sent: 'Envoyé',
    accepted: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    rejected: 'Refusé',
  }
   // ====== Paiement commandes (acompte / total) ======
  const PAYMENT_STATUS_LABELS = {
    unpaid: 'Non payé',
    deposit_paid: 'Acompte payé',
    paid: 'Payé (100 %)',
  }
  const getPaymentStatusBadgeClasses = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'deposit_paid':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }
  // ====== commandes ======
  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await api.get('/orders')
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : []
      setOrders(list)

      const totalFromOrders = list.reduce(
        (sum, o) => sum + (parseMoneyLike(o.amount) || 0),
        0
      )
      setStats((prev) => ({
        ...prev,
        totalOrders:
          prev.totalOrders && prev.totalOrders > 0 ? prev.totalOrders : list.length,
        totalRevenue:
          prev.totalRevenue && prev.totalRevenue > 0 ? prev.totalRevenue : totalFromOrders,
      }))
    } catch (err) {
      console.error('Erreur chargement commandes admin:', err)
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
      setUserHistory((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        ),
      }))
    } catch (err) {
      console.error('Erreur maj statut commande:', err)
    }
  }

  const filteredOrders = useMemo(() => {
    if (!ordersSearch) return orders
    const s = ordersSearch.toLowerCase()
    return orders.filter((o) => {
      const name = o.userId
        ? `${o.userId.firstName || ''} ${o.userId.lastName || ''}`.trim().toLowerCase()
        : ''
      const email = o.userId?.email?.toLowerCase() || ''
      return name.includes(s) || email.includes(s)
    })
  }, [orders, ordersSearch])

  const sortedOrders = useMemo(() => {
    const base = Array.isArray(filteredOrders) ? [...filteredOrders] : []
    return base.sort((a, b) => {
      const amountA = parseMoneyLike(a.amount)
      const amountB = parseMoneyLike(b.amount)
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()

      switch (orderSort) {
        case 'oldest':
          return dateA - dateB
        case 'amount-low':
          return amountA - amountB
        case 'amount-high':
          return amountB - amountA
        case 'recent':
        default:
          return dateB - dateA
      }
    })
  }, [filteredOrders, orderSort, parseMoneyLike])

  const ORDER_STATUS_OPTIONS = [
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En traitement' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
  ]

  // ====== factures ======
  const fetchInvoices = async () => {
    setInvoicesLoading(true)
    try {
      const res = await api.get('/invoices')
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : []
      setInvoices(list)
      setStats((prev) => ({
        ...prev,
        pendingInvoices: list.length,
      }))
    } catch (err) {
      console.error('Erreur chargement factures admin:', err)
      setInvoices([])
    } finally {
      setInvoicesLoading(false)
    }
  }

  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch) return invoices
    const s = invoiceSearch.toLowerCase()
    return invoices.filter((inv) => {
      const name = inv.userId
        ? `${inv.userId.firstName || ''} ${inv.userId.lastName || ''}`
            .trim()
            .toLowerCase()
        : (inv.clientInfo?.name || '').toLowerCase()
      const email =
        inv.userId?.email?.toLowerCase() || inv.clientInfo?.email?.toLowerCase() || ''
      return name.includes(s) || email.includes(s)
    })
  }, [invoices, invoiceSearch])

  const sortedInvoices = useMemo(() => {
    const base = Array.isArray(filteredInvoices) ? [...filteredInvoices] : []
    return base.sort((a, b) => {
      const totalA = getInvoiceTotal(a)
      const totalB = getInvoiceTotal(b)
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()

      switch (invoiceSort) {
        case 'oldest':
          return dateA - dateB
        case 'amount-low':
          return totalA - totalB
        case 'amount-high':
          return totalB - totalA
        case 'recent':
        default:
          return dateB - dateA
      }
    })
  }, [filteredInvoices, invoiceSort])

  const handleDownloadInvoice = async (id, invoiceNumber) => {
    try {
      const blob = await invoiceService.downloadInvoice(id)
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${invoiceNumber || id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err)
    }
  }
  // ====== helper pour URL de fichiers ======
  const buildFileUrl = (pathOrUrl) => {
    if (!pathOrUrl) return ''

    // Déjà une URL complète → on ne touche pas
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

    // On part de la base de l'API (ex: http://localhost:5000/api)
    const apiBase = api?.defaults?.baseURL || ''

    if (!apiBase) return pathOrUrl

    // On enlève /api pour revenir à la racine serveur
    const root = apiBase.replace(/\/api\/?$/, '')

    return `${root}${pathOrUrl}`
  }

  // ====== helpers UI ======
  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0)

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDueDate = (val) => {
    if (!val) return '—'
    const d = new Date(val)
    if (!isNaN(d.getTime())) return formatDate(val)
    return val
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'quotes', label: 'Devis', icon: FileText },
    { id: 'invoices', label: 'Factures', icon: AlertCircle },
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
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary font-medium">
                  {isAdmin || user?.isAdmin || user?.role === 'admin'
                    ? 'Administrateur'
                    : 'Client'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
  setActiveTab(item.id)
  setSidebarOpen(false)
}}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                      active
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
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Admin</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
  <DashboardOverview 
    stats={stats} 
    orders={orders} 
    quotes={quotes} 
  />
)}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Utilisateurs
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gérez tous les utilisateurs inscrits
                  </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email, téléphone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {filteredUsers.length} utilisateur(s)
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Liste</CardTitle>
                    <CardDescription>
                      Cliquez sur un utilisateur pour voir son historique
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[460px] overflow-y-auto divide-y dark:divide-gray-700">
                      {usersLoading ? (
                        <div className="p-4 text-sm text-gray-500">Chargement...</div>
                      ) : userError ? (
                        <div className="p-4 text-sm text-red-500">{userError}</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">
                          Aucun utilisateur trouvé.
                        </div>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSel = selectedUser?._id === u._id
                          return (
                            <button
                              key={u._id}
                              onClick={() => handleSelectUser(u)}
                              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 ${
                                isSel ? 'bg-gray-100 dark:bg-gray-900/60' : ''
                              }`}
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {getInitials(u.firstName, u.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {u.email}
                                </p>
                                {u.phone && (
                                  <p className="text-xs text-gray-400 truncate">
                                    {u.phone}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                {u.role === 'admin' || u.isAdmin ? 'Admin' : 'Client'}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Historique</CardTitle>
                    <CardDescription>
                      Commandes, factures, devis du client sélectionné
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!selectedUser ? (
                      <p className="text-sm text-gray-500">
                        Sélectionnez un utilisateur à gauche.
                      </p>
                    ) : historyLoading ? (
                      <p className="text-sm text-gray-500">Chargement...</p>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium mb-2">Commandes</p>
                          {userHistory.orders.length === 0 ? (
                            <p className="text-xs text-gray-400">
                              Aucune commande pour cet utilisateur.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userHistory.orders.map((o) => {
                                const open = expandedOrderId === o._id
                                const budget =
                                  o.projectDetails?.budget ||
                                  o.metadata?.budget ||
                                  o.orderData?.budget
                                return (
                                  <div
                                    key={o._id}
                                    className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900/40"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-medium">
                                          CMD-{o.orderNumber || o._id.slice(-6)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {formatDate(o.createdAt)}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setExpandedOrderId(open ? null : o._id)
                                        }
                                      >
                                        {open ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    {open && (
                                      <div className="mt-2 text-xs space-y-1">
                                        <p>Montant : {formatPrice(parseMoneyLike(o.amount))}</p>
                                        {budget && (
                                          <p>Budget : {formatPrice(parseMoneyLike(budget))}</p>
                                        )}
                                        <p>Statut : {o.status}</p>
                                        <p>Offre : {o.offerId?.name || '—'}</p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium mb-2">Factures</p>
                          {userHistory.invoices.length === 0 ? (
                            <p className="text-xs text-gray-400">
                              Aucune facture pour cet utilisateur.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userHistory.invoices.map((inv) => {
                                const open = expandedInvoiceId === inv._id
                                const invDue = getInvoiceDueDate(inv)
                                return (
                                  <div
                                    key={inv._id}
                                    className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900/40"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-medium">
                                          Facture {inv.invoiceNumber || inv._id.slice(-6)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {formatDate(inv.createdAt)}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setExpandedInvoiceId(open ? null : inv._id)
                                        }
                                      >
                                        {open ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    {open && (
                                      <div className="mt-2 text-xs space-y-1">
                                        <p>Total : {formatPrice(getInvoiceTotal(inv))}</p>
                                        <p>Statut : {inv.status}</p>
                                        <p>
                                          Commande :{' '}
                                          {inv.orderId?.orderNumber
                                            ? `CMD-${inv.orderId.orderNumber}`
                                            : '—'}
                                        </p>
                                        {invDue && (
                                          <p>Échéance : {formatDueDate(invDue)}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium mb-2">Devis</p>
                          {userHistory.quotes.length === 0 ? (
                            <p className="text-xs text-gray-400">
                              Aucun devis pour cet utilisateur.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userHistory.quotes.map((q) => {
                                const open = expandedUserQuoteId === q._id
                                const amount =
                                  parseMoneyLike(q.proposedAmount) ||
                                  parseMoneyLike(q.budget) ||
                                  parseMoneyLike(q.total) ||
                                  parseMoneyLike(q.amount)
                                return (
                                  <div
                                    key={q._id}
                                    className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900/40"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-medium">
                                          Devis {q.quoteNumber || q._id.slice(-6)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {formatDate(q.createdAt)}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setExpandedUserQuoteId(open ? null : q._id)
                                        }
                                      >
                                        {open ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    {open && (
                                      <div className="mt-2 text-xs space-y-1">
                                        <p>Montant : {formatPrice(amount)}</p>
                                        <p>
                                          Statut :{' '}
                                          {QUOTE_STATUS_LABELS[q.status] || q.status}
                                        </p>
                                        <p>Description : {q.description || '—'}</p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* modal create user */}
              {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <h2 className="text-lg font-semibold">Créer un utilisateur</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCreateModal(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <form onSubmit={handleCreateUser} className="p-4 space-y-3">
                      <Input
                        placeholder="Prénom"
                        value={createForm.firstName}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, firstName: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Nom"
                        value={createForm.lastName}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, lastName: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, email: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Téléphone"
                        value={createForm.phone}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, phone: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Mot de passe"
                        type="password"
                        value={createForm.password}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, password: e.target.value })
                        }
                      />

                      {/* Sélecteur de rôle */}
                      <div className="space-y-1">
                        <label className="text-sm text-gray-600 dark:text-gray-300">
                          Rôle
                        </label>
                        <select
                          value={createForm.role}
                          onChange={(e) =>
                            setCreateForm({ ...createForm, role: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Administrateur</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Le rôle <b>Administrateur</b> créera l’utilisateur avec{' '}
                          <code>role="admin"</code> et <code>isAdmin=true</code>.
                        </p>
                      </div>

                      {createError && (
                        <p className="text-sm text-red-500">{createError}</p>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateModal(false)}
                        >
                          Annuler
                        </Button>
                        <Button type="submit" disabled={createLoading}>
                          {createLoading ? 'Création...' : 'Créer'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEVIS (admin) */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Tous les devis
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gère les demandes de devis, fixe le prix et envoie l&apos;offre au client.
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={quoteSort}
                    onChange={(e) => setQuoteSort(e.target.value)}
                    className="text-sm bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="recent">Plus récent</option>
                    <option value="oldest">Plus ancien</option>
                    <option value="amount-high">Montant décroissant</option>
                    <option value="amount-low">Montant croissant</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAllQuotes}
                  >
                    Recharger
                  </Button>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Devis</CardTitle>
                  <CardDescription>
                    Liste des demandes de devis reçues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {quotesLoading ? (
                    <div className="p-6 text-sm text-gray-500">Chargement...</div>
                  ) : sortedQuotes.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">Aucun devis enregistré.</div>
                  ) : (
                    <>
                      {/* Table desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-900/30">
                            <tr>
                              <th className="px-4 py-3 text-left">Devis</th>
                              <th className="px-4 py-3 text-left">Client</th>
                              <th className="px-4 py-3 text-left">Contact</th>
                              <th className="px-4 py-3 text-left">Montant</th>
                              <th className="px-4 py-3 text-left">Statut</th>
                              <th className="px-4 py-3 text-left">Date</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedQuotes.map((q) => {
                              const isOpen = expandedAdminQuoteId === q._id
                              const email =
                                q.email || q.client?.email || q.userId?.email || '—'
                              const phone =
                                q.phone || q.client?.phone || q.userId?.phone || '—'
                              const siteType = q.siteType || q.projectType || '—'
                              const budgetText =
                                typeof q.budget === 'string'
                                  ? q.budget
                                  : q.budget
                                  ? formatPrice(parseMoneyLike(q.budget))
                                  : '—'
                              const amount =
                                parseMoneyLike(q.proposedAmount) ||
                                parseMoneyLike(q.budget) ||
                                0

                              return (
                                <React.Fragment key={q._id}>
                                  <tr className="border-t dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-900/50">
                                    <td className="px-4 py-3">
                                      <p className="font-medium">
                                        {q.quoteNumber || q._id.slice(-6)}
                                      </p>
                                      <p className="text-xs text-gray-400">{siteType}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="text-sm font-medium">
                                        {q.client?.firstName ||
                                          q.userId?.firstName ||
                                          q.name ||
                                          '—'}{' '}
                                        {q.client?.lastName || q.userId?.lastName || ''}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="text-xs text-gray-400">{email}</p>
                                      {phone !== '—' && (
                                        <p className="text-xs text-gray-400">{phone}</p>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      {amount
                                        ? formatPrice(amount)
                                        : budgetText}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                                        {QUOTE_STATUS_LABELS[q.status] || q.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      {formatDate(q.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <select
                                          value={q.status}
                                          onChange={(e) =>
                                            handleUpdateQuoteStatus(q._id, e.target.value)
                                          }
                                          className="text-xs border rounded px-2 py-1 bg-transparent"
                                        >
                                          <option  className="bg-blue-500" value="pending">En attente</option>
                                          <option className="bg-blue-500" value="reviewed">En cours</option>
                                          <option className="bg-blue-500"value="sent">Envoyé</option>
                                          <option className="bg-blue-500"value="accepted">Confirmé</option>
                                          <option className="bg-blue-500"value="completed">Terminé</option>
                                          <option className="bg-blue-500"value="cancelled">Annulé</option>
                                          <option className="bg-blue-500"value="rejected">Refusé</option>
                                        </select>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            setExpandedAdminQuoteId(
                                              isOpen ? null : q._id
                                            )
                                          }
                                        >
                                          {isOpen ? 'Fermer' : 'Détails'}
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>

                                  {isOpen && (
                                    <tr className="bg-gray-50 dark:bg-gray-900/30">
                                      <td colSpan={7} className="px-4 pb-4">
                                        <div className="mt-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm space-y-4">
                                          <div className="grid gap-3 sm:grid-cols-3">
                                            <div>
                                              <p className="text-xs text-gray-500">Email</p>
                                              <p className="font-medium">{email}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">Téléphone</p>
                                              <p className="font-medium">{phone}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">
                                                Type de site
                                              </p>
                                              <p className="font-medium">{siteType}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">
                                                Budget client
                                              </p>
                                              <p className="font-medium">
                                                {budgetText}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">
                                                Montant proposé (admin)
                                              </p>
                                              <p className="font-medium">
                                                {q.proposedAmount
                                                  ? formatPrice(
                                                      parseMoneyLike(q.proposedAmount)
                                                    )
                                                  : '—'}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">
                                                Créé le
                                              </p>
                                              <p className="font-medium">
                                                {formatDate(q.createdAt)}
                                              </p>
                                            </div>
                                            {q.validUntil && (
                                              <div>
                                                <p className="text-xs text-gray-500">
                                                  Valable jusqu&apos;au
                                                </p>
                                                <p className="font-medium">
                                                  {formatDate(q.validUntil)}
                                                </p>
                                              </div>
                                            )}
                                          </div>

                                          <div className="mt-4">
                                            <p className="text-xs text-gray-500 mb-1">
                                              Description
                                            </p>
                                            <p className="whitespace-pre-wrap">
                                              {q.description || '—'}
                                            </p>
                                          </div>

                                          {/* Édition de l'offre */}
                                          <div className="mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                              Préparation de l&apos;offre
                                            </p>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                              <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                  Montant proposé (TTC)
                                                </p>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  step="0.01"
                                                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-sm"
                                                  value={
                                                    quoteEdits[q._id]?.proposedAmount ??
                                                    (q.proposedAmount ?? '')
                                                  }
                                                  onChange={(e) =>
                                                    handleQuoteFieldChange(
                                                      q._id,
                                                      'proposedAmount',
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>

                                              <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                  Valable jusqu&apos;au
                                                </p>
                                                <input
                                                  type="date"
                                                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-sm"
                                                  value={
                                                    quoteEdits[q._id]?.validUntil ??
                                                    (q.validUntil
                                                      ? new Date(
                                                          q.validUntil
                                                        )
                                                          .toISOString()
                                                          .slice(0, 10)
                                                      : '')
                                                  }
                                                  onChange={(e) =>
                                                    handleQuoteFieldChange(
                                                      q._id,
                                                      'validUntil',
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>

                                              <div className="sm:col-span-3">
                                                <p className="text-xs text-gray-500 mb-1">
                                                  Message au client (optionnel)
                                                </p>
                                                <textarea
                                                  rows={2}
                                                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-sm"
                                                  value={
                                                    quoteEdits[q._id]?.adminNotes ??
                                                    (q.adminNotes || '')
                                                  }
                                                  onChange={(e) =>
                                                    handleQuoteFieldChange(
                                                      q._id,
                                                      'adminNotes',
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>

                                            <div className="flex flex-wrap justify-end gap-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleUpdateQuoteStatus(
                                                    q._id,
                                                    'reviewed'
                                                  )
                                                }
                                              >
                                                Enregistrer sans envoyer
                                              </Button>
                                              <Button
                                                size="sm" className="bg-blue-700 text-white"
                                                onClick={() =>
                                                  handleUpdateQuoteStatus(
                                                    q._id,
                                                    'sent',
                                                    {
                                                      proposedAmount:
                                                        quoteEdits[q._id]
                                                          ?.proposedAmount ??
                                                        q.proposedAmount,
                                                      validUntil:
                                                        quoteEdits[q._id]
                                                          ?.validUntil ??
                                                        (q.validUntil
                                                          ? new Date(
                                                              q.validUntil
                                                            )
                                                              .toISOString()
                                                              .slice(0, 10)
                                                          : undefined),
                                                      adminNotes:
                                                        quoteEdits[q._id]
                                                          ?.adminNotes ??
                                                        q.adminNotes,
                                                    }
                                                  )
                                                }
                                              >
                                                Envoyer le devis au client
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Vue mobile */}
                      <div className="md:hidden p-4 space-y-4">
                        {sortedQuotes.map((q) => {
                          const isOpen = expandedAdminQuoteId === q._id
                          const email =
                            q.email || q.client?.email || q.userId?.email || '—'
                          const phone =
                            q.phone || q.client?.phone || q.userId?.phone || '—'
                          const siteType = q.siteType || q.projectType || '—'
                          const budgetText =
                            typeof q.budget === 'string'
                              ? q.budget
                              : q.budget
                              ? formatPrice(parseMoneyLike(q.budget))
                              : '—'
                          const amount =
                            parseMoneyLike(q.proposedAmount) ||
                            parseMoneyLike(q.budget) ||
                            0

                          return (
                            <Card
                              key={q._id}
                              className="border border-gray-200 dark:border-gray-800"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Devis {q.quoteNumber || q._id.slice(-6)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {siteType}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatDate(q.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                                      {QUOTE_STATUS_LABELS[q.status] || q.status}
                                    </span>
                                    <select
                                      value={q.status}
                                      onChange={(e) =>
                                        handleUpdateQuoteStatus(q._id, e.target.value)
                                      }
                                      className="text-xs border rounded px-2 py-1 bg-transparent"
                                    >
                                      <option value="pending">En attente</option>
                                      <option value="reviewed">En cours</option>
                                      <option value="sent">Envoyé</option>
                                      <option value="accepted">Confirmé</option>
                                      <option value="completed">Terminé</option>
                                      <option value="cancelled">Annulé</option>
                                      <option value="rejected">Refusé</option>
                                    </select>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="text-xs space-y-1">
                                  <p>
                                    Client :{' '}
                                    <span className="font-medium">
                                      {q.client?.firstName ||
                                        q.userId?.firstName ||
                                        q.name ||
                                        '—'}{' '}
                                      {q.client?.lastName || q.userId?.lastName || ''}
                                    </span>
                                  </p>
                                  <p>Email : {email}</p>
                                  {phone !== '—' && <p>Téléphone : {phone}</p>}
                                  <p>
                                    Montant :{' '}
                                    {amount
                                      ? formatPrice(amount)
                                      : budgetText}
                                  </p>
                                </div>

                                {isOpen && (
                                  <div className="mt-2 border-t border-dashed pt-3 space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                      Préparation de l&apos;offre
                                    </p>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Montant proposé (TTC)
                                        </p>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-xs"
                                          value={
                                            quoteEdits[q._id]?.proposedAmount ??
                                            (q.proposedAmount ?? '')
                                          }
                                          onChange={(e) =>
                                            handleQuoteFieldChange(
                                              q._id,
                                              'proposedAmount',
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Valable jusqu&apos;au
                                        </p>
                                        <input
                                          type="date"
                                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-xs"
                                          value={
                                            quoteEdits[q._id]?.validUntil ??
                                            (q.validUntil
                                              ? new Date(q.validUntil)
                                                  .toISOString()
                                                  .slice(0, 10)
                                              : '')
                                          }
                                          onChange={(e) =>
                                            handleQuoteFieldChange(
                                              q._id,
                                              'validUntil',
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Message au client (optionnel)
                                        </p>
                                        <textarea
                                          rows={2}
                                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-xs"
                                          value={
                                            quoteEdits[q._id]?.adminNotes ??
                                            (q.adminNotes || '')
                                          }
                                          onChange={(e) =>
                                            handleQuoteFieldChange(
                                              q._id,
                                              'adminNotes',
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap justify-end gap-2 pt-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateQuoteStatus(q._id, 'reviewed')
                                        }
                                      >
                                        Enregistrer
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateQuoteStatus(q._id, 'sent', {
                                            proposedAmount:
                                              quoteEdits[q._id]?.proposedAmount ??
                                              q.proposedAmount,
                                            validUntil:
                                              quoteEdits[q._id]?.validUntil ??
                                              (q.validUntil
                                                ? new Date(q.validUntil)
                                                    .toISOString()
                                                    .slice(0, 10)
                                                : undefined),
                                            adminNotes:
                                              quoteEdits[q._id]?.adminNotes ??
                                              q.adminNotes,
                                          })
                                        }
                                      >
                                        Envoyer au client
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setExpandedAdminQuoteId(
                                        isOpen ? null : q._id
                                      )
                                    }
                                  >
                                    {isOpen ? 'Masquer' : 'Détails'}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}


          {/* COMMANDES (admin) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Commandes
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Suivez les commandes et l&apos;état des paiements (acompte / solde / 100 %).
                  </p>
                </div>
              </div>

              {/* Petits KPIs paiements */}
              {Array.isArray(orders) && orders.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                        Total commandes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                        Acompte payé
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {orders.filter((o) => o?.deposit?.paid && !o?.balance?.paid).length}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paiement 40 % uniquement
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                        Payé à 100 %
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {orders.filter(
                          (o) =>
                            (o?.deposit?.paid && o?.balance?.paid) ||
                            (o?.paymentStatus === 'paid')
                        ).length}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Acompte + solde réglés
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                        Montant encaissé
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatPrice(
                          orders.reduce((sum, o) => {
                            const total = parseMoneyLike(o.amount)
                            const depositAmount =
                              o?.deposit?.amount ?? Math.round((total * (o?.deposit?.percentage || 40)) / 100)
                            const balanceAmount =
                              o?.balance?.amount ?? Math.max(total - depositAmount, 0)

                            const depositPaid = !!o?.deposit?.paid
                            const balancePaid = !!o?.balance?.paid

                            if (depositPaid && balancePaid) return sum + total
                            if (depositPaid && !balancePaid) return sum + depositAmount
                            return sum
                          }, 0)
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Somme réellement payée (40 % + 60 %)
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Barre de recherche + tri */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom ou email client..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Trier par</span>
                  <select
                    value={orderSort}
                    onChange={(e) => setOrderSort(e.target.value)}
                    className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="recent">Plus récentes</option>
                    <option value="oldest">Plus anciennes</option>
                    <option value="amount-high">Montant décroissant</option>
                    <option value="amount-low">Montant croissant</option>
                  </select>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Liste des commandes</CardTitle>
                  <CardDescription>
                    Toutes les commandes passées par vos clients avec l&apos;état du paiement.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="p-4 text-sm text-gray-500">Chargement des commandes...</div>
                  ) : !Array.isArray(sortedOrders) || sortedOrders.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">Aucune commande.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/60">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                              Commande
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                              Client
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                              Date
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                              Montant total
                            </th>
                            <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">
                              Statut commande
                            </th>
                            <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">
                              Statut paiement
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                          {sortedOrders.map((order) => {
                            const customerName = order.userId
                              ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() ||
                                order.userId.email
                              : '—'

                            const depositAmount =
                              order?.deposit?.amount ??
                              Math.round(
                                (parseMoneyLike(order.amount) * (order?.deposit?.percentage || 40)) /
                                  100
                              )
                            const balanceAmount =
                              order?.balance?.amount ??
                              Math.max(parseMoneyLike(order.amount) - depositAmount, 0)

                            const paymentStatus = order.paymentStatus || 'unpaid'

                            return (
                              <React.Fragment key={order._id}>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                  <td className="px-4 py-2 align-top">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {order.orderNumber || order._id}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {order.projectDetails?.siteType || 'Projet web'}
                                    </div>
                                  </td>

                                  <td className="px-4 py-2 align-top">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {customerName || '—'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {order.userId?.email || '—'}
                                    </div>
                                  </td>

                                  <td className="px-4 py-2 align-top">
                                    <div className="text-sm text-gray-800 dark:text-gray-200">
                                      {formatDate(order.createdAt)}
                                    </div>
                                  </td>

                                  <td className="px-4 py-2 align-top text-right">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {formatPrice(order.amount)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Acompte {order?.deposit?.percentage || 40}% :{' '}
                                      {formatPrice(depositAmount)}
                                    </div>
                                  </td>

                                  <td className="px-4 py-2 align-top text-center">
                                    <select
                                      value={order.status}
                                      onChange={(e) =>
                                        handleUpdateOrderStatus(order._id, e.target.value)
                                      }
                                      className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-xs bg-white dark:bg-gray-900"
                                    >
                                      {ORDER_STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </td>

                                  <td className="px-4 py-2 align-top text-center">
                                    <span
                                      className={
                                        'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                                        getPaymentStatusBadgeClasses(paymentStatus)
                                      }
                                    >
                                      {PAYMENT_STATUS_LABELS[paymentStatus] || '—'}
                                    </span>
                                  </td>

                                  <td className="px-4 py-2 align-top text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() =>
                                        setExpandedAdminOrderId((prev) =>
                                          prev === order._id ? null : order._id
                                        )
                                      }
                                    >
                                      {expandedAdminOrderId === order._id ? (
                                        <>
                                          Masquer <ChevronUp className="ml-1 h-3 w-3" />
                                        </>
                                      ) : (
                                        <>
                                          Détails <ChevronDown className="ml-1 h-3 w-3" />
                                        </>
                                      )}
                                    </Button>
                                  </td>
                                </tr>

                                {expandedAdminOrderId === order._id && (
                                  <tr className="bg-gray-50/60 dark:bg-gray-900/40">
                                    <td colSpan={7} className="px-4 py-4">
                                      <div className="grid gap-4 md:grid-cols-3">
                                        {/* Bloc paiement */}
                                        <div className="space-y-2">
                                          <h4 className="text-sm font-semibold">
                                            Détail paiement
                                          </h4>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">
                                              Acompte ({order?.deposit?.percentage || 40}%){' '}
                                              :
                                            </span>{' '}
                                            {formatPrice(depositAmount)}{' '}
                                            {order?.deposit?.paid ? (
                                              <span className="text-emerald-600 dark:text-emerald-400">
                                                — payé le{' '}
                                                {order?.deposit?.paidAt
                                                  ? formatDate(order.deposit.paidAt)
                                                  : ''}
                                              </span>
                                            ) : (
                                              <span className="text-red-600 dark:text-red-400">
                                                — non payé
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Solde (60 %) :</span>{' '}
                                            {formatPrice(balanceAmount)}{' '}
                                            {order?.balance?.paid ? (
                                              <span className="text-emerald-600 dark:text-emerald-400">
                                                — payé le{' '}
                                                {order?.balance?.paidAt
                                                  ? formatDate(order.balance.paidAt)
                                                  : ''}
                                              </span>
                                            ) : (
                                              <span className="text-amber-600 dark:text-amber-400">
                                                — restant à payer
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Statut global :</span>{' '}
                                            {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
                                          </p>
                                        </div>

                                        {/* Bloc projet */}
                                        <div className="space-y-2">
                                          <h4 className="text-sm font-semibold">
                                            Informations projet
                                          </h4>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Type :</span>{' '}
                                            {order.projectDetails?.siteType || '—'}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Budget client :</span>{' '}
                                            {order.projectDetails?.budget || '—'}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Deadline :</span>{' '}
                                            {order.projectDetails?.deadline || '—'}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Détails :</span>{' '}
                                            {order.projectDetails?.description || '—'}
                                          </p>
                                        </div>

                                        {/* Bloc facturation */}
                                        <div className="space-y-2">
                                          <h4 className="text-sm font-semibold">Facturation</h4>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Nom :</span>{' '}
                                            {order.billingInfo
                                              ? `${order.billingInfo.firstName || ''} ${
                                                  order.billingInfo.lastName || ''
                                                }`.trim() || '—'
                                              : '—'}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Email :</span>{' '}
                                            {order.billingInfo?.email || '—'}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Adresse :</span>{' '}
                                            {order.billingInfo?.address
                                              ? `${order.billingInfo.address.street || ''}, ${
                                                  order.billingInfo.address.postalCode || ''
                                                } ${order.billingInfo.address.city || ''}, ${
                                                  order.billingInfo.address.country || ''
                                                }`
                                              : '—'}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}


          {/* FACTURES (admin) */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Factures
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Toutes les factures de la plateforme
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                    <Input
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      placeholder="Rechercher (nom / email)"
                      className="pl-8"
                    />
                  </div>
                  <select
                    value={invoiceSort}
                    onChange={(e) => setInvoiceSort(e.target.value)}
                    className="text-sm bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="recent">Plus récent</option>
                    <option value="oldest">Plus ancien</option>
                    <option value="amount-low">Montant plus bas</option>
                    <option value="amount-high">Montant plus haut</option>
                  </select>
                  <Button variant="outline" onClick={fetchInvoices}>
                    Recharger
                  </Button>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {invoicesLoading ? (
                    <div className="p-6 text-sm text-gray-500">Chargement...</div>
                  ) : sortedInvoices.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">Aucune facture.</div>
                  ) : (
                    <>
                      {/* Table desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-900/30">
                            <tr>
                              <th className="px-4 py-3 text-left">Facture</th>
                              <th className="px-4 py-3 text-left">Client</th>
                              <th className="px-4 py-3 text-left">Montant</th>
                              <th className="px-4 py-3 text-left">Statut</th>
                              <th className="px-4 py-3 text-left">Date</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedInvoices.map((inv) => {
                              const isOpen = expandedAdminInvoiceId === inv._id
                              const total = getInvoiceTotal(inv)
                              const clientName = inv.userId
                                ? `${inv.userId.firstName || ''} ${
                                    inv.userId.lastName || ''
                                  }`.trim()
                                : inv.clientInfo?.name || '—'
                              const clientEmail =
                                inv.userId?.email || inv.clientInfo?.email || '—'
                              const invDue = getInvoiceDueDate(inv)
                              return (
                                <React.Fragment key={inv._id}>
                                  <tr className="border-t dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-900/50">
                                    <td className="px-4 py-3">
                                      <p className="font-medium">
                                        {inv.invoiceNumber || inv._id.slice(-6)}
                                      </p>
                                      {inv.orderId?.orderNumber && (
                                        <p className="text-xs text-gray-400">
                                          CMD-{inv.orderId.orderNumber}
                                        </p>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="text-sm font-medium">{clientName}</p>
                                      <p className="text-xs text-gray-400">{clientEmail}</p>
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(total)}</td>
                                    <td className="px-4 py-3">{inv.status || '—'}</td>
                                    <td className="px-4 py-3">{formatDate(inv.createdAt)}</td>
                                    
                                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setExpandedAdminInvoiceId(
                                            isOpen ? null : inv._id
                                          )
                                        }
                                      >
                                        {isOpen ? 'Fermer' : 'Détails'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownloadInvoice(inv._id, inv.invoiceNumber)
                                        }
                                        className="flex items-center gap-2"
                                      >
                                        <Download className="h-4 w-4" />
                                        PDF
                                      </Button>
                                    </td>
                                  </tr>

                                  {isOpen && (
                                    <tr className="bg-gray-50 dark:bg-gray-900/30">
                                      <td colSpan={7} className="px-4 pb-4">
                                        <div className="mt-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm">
                                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                              <p className="text-xs text-gray-500">Client</p>
                                              <p className="font-medium">{clientName}</p>
                                              <p className="text-xs text-gray-400">
                                                {clientEmail}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">Montant</p>
                                              <p className="font-medium">
                                                {formatPrice(total)}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">Statut</p>
                                              <p className="font-medium">
                                                {inv.status || '—'}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500">Créée le</p>
                                              <p className="font-medium">
                                                {formatDate(inv.createdAt)}
                                              </p>
                                            </div>
                                          </div>

                                          {/* détails facture */}
                                          {(() => {
                                            const invoiceItems =
                                              Array.isArray(inv.items) &&
                                              inv.items.length > 0
                                                ? inv.items
                                                : inv.orderId
                                                ? [
                                                    {
                                                      name:
                                                        inv.orderId.offerId?.name ||
                                                        inv.orderId.metadata?.offerName ||
                                                        'Commande',
                                                      quantity: 1,
                                                      total: parseMoneyLike(
                                                        inv.orderId.amount
                                                      ),
                                                    },
                                                  ]
                                                : []

                                            return invoiceItems.length > 0 ? (
                                              <div className="mt-4">
                                                <p className="text-xs text-gray-500 mb-1">
                                                  Détails
                                                </p>
                                                <div className="overflow-x-auto">
                                                  <table className="min-w-full text-xs">
                                                    <thead>
                                                      <tr className="text-left">
                                                        <th className="px-2 py-2">Article</th>
                                                        <th className="px-2 py-2">Qté</th>
                                                        <th className="px-2 py-2">Total</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {invoiceItems.map((it, idx) => {
                                                        const lineTotal =
                                                          parseMoneyLike(it.total) ||
                                                          parseMoneyLike(it.price) *
                                                            (it.quantity || 1) ||
                                                          0
                                                        return (
                                                          <tr
                                                            key={idx}
                                                            className="border-t dark:border-gray-800"
                                                          >
                                                            <td className="px-2 py-2">
                                                              {it.name ||
                                                                it.title ||
                                                                it.description ||
                                                                '—'}
                                                            </td>
                                                            <td className="px-2 py-2">
                                                              {it.quantity ?? 1}
                                                            </td>
                                                            <td className="px-2 py-2">
                                                              {formatPrice(lineTotal)}
                                                            </td>
                                                          </tr>
                                                        )
                                                      })}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            ) : null
                                          })()}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden p-4 space-y-4">
                        {sortedInvoices.map((inv) => {
                          const isOpen = expandedAdminInvoiceId === inv._id
                          const total = getInvoiceTotal(inv)
                          const clientName = inv.userId
                            ? `${inv.userId.firstName || ''} ${
                                inv.userId.lastName || ''
                              }`.trim()
                            : inv.clientInfo?.name || '—'
                          const clientEmail =
                            inv.userId?.email || inv.clientInfo?.email || '—'
                          const invDue = getInvoiceDueDate(inv)
                          return (
                            <div
                              key={inv._id}
                              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">
                                    Facture {inv.invoiceNumber || inv._id.slice(-6)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(inv.createdAt)}
                                  </p>
                                  {inv.orderId?.orderNumber && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      CMD-{inv.orderId.orderNumber}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {formatPrice(total)}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {inv.status || '—'}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 text-xs text-gray-400">
                                <p>{clientName}</p>
                                <p>{clientEmail}</p>
                                <p>Échéance : {formatDueDate(invDue)}</p>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedAdminInvoiceId(
                                      isOpen ? null : inv._id
                                    )
                                  }
                                >
                                  {isOpen ? 'Masquer détails' : 'Détails'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadInvoice(inv._id, inv.invoiceNumber)
                                  }
                                  className="flex items-center justify-center gap-2"
                                >
                                  <Download className="h-4 w-4" /> PDF
                                </Button>
                              </div>

                              {isOpen && (
                                <div className="mt-3 rounded-md bg-gray-50 dark:bg-gray-900/40 p-3 text-sm space-y-2">
                                  <div className="grid gap-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Montant</p>
                                      <p className="font-medium">
                                        {formatPrice(total)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Statut</p>
                                      <p className="font-medium">
                                        {inv.status || '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Échéance</p>
                                      <p className="font-medium">
                                        {formatDueDate(invDue)}
                                      </p>
                                    </div>
                                  </div>

                                  {(() => {
                                    const invoiceItems =
                                      Array.isArray(inv.items) &&
                                      inv.items.length > 0
                                        ? inv.items
                                        : inv.orderId
                                        ? [
                                            {
                                              name:
                                                inv.orderId.offerId?.name ||
                                                inv.orderId.metadata?.offerName ||
                                                'Commande',
                                              quantity: 1,
                                              total: parseMoneyLike(
                                                inv.orderId.amount
                                              ),
                                            },
                                          ]
                                        : []

                                    return invoiceItems.length > 0 ? (
                                      <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">
                                          Détails
                                        </p>
                                        <div className="overflow-x-auto">
                                          <table className="min-w-full text-xs">
                                            <thead>
                                              <tr className="text-left">
                                                <th className="px-2 py-2">Article</th>
                                                <th className="px-2 py-2">Qté</th>
                                                <th className="px-2 py-2">Total</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {invoiceItems.map((it, idx) => {
                                                const lineTotal =
                                                  parseMoneyLike(it.total) ||
                                                  parseMoneyLike(it.price) *
                                                    (it.quantity || 1) ||
                                                  0
                                                return (
                                                  <tr
                                                    key={idx}
                                                    className="border-t dark:border-gray-800"
                                                  >
                                                    <td className="px-2 py-2">
                                                      {it.name ||
                                                        it.title ||
                                                        it.description ||
                                                        '—'}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                      {it.quantity ?? 1}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                      {formatPrice(lineTotal)}
                                                    </td>
                                                  </tr>
                                                )
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    ) : null
                                  })()}
                                </div>
                              )}
                            </div>
                          )
                        })}
                       
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {/* SUPPORT */}
                    {/* SUPPORT */}
                    {/* SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <LifeBuoy className="h-6 w-6 text-[#3ae5ae]" />
                        Gestion des Tickets Support
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Gérez tous les tickets de support des clients
                      </CardDescription>
                    </div>

                    {/* Filtres + boutons */}
                    <div className="flex flex-col gap-2 items-stretch md:flex-row md:items-center md:gap-3">
                      {/* Recherche + statut */}
                      <div className="flex flex-1 gap-2">
                        <div className="relative w-full md:max-w-xs">
                          <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                          <Input
                            value={ticketSearch}
                            onChange={(e) => setTicketSearch(e.target.value)}
                            placeholder="Recherche (sujet / client / email)"
                            className="pl-8"
                          />
                        </div>

                        <select
                          value={ticketStatusFilter}
                          onChange={(e) => setTicketStatusFilter(e.target.value)}
                          className="text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2"
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="open">Ouvert</option>
                          <option value="answered">Répondu</option>
                          <option value="pending">En attente</option>
                          <option value="resolved">Résolu</option>
                          <option value="refunded">Remboursé</option>
                          <option value="closed">Terminé</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant={showTrash ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => setShowTrash((prev) => !prev)}
                        >
                          {showTrash ? 'Voir les tickets actifs' : 'Afficher la corbeille'}
                        </Button>

                        <Button
                          onClick={loadTickets}
                          variant="outline"
                          size="sm"
                          disabled={ticketsLoading}
                        >
                          {ticketsLoading ? 'Chargement...' : 'Actualiser'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {ticketsLoading ? (
                    <div className="text-center py-12">
                      <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-[#3ae5ae] border-t-transparent" />
                      <p className="mt-4 text-gray-600">Chargement des tickets...</p>
                    </div>
                  ) : currentTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">
                        {showTrash
                          ? 'Aucun ticket dans la corbeille'
                          : 'Aucun ticket pour le moment'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentTickets.map((ticket) => {
                        const isClosed = ['resolved', 'refunded', 'closed'].includes(
                          ticket.status
                        )
                        const isInTrash = !!ticket.isDeleted

                        return (
                          <div
                            key={ticket._id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                          >
                            {/* HEADER DU TICKET */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/40">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3 mb-2">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                      {ticket.subject}
                                    </h3>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                        ticket.status
                                      )}`}
                                    >
                                      {getStatusLabel(ticket.status)}
                                    </span>
                                    {isInTrash && (
                                      <span className="ml-2 px-2 py-1 text-[10px] rounded-full bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                                        Corbeille
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <p className="flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      <span className="font-medium">Client:</span>
                                      {ticket.user?.firstName} {ticket.user?.lastName}
                                      <span className="text-xs">
                                        ({ticket.user?.email})
                                      </span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="font-medium">Catégorie:</span>{' '}
                                      {ticket.category}
                                      <span className="mx-2">•</span>
                                      <span className="font-medium">Priorité:</span>{' '}
                                      {ticket.priority}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Créé le {formatDate(ticket.createdAt)}
                                      {ticket.updatedAt !== ticket.createdAt &&
                                        ` • Mis à jour le ${formatDate(ticket.updatedAt)}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[220px]">
                                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Changer le statut :
                                  </label>
                                  <select
                                    value={ticket.status}
                                    onChange={(e) =>
                                      handleChangeStatus(ticket._id, e.target.value)
                                    }
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#3ae5ae] focus:border-transparent"
                                  >
                                    <option value="open">Ouvert</option>
                                    <option value="answered">Répondu</option>
                                    <option value="pending">En attente</option>
                                    <option value="resolved">Résolu</option>
                                    <option value="refunded">Remboursé</option>
                                    <option value="closed">Terminé</option>
                                  </select>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      isInTrash
                                        ? handleRestoreTicketFromTrash(ticket._id)
                                        : handleMoveTicketToTrash(ticket._id)
                                    }
                                    className="mt-1"
                                  >
                                    {isInTrash
                                      ? 'Restaurer le ticket'
                                      : 'Mettre à la corbeille'}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* MESSAGES */}
                            <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-white dark:bg-gray-800">
                              {ticket.messages?.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">
                                  Aucun message
                                </p>
                              ) : (
                                ticket.messages.map((msg, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-lg ${
                                      msg.senderRole === 'staff'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                        : 'bg-gray-50 dark:bg-gray-700/50 border-l-4 border-gray-300 dark:border-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {msg.senderRole === 'staff' ? (
                                          <>
                                            <Shield className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                              Support (Vous)
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <Users className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                              Client
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(msg.createdAt)}
                                      </span>
                                    </div>

                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                      {msg.message}
                                    </p>

                                    {/* AFFICHAGE DES PIÈCES JOINTES */}
                                    {/* AFFICHAGE DES PIÈCES JOINTES */}
{msg.attachments && msg.attachments.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-3">
    {msg.attachments.map((att, attIndex) => {
      const rawUrl =
        att.url ||
        att.attachmentUrl ||
        att.path || // vient du backend: /uploads/support/xxx
        (att.filename ? `/uploads/support/${att.filename}` : '')

      const url = buildFileUrl(rawUrl)
      const name =
        att.originalName ||
        att.filename ||
        `Fichier ${attIndex + 1}`

      if (!url) return null

      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url)

      return (
        <div
          key={att._id || attIndex}
          className="flex flex-col gap-1 max-w-[160px]"
        >
          {isImage ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={url}
                alt={name}
                className="h-24 w-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
              />
            </a>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FileText className="h-3 w-3" />
              <span className="truncate">{name}</span>
            </a>
          )}
          <span className="text-[10px] text-gray-500 truncate">
            {name}
          </span>
        </div>
      )
    })}
  </div>
)}

                                  </div>
                                ))
                              )}
                            </div>

                            {/* ZONE DE RÉPONSE / MESSAGE FERMÉ */}
                            {!isClosed ? (
                              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Send className="h-4 w-4" />
                                    Répondre au client
                                  </div>
                                  <Textarea
                                    value={replyMessages[ticket._id] || ''}
                                    onChange={(e) =>
                                      setReplyMessages((prev) => ({
                                        ...prev,
                                        [ticket._id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Tapez votre réponse ici..."
                                    className="min-h-[100px] resize-none"
                                    rows={3}
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() => handleSendAdminReply(ticket._id)}
                                      disabled={!replyMessages[ticket._id]?.trim()}
                                      className="bg-[#3ae5ae] hover:bg-[#32d09d] text-white"
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Envoyer la réponse
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="font-medium">
                                    Ce ticket est{' '}
                                    {getStatusLabel(ticket.status).toLowerCase()}. Aucune
                                    réponse supplémentaire n&apos;est possible.
                                  </span>
                                </div>
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
          )}


        </div>
      </main>
    </div>
  )
}

export default Admin;