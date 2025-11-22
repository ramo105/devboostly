import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  ShoppingCart, 
  Layers,
  Shield,
  Zap,
  HeadphonesIcon,
  Server,
  Lock,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom' 
import { offerService } from '@/services/offerService' 
import { orderService } from '@/services/orderService'
import { toast } from 'react-hot-toast'
function Offers() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [offers, setOffers] = useState([]) 
  const [packs, setPacks] = useState([]) 
  const [error, setError] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  // REMPLACER la fonction handleOrder (ligne ~34)
const handleOrder = async (offer, itemType) => {
  if (authLoading) return
  
  if (!isAuthenticated) {
     setShowLoginModal(true)
    return
  }

  try {
    // Créer un objet temporaire avec _id (simuler une vraie offre de l'API)
    const itemForBackend = {
      _id: `temp_${offer.id}`, // ID temporaire
      name: offer.name,
      price: offer.price,
      description: offer.description,
      features: offer.features
    }

    // Navigation vers checkout avec données sérialisables
    navigate('/checkout', { 
  state: { 
    itemId: `temp_${offer.id}`,
    itemType: itemType,
    itemName: offer.name,
    itemPrice: offer.price,
    itemDescription: offer.description || ''
  } 
})

    
  } catch (err) {
    console.error('Erreur:', err)
    toast.error('Erreur lors de la navigation')
  }
}
  // 3. Fonction de chargement des données (à intégrer dans votre useEffect)
  const fetchOffersAndPacks = async () => {
    try {
      const offerResponse = await offerService.getAllOffers()
      setOffers(offerResponse.data) // Assurez-vous que l'API renvoie bien { data: [...] }

      const packResponse = await offerService.getMaintenancePacks()
      setPacks(packResponse.data) // Assurez-vous que l'API renvoie bien { data: [...] }
      
    } catch (err) {
      console.error(err)
      setError("Erreur lors du chargement des offres et packs.")
    } finally {
      setLoading(false)
    }
  }
  // ✨ Hook pour les animations au scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(
      '.animate-card, .fade-in-up, .hero-content'
    )

    animatedElements.forEach((el) => observer.observe(el))
    fetchOffersAndPacks()
    return () => {
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  const siteOffers = [
    {
      id: 1,
      name: 'Site Vitrine',
      icon: Globe,
      price: 599,
      popular: false,
      description: 'Parfait pour présenter votre activité',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      features: [
        'Site vitrine professionnel (3 à 5 pages)',
        'Design moderne et personnalisé',
        'Formulaire de contact',
        'Adapté à tous les écrans (responsive)',
        'Référencement naturel de base (SEO)',
        'Intégration Google Maps et réseaux sociaux'
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 2,
      name: 'Site E-commerce',
      icon: ShoppingCart,
      price: 899,
      popular: true,
      description: 'Vendez en ligne dès maintenant',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      features: [
        'Site e-commerce complet (jusqu\'à 50 produits)',
        'Panier et paiement sécurisé',
        'Gestion des produits, commandes et stocks',
        'Référencement naturel de base (SEO)',
        'Support technique 1 mois inclus',
        'Tableau de bord admin intuitif'
      ],
      color: 'from-[#3ae5ae] to-emerald-500'
    },
    {
      id: 3,
      name: 'Site Sur Mesure',
      icon: Layers,
      price: 1790,
      popular: false,
      description: 'Solution unique pour vos besoins spécifiques',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      features: [
        'Site totalement personnalisé selon vos besoins',
        'Fonctionnalités avancées (espace client, réservation, etc.)',
        'Optimisation vitesse et sécurité maximale',
        'Maintenance 3 mois incluse',
        'Accompagnement technique dédié',
        'Formation complète à l\'utilisation'
      ],
      color: 'from-orange-500 to-red-600'
    }
  ]

  const maintenancePacks = [
    {
      id: 1,
      name: 'Pack Basique',
      icon: Server,
      price: 99,// dans celui là
      popular: false,
      description: 'L\'essentiel pour votre site',
      features: [
        'Hébergement web performant',
        'Sauvegardes automatiques hebdomadaires',
        'Petites mises à jour de contenu',
        'Certificat SSL inclus',
        'Support par email'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    // c est ici pour changer le prix pour sa valeur
    {
      id: 2,
      name: 'Pack Standard',
      icon: Shield,
      price: 149,
      popular: true,
      description: 'Sécurité et tranquillité',
      features: [
        'Tout du Pack Basique',
        'Mises à jour régulières du site',
        'Sécurité renforcée et monitoring',
        'Assistance mail prioritaire',
        'Sauvegardes quotidiennes',
        'Rapport mensuel de performance'
      ],
      color: 'from-[#3ae5ae] to-emerald-500'
    },
    {
      id: 3,
      name: 'Pack Premium',
      icon: Zap,
      price: 349,
      popular: false,
      description: 'Service VIP complet',
      features: [
        'Tout du Pack Standard',
        'Maintenance complète et proactive',
        'Support prioritaire 24/7',
        'Optimisation continue des performances',
        'Mises à jour de sécurité en temps réel',
        'Consultant dédié',
        'Modifications illimitées'
      ],
      color: 'from-yellow-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background (no video dependency) */}
        <div className="absolute inset-0 z-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1128] via-[#3ae5ae] to-[#1a1f3a]"></div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3ae5ae]/40 via-transparent to-blue-600/40 animate-gradient-shift"></div>
          </div>
          
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(125, 42, 232, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 40% 20%, rgba(125, 42, 232, 0.2) 0%, transparent 50%)`,
              animation: 'mesh-move 20s ease-in-out infinite'
            }}></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#3ae5ae]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Content */}
        <div className="container relative z-20 text-center">
          <div className="mx-auto max-w-4xl hero-content">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white border border-white/20">
              <Sparkles className="h-4 w-4" />
              Offres & Tarifs Transparents
            </div>

            <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Des solutions adaptées à{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                chaque projet
              </span>
            </h1>
            
            <p className="mb-10 text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Choisissez l'offre qui correspond à vos besoins et lancez votre projet digital dès aujourd'hui
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/devis">
                <Button size="lg" className="bg-white text-[#3ae5ae] hover:bg-white/90 shadow-2xl px-8 py-6 text-lg">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-[#3ae5ae] hover:bg-transparent border-2 border-white px-8 py-6 text-lg backdrop-blur-sm">
                  <HeadphonesIcon className="mr-2 h-5 w-5" />
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Site Offers Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-muted/10 justify-center flex">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="text-center mb-16 fade-in-up">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-[#3ae5ae] to-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-[#3ae5ae] uppercase tracking-wide">
                  Création de Sites Web
                </span>
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-[#3ae5ae] rounded-full"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A1128] dark:text-white mb-4">
                Nos Offres{' '}
                <span className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 bg-clip-text text-transparent">
                  Sites Web
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Des solutions complètes et performantes pour développer votre présence en ligne
              </p>
            </div>

            {/* Offers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {siteOffers.map((offer, index) => {
                const Icon = offer.icon
                return (
                  <Card 
                    key={offer.id} 
                    className={`animate-card relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-500 group ${
                      offer.popular 
                        ? 'border-[#3ae5ae] shadow-lg scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#3ae5ae]'
                    }`}
                  >
                    {/* Popular Badge */}
                    {offer.popular && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 text-white border-0 shadow-lg">
                          ⭐ Plus Populaire
                        </Badge>
                      </div>
                    )}

                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={offer.image} 
                        alt={offer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${offer.color} opacity-60`}></div>
                      
                      {/* Icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl mb-2">{offer.name}</CardTitle>
                      <CardDescription className="text-base mb-4">
                        {offer.description}
                      </CardDescription>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">à partir de</span>
                        <span className="text-4xl font-bold text-[#3ae5ae]">
                          {offer.price}€
                        </span>
                        
                      </div>
                    </CardHeader>

                    <CardContent className="pb-6">
                      <ul className="space-y-3">
                        {offer.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 group/item">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-0">
                      
                        <Button 
                          className={`w-full group/btn ${
                            offer.popular 
                              ? 'bg-gradient-to-r from-[#3ae5ae] to-emerald-500 text-white hover:opacity-90' 
                              : 'border-2 border-[#3ae5ae] text-[#3ae5ae] bg-transparent hover:bg-[#3ae5ae] hover:text-white'
                          }`}
                          size="lg" disabled={loading || authLoading} onClick={() => handleOrder(offer, 'offer')}
                        >
                          Commander maintenant
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Packs Section */}
      <section className="py-20 bg-gradient-to-br from-[#0A1128]/5 via-purple-50/30 to-blue-50/30 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128] flex justify-center">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="text-center mb-16 fade-in-up">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Maintenance & Hébergement
                </span>
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A1128] dark:text-white mb-4">
                Packs{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Annuels
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Un site qui reste performant, sécurisé et à jour, sans vous soucier de rien
              </p>
            </div>

            {/* Packs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {maintenancePacks.map((pack, index) => {
                const Icon = pack.icon
                return (
                  <Card 
                    key={pack.id} 
                    className={`animate-card relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-500 group ${
                      pack.popular 
                        ? 'border-[#3ae5ae] shadow-lg scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#3ae5ae]'
                    }`}
                  >
                    {/* Popular Badge */}
                    {pack.popular && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 text-white border-0 shadow-lg">
                          ⭐ Recommandé
                        </Badge>
                      </div>
                    )}

                    {/* Gradient Header */}
                    <div className={`relative h-32 bg-gradient-to-br ${pack.color} flex items-center justify-center`}>
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl mb-2">{pack.name}</CardTitle>
                      <CardDescription className="text-base mb-4">
                        {pack.description}
                      </CardDescription>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-[#3ae5ae]">
                          {pack.price}€
                        </span>
                        <span className="text-sm text-muted-foreground">/ an</span>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-6">
                      <ul className="space-y-3">
                        {pack.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 group/item">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Link to={isAuthenticated ? '/checkout' : '/inscription'} className="w-full" state={{ pack }}>
                        <Button 
                          className={`w-full group/btn ${
                            pack.popular 
                              ? 'bg-gradient-to-r from-[#3ae5ae] to-emerald-500 text-white hover:opacity-90' 
                              : 'border-2 border-[#3ae5ae] text-[#3ae5ae] bg-transparent hover:bg-[#3ae5ae] hover:text-white'
                          }`}
                          size="lg"    disabled={loading || authLoading}  onClick={() => handleOrder(pack, 'pack')}
                        >
                          Souscrire maintenant
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#3ae5ae]/5 via-purple-50/30 to-blue-50/30 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128]">
        <div className="container max-w-full px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <Card className="relative overflow-hidden border-2 border-[#3ae5ae]/30 bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3ae5ae]/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
              
              <CardContent className="relative p-0">
                <div className="grid lg:grid-cols-2 gap-0 items-center">
                  {/* Left side - Content */}
                  <div className="p-8 md:p-12 lg:p-16">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#3ae5ae]/10 px-4 py-2 text-sm font-medium text-[#3ae5ae]">
                      <Sparkles className="h-4 w-4" />
                      Commencez Maintenant
                    </div>

                    <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-[#0A1128] dark:text-white">
                      Prêt à démarrer votre{' '}
                      <span className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 bg-clip-text text-transparent">projet digital</span> ?
                    </h2>
                    
                    <p className="mb-6 text-lg text-muted-foreground">
                      Transformez votre vision en réalité avec Devboostly. Nous vous accompagnons de la conception à la mise en ligne, et même au-delà.
                    </p>

                    <div className="mb-8 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Devis gratuit en 24h</h4>
                          <p className="text-sm text-muted-foreground">Recevez une estimation détaillée rapidement et sans engagement</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 flex-shrink-0">
                          <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Accompagnement personnalisé</h4>
                          <p className="text-sm text-muted-foreground">Un chef de projet dédié pour répondre à tous vos besoins</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3ae5ae]/20 flex-shrink-0">
                          <Check className="h-5 w-5 text-[#3ae5ae]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Support continu</h4>
                          <p className="text-sm text-muted-foreground">Assistance technique 24/7 après le lancement de votre site</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/devis" className="flex-1">
                        <Button size="lg" className="w-full bg-[#3ae5ae] hover:bg-[#6a24c7] text-white shadow-lg">
                          Demander un devis gratuit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/contact" className="flex-1">
                        <Button size="lg" variant="outline" className="w-full border-[#3ae5ae]/30 hover:bg-[#3ae5ae]/10 hover:border-[#3ae5ae]">
                          <HeadphonesIcon className="mr-2 h-4 w-4" />
                          Discutons ensemble
                        </Button>
                      </Link>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                      🔒 Vos informations sont 100% sécurisées et confidentielles
                    </p>
                  </div>

                  {/* Right side - Image */}
                  <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                      alt="Équipe collaborant sur un projet digital"
                      className="h-full w-full object-cover rounded-r-lg"
                    />
                    {/* Overlay stats */}
                    <div className="absolute bottom-8 left-8 right-8 z-20">
                      <div className="bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-[#3ae5ae] mb-1">150+</div>
                            <div className="text-xs text-muted-foreground">Projets</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-[#3ae5ae] mb-1">100+</div>
                            <div className="text-xs text-muted-foreground">Clients</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-[#3ae5ae] mb-1">98%</div>
                            <div className="text-xs text-muted-foreground">Satisfaits</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {showLoginModal && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
      <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
        Veuillez vous connecter à votre compte pour commander.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowLoginModal(false)}
          className="px-4 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700"
        >
          Fermer
        </button>
        <button
          onClick={() => navigate('/connexion')}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Se connecter
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        /* Hero animations */
        .hero-content {
          opacity: 0;
          transform: translateY(30px);
        }

        .hero-content.visible {
          opacity: 1;
          transform: translateY(0);
          animation: hero-appear 1s ease-out forwards;
        }

        @keyframes hero-appear {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card animations */
        .animate-card {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .animate-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .animate-card:nth-child(1) { transition-delay: 0.1s; }
        .animate-card:nth-child(2) { transition-delay: 0.2s; }
        .animate-card:nth-child(3) { transition-delay: 0.3s; }

        /* Fade-in-up animations */
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Background animations */
        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -50px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
        
        @keyframes mesh-move {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 50px) scale(0.9);
          }
        }

        /* Performance optimization */
        .animate-card,
        .fade-in-up,
        .hero-content {
          will-change: opacity, transform;
        }

        .visible {
          will-change: auto;
        }
      `}</style>
    </div>
  )
}

export default Offers