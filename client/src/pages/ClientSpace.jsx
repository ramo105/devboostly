// ClientSpace.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  ShoppingBag, FileText, FolderOpen, User, Download, Eye, LogOut, Home,
  LayoutDashboard, Menu, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { orderService } from '@/services/orderService'
import { invoiceService } from '@/services/invoiceService'
import { quoteService } from '@/services/quoteService'
import { projectService } from '@/services/projectService'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS, PROJECT_STATUS, QUOTE_STATUS } from '@/lib/constants'

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
  const [projects, setProjects] = useState([])
  const [expandedQuoteId, setExpandedQuoteId] = useState(null)

  useEffect(() => {
    if (user && isAdmin) { navigate('/admin'); return }
    loadData()
  }, [user, isAdmin, navigate])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const allowed = ['dashboard', 'orders', 'invoices', 'quotes', 'projects', 'profile']
    if (tab && allowed.includes(tab)) setActiveTab(tab)
  }, [location.search])

  const loadData = async () => {
    try {
      const [ordersData, invoicesData, quotesData, projectsData] = await Promise.all([
        orderService.getMyOrders().catch(() => []),
        invoiceService.getMyInvoices().catch(() => []),
        quoteService.getMyQuotes().catch(() => []),
        projectService.getMyProjects().catch(() => []),
      ])
      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.data || []))
      setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData?.data || []))
      setQuotes(Array.isArray(quotesData) ? quotesData : (quotesData?.data || []))
      setProjects(Array.isArray(projectsData) ? projectsData : (projectsData?.data || []))
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setOrders([]); setInvoices([]); setQuotes([]); setProjects([])
    } finally { setLoading(false) }
  }

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  const getStatusColor = (status, type) => {
    const colors = {
      order: { pending: 'warning', paid: 'success', processing: 'default', completed: 'success', cancelled: 'destructive' },
      project: { waiting: 'warning', in_progress: 'default', review: 'secondary', completed: 'success', on_hold: 'warning' },
      quote: { pending: 'warning', reviewed: 'default', sent: 'secondary', accepted: 'success', rejected: 'destructive' },
    }
    return colors[type]?.[status] || 'default'
  }

  const handleLogout = () => { logout(); navigate('/') }

  const menuItems = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'orders', label: 'Mes Commandes', icon: ShoppingBag },
    { id: 'invoices', label: 'Mes Factures', icon: FileText },
    { id: 'quotes', label: 'Mes Devis', icon: FileText },
    { id: 'projects', label: 'Mes Projets', icon: FolderOpen },
    { id: 'profile', label: 'Mon Profil', icon: User },
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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Espace Client</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
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
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer
                      ${isActive ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                    `}
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
            <Button variant="outline" className="w-full justify-start hover:bg-primary/10 cursor-pointer" onClick={() => navigate('/')}>
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
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenue, {user?.firstName} 👋</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Voici un aperçu de votre activité</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes</CardTitle>
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {orders.length > 0 ? 'Total effectuées' : 'Aucune commande'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Factures</CardTitle>
                    <FileText className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{invoices.length}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {invoices.length > 0 ? 'Documents disponibles' : 'Aucune facture'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Devis</CardTitle>
                    <FileText className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{quotes.length}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {quotes.length > 0 ? 'Demandes envoyées' : 'Aucun devis'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Projets</CardTitle>
                    <FolderOpen className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {projects.length > 0 ? 'En cours/Terminés' : 'Aucun projet'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Commandes récentes</CardTitle>
                    <CardDescription>Vos dernières commandes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">Aucune commande pour le moment</div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div>
                              <p className="font-medium">Commande #{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <Badge variant={getStatusColor(order.status, 'order')}>{ORDER_STATUS[order.status]}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Projets en cours</CardTitle>
                    <CardDescription>État de vos projets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">Aucun projet en cours</div>
                    ) : (
                      <div className="space-y-3">
                        {projects.slice(0, 3).map((project) => (
                          <div key={project._id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{project.name}</p>
                              <Badge variant={getStatusColor(project.status, 'project')}>{PROJECT_STATUS[project.status]}</Badge>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{project.progress}% complété</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Mes Commandes */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Commandes</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez et suivez vos commandes</p>
              </div>

              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
                    <Button onClick={() => navigate('/offres')}>Découvrir nos offres</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order._id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>Commande #{order.orderNumber}</CardTitle>
                            <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                          </div>
                          <Badge variant={getStatusColor(order.status, 'order')}>{ORDER_STATUS[order.status]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
                          <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Détails</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mes Factures */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Factures</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Téléchargez et gérez vos factures</p>
              </div>

              {invoices.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
                    <p className="text-gray-500">Vos factures apparaîtront ici</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>Facture {invoice.invoiceNumber}</CardTitle>
                            <CardDescription>{formatDate(invoice.createdAt)}</CardDescription>
                          </div>
                          <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                            {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">{formatPrice(invoice.total)}</p>
                          <Button variant="outline" size="sm" className="cursor-pointer">
                            <Download className="mr-2 h-4 w-4" /> Télécharger PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mes Devis */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Devis</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez vos demandes de devis</p>
              </div>

              {quotes.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun devis lié à ce compte</h3>
                    <p className="text-gray-500 mb-6">
                      Si vous avez envoyé un devis avec un autre email, il ne s’affichera pas ici.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/devis')}>Demander un devis</Button>
                      <Button variant="outline" onClick={() => navigate('/espace-client?tab=dashboard')}>
                        Retour au tableau de bord
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => {
                    const isOpen = expandedQuoteId === quote._id
                    return (
                      <Card key={quote._id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {quote.name}
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">• Devis {quote.quoteNumber}</span>
                              </CardTitle>
                              <CardDescription>{formatDate(quote.createdAt)}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(quote.status, 'quote')}>{QUOTE_STATUS[quote.status]}</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedQuoteId(isOpen ? null : quote._id)}
                                className="cursor-pointer"
                              >
                                {isOpen ? (<><ChevronUp className="mr-2 h-4 w-4" /> Masquer</>) : (<><ChevronDown className="mr-2 h-4 w-4" /> Plus de détails</>)}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid gap-2 sm:grid-cols-3 text-sm">
                            <p><span className="font-medium">Type:</span> {quote.siteType}</p>
                            <p><span className="font-medium">Budget:</span> {quote.budget}</p>
                            {quote.proposedAmount && (
                              <p><span className="font-medium">Montant proposé:</span> {formatPrice(quote.proposedAmount)}</p>
                            )}
                          </div>

                          {isOpen && (
                            <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2 text-sm">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <p><span className="font-medium">Email:</span> {quote.email}</p>
                                <p><span className="font-medium">Téléphone:</span> {quote.phone || '—'}</p>
                                <p><span className="font-medium">Délai souhaité:</span> {quote.deadline}</p>
                                <p><span className="font-medium">Référence:</span> {quote.quoteNumber}</p>
                                <p><span className="font-medium">Créé le:</span> {formatDate(quote.createdAt)}</p>
                                {quote.validUntil && (<p><span className="font-medium">Valable jusqu'au:</span> {formatDate(quote.validUntil)}</p>)}
                              </div>
                              <div>
                                <p className="font-medium mb-1">Description du projet</p>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{quote.description}</p>
                              </div>
                              <div className="pt-2"><Badge variant="secondary">Demande envoyée</Badge></div>
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

          {/* Mes Projets */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Projets</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez l'avancement de vos projets</p>
              </div>

              {projects.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
                    <p className="text-gray-500">Vos projets apparaîtront ici</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Card key={project._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription>Projet {project.projectNumber}</CardDescription>
                          </div>
                          <Badge variant={getStatusColor(project.status, 'project')}>{PROJECT_STATUS[project.status]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium">Progression</span>
                            <span className="text-gray-500">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                        )}
                        {project.files?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Fichiers ({project.files.length})</p>
                            <div className="space-y-2">
                              {project.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                  <span className="text-sm">{file.name}</span>
                                  <Button size="sm" variant="ghost" className="cursor-pointer"><Eye className="h-4 w-4" /></Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mon Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez vos informations personnelles</p>
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
                      <h3 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Prénom</label>
                      <p className="text-base font-medium">{user?.firstName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Nom</label>
                      <p className="text-base font-medium">{user?.lastName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base font-medium">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Téléphone</label>
                      <p className="text-base font-medium">{user?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ClientSpace
