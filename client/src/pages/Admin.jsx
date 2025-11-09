import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  ShoppingBag, 
  FileText, 
  FolderOpen, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  LogOut,
  Shield,
  Home,
  LayoutDashboard,
  Menu,
  X,
  BarChart3
} from 'lucide-react'

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
    pendingInvoices: 0
  })

  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/espace-client')
      return
    }
    loadStats()
  }, [user, isAdmin, navigate])

  const loadStats = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingQuotes: 0,
        activeProjects: 0,
        pendingInvoices: 0
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'quotes', label: 'Devis', icon: FileText },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'invoices', label: 'Factures', icon: AlertCircle },
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
          {/* Header Sidebar */}
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
            
            {/* User Info */}
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
                  Administrateur
                </p>
              </div>
            </div>
          </div>

          {/* Menu Navigation */}
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
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                      transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-primary/10 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 hover:border-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Admin</h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard Administrateur 🚀
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Vue d'ensemble de votre plateforme
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Utilisateurs
                    </CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-gray-500 mt-1">Total inscrits</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Commandes
                    </CardTitle>
                    <ShoppingBag className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalOrders}</div>
                    <p className="text-xs text-gray-500 mt-1">Total commandes</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Revenu
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                    <p className="text-xs text-gray-500 mt-1">Total généré</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Devis
                    </CardTitle>
                    <FileText className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.pendingQuotes}</div>
                    <p className="text-xs text-gray-500 mt-1">En attente</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Projets
                    </CardTitle>
                    <FolderOpen className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.activeProjects}</div>
                    <p className="text-xs text-gray-500 mt-1">En cours</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-red-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Factures
                    </CardTitle>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.pendingInvoices}</div>
                    <p className="text-xs text-gray-500 mt-1">Impayées</p>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>
                    Aperçu de l'activité sur la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <TrendingUp className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Bienvenue dans votre espace d'administration
                    </h3>
                    <p className="text-gray-500 mb-1">
                      Gérez votre plateforme depuis ce tableau de bord
                    </p>
                    <p className="text-sm text-gray-400">
                      Les statistiques détaillées seront bientôt disponibles
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Utilisateurs */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Utilisateurs
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gérez tous les utilisateurs inscrits
                  </p>
                </div>
                <Button className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </div>

              <Card>
                <CardContent className="py-16 text-center">
                  <div className="rounded-full bg-blue-500/10 p-4 w-fit mx-auto mb-4">
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun utilisateur</h3>
                  <p className="text-gray-500">
                    Les utilisateurs apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Commandes */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Commandes
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gérez toutes les commandes
                  </p>
                </div>
                <Button variant="outline" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>

              <Card>
                <CardContent className="py-16 text-center">
                  <div className="rounded-full bg-green-500/10 p-4 w-fit mx-auto mb-4">
                    <ShoppingBag className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                  <p className="text-gray-500">
                    Les commandes apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Devis */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Devis
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gérez les demandes de devis
                  </p>
                </div>
                <Button variant="outline" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>

              <Card>
                <CardContent className="py-16 text-center">
                  <div className="rounded-full bg-orange-500/10 p-4 w-fit mx-auto mb-4">
                    <FileText className="h-12 w-12 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun devis</h3>
                  <p className="text-gray-500">
                    Les devis apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Projets */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Projets
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gérez tous les projets
                  </p>
                </div>
                <Button className="cursor-pointer">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Nouveau projet
                </Button>
              </div>

              <Card>
                <CardContent className="py-16 text-center">
                  <div className="rounded-full bg-purple-500/10 p-4 w-fit mx-auto mb-4">
                    <FolderOpen className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
                  <p className="text-gray-500">
                    Les projets apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Factures */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Factures
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gérez toutes les factures
                  </p>
                </div>
                <Button variant="outline" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>

              <Card>
                <CardContent className="py-16 text-center">
                  <div className="rounded-full bg-red-500/10 p-4 w-fit mx-auto mb-4">
                    <FileText className="h-12 w-12 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
                  <p className="text-gray-500">
                    Les factures apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Admin