import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  Zap, 
  ShoppingCart, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  CheckCircle2,
  FileText, 
  Code, 
  TestTube, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ArrowUp,
  Sparkles,
  MousePointer
} from 'lucide-react'
import { SERVICES } from '@/lib/constants'
import { useEffect, useState, useRef } from 'react'
import msg from './assets/msg.svg'
import search from "./assets/search.svg"

function Home() {
  const [displayText, setDisplayText] = useState('')
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [hoveredLogo, setHoveredLogo] = useState(null)
  const containerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [statsInView, setStatsInView] = useState(false)
  const [clientsCount, setClientsCount] = useState(0)
  const [projectsCount, setProjectsCount] = useState(0)
  const [satisfactionCount, setSatisfactionCount] = useState(0)
  const [yearsCount, setYearsCount] = useState(0)
  const statsRef = useRef(null)

  // Observer pour détecter quand les stats sont visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsInView) {
          setStatsInView(true)
        }
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [statsInView])

  // Animation des compteurs
  useEffect(() => {
    if (!statsInView) return

    const duration = 2000
    const steps = 60
    const increment1 = 100 / steps
    const increment2 = 150 / steps
    const increment3 = 98 / steps
    const increment4 = 5 / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setClientsCount(Math.min(Math.floor(increment1 * currentStep), 100))
      setProjectsCount(Math.min(Math.floor(increment2 * currentStep), 150))
      setSatisfactionCount(Math.min(Math.floor(increment3 * currentStep), 98))
      setYearsCount(Math.min(Math.floor(increment4 * currentStep), 5))

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [statsInView])

  // ✨ NOUVEAU: Hook pour les animations au scroll
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

    // Observer tous les éléments avec classes d'animation
    const animatedElements = document.querySelectorAll(
      '.animate-card, .fade-in-up, .stat-item, .cta-animation'
    )

    animatedElements.forEach((el) => observer.observe(el))

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let offset = 0
    let animationFrame

    const animate = () => {
      if (!isHovered) {
        offset -= 1
      }
      if (offset <= -container.scrollWidth) {
        offset = container.offsetWidth
      }
      container.style.transform = `translateX(${offset}px)`
      animationFrame = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [isHovered])

  const phrases = [
    'site web professionnel',
    'présence en ligne',
    'business digital',
    'site moderne'
  ]

  const techLogos = [
    { 
      id: 1, 
      name: 'React',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      color: '#61DAFB'
    },
    { 
      id: 2, 
      name: 'Node.js',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      color: '#339933'
    },
    { 
      id: 3, 
      name: 'JavaScript',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      color: '#F7DF1E'
    },
    { 
      id: 4, 
      name: 'TypeScript',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      color: '#3178C6'
    },
    { 
      id: 5, 
      name: 'Tailwind CSS',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
      color: '#06B6D4'
    },
    { 
      id: 6, 
      name: 'MongoDB',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      color: '#47A248'
    },
  ]

  const testimonials = [
    {
      id: 1,
      name: "Marie Dubois",
      role: "CEO, TechStart",
      image: "https://i.pravatar.cc/150?img=1",
      comment: "Devboostly a transformé notre présence en ligne. Notre site est rapide, moderne et nous a permis d'augmenter nos conversions de 150%. Une équipe professionnelle et à l'écoute."
    },
    {
      id: 2,
      name: "Ahmed El Mansouri",
      role: "Directeur Marketing, ShopPlus",
      image: "https://i.pravatar.cc/150?img=2",
      comment: "Un travail exceptionnel ! Le site créé par Devboostly dépasse toutes nos attentes. Design élégant, performance optimale et accompagnement personnalisé tout au long du projet."
    },
    {
      id: 3,
      name: "Sophie Martin",
      role: "Fondatrice, BeautyStyle",
      image: "https://i.pravatar.cc/150?img=3",
      comment: "Je recommande vivement Devboostly. Leur expertise en développement web est remarquable. Mon site e-commerce est maintenant un véritable atout pour mon business."
    },
    {
      id: 4,
      name: "Jean-Pierre Laurent",
      role: "Entrepreneur, ConsultPro",
      image: "https://i.pravatar.cc/150?img=4",
      comment: "Une collaboration parfaite du début à la fin. L'équipe a su comprendre mes besoins et créer un site qui reflète parfaitement mon activité. Très satisfait du résultat !"
    }
  ]

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false)
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
      } else {
        setDisplayText(
          isDeleting
            ? currentPhrase.substring(0, displayText.length - 1)
            : currentPhrase.substring(0, displayText.length + 1)
        )
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, currentPhraseIndex])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div>
      {/* Hero Section avec Gradient et Image - CENTRÉ MOBILE */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3ae5ae]/10 via-[#3B82F6]/10 to-transparent dark:from-[#1e1b4b]/30 dark:via-[#1e3a8a]/30"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-[#3ae5ae]/20 dark:bg-[#2563eb]/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#3B82F6]/20 dark:bg-[#1e3a8a]/20 blur-3xl"></div>
        </div>

        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Contenu à gauche - CENTRÉ MOBILE */}
            <div className="text-center lg:text-left flex flex-col justify-center relative">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Boostez votre activité avec un{' '}
                <span className="text-[#3ae5ae] block mt-2 min-h-[1.2em]">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              <p className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Création de sites web modernes, rapides et performants pour développer votre présence en ligne et atteindre vos objectifs business
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link to="/services">
                  <Button size="lg" className="bg-[#3ae5ae] text-white hover:bg-[#2dd49d] border-2 border-[#3ae5ae] transition-all w-full sm:w-auto">
                    Voir nos services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/devis">
                  <Button size="lg" className="bg-[#5e67fe] text-white hover:bg-[#4d56ed] transition-all w-full sm:w-auto shadow-lg">
                    Demander un devis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image à droite avec SVG décoratifs */}
            <div className="relative hidden lg:flex justify-center items-center">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80" 
                  alt="Création de site web professionnel" 
                  className="rounded-2xl shadow-2xl border border-primary/20 dark:border-[#2563eb]/30 max-w-full"
                />
                
                <div className="absolute -top-12 -right-12 animate-bounce" style={{animationDuration: '3s'}}>
                  <img src={search} alt="" className="w-28 h-28 opacity-80" />
                </div>
                
                <div className="absolute -bottom-12 -right-12 animate-pulse" style={{animationDelay: '0.5s'}}>
                  <img src={msg} alt="" className="w-28 h-28 opacity-80" />
                </div>
              </div>
              
              <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
                <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-[#3ae5ae] dark:bg-[#2563eb]"></div>
                <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-[#3B82F6] dark:bg-[#1e3a8a]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Tech Logos Section */}
      <section className="bg-muted/50 dark:bg-[#1e1b4b]/20 mt-10">
        <div className="relative overflow-hidden w-full flex justify-center items-center">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          
          <div ref={containerRef} className="flex gap-16">
            {techLogos.map((tech) => (
              <div key={tech.id} className="flex-shrink-0 w-20 h-40 md:w-24 md:h-24">
                <img
                  src={tech.logo}
                  alt={tech.name}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    hoveredLogo === tech.id ? 'grayscale-0' : 'grayscale'
                  }`}
                  onMouseEnter={() => setHoveredLogo(tech.id)}
                  onMouseLeave={() => setHoveredLogo(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Pourquoi nous choisir */}
      <section className="py-20 bg-muted/30 dark:bg-[#1e1b4b]/20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-16 text-center fade-in-up">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 rounded-full bg-[#3ae5ae]/10 dark:bg-[#1e3a8a]/30 border border-[#3ae5ae]/20 dark:border-[#2563eb]/40 text-[#3ae5ae] dark:text-[#3b82f6] font-semibold text-sm">
                Pourquoi nous choisir ?
              </span>
            </div>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">Des solutions adaptées à vos besoins</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Garanties de qualité et accompagnement personnalisé pour votre réussite en ligne
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <Card className="animate-card border-2 border-[#3ae5ae]/20 dark:border-[#1e3a8a]/40 hover:border-[#3ae5ae] dark:hover:border-[#3b82f6] dark:hover:bg-[#1e1b4b]/30 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3ae5ae] to-emerald-500 group-hover:scale-110 transition-transform mx-auto">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Rapide et Performant</CardTitle>
                <CardDescription className="text-base">
                  Sites optimisés pour des temps de chargement ultra-rapides et une expérience utilisateur fluide
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-card border-2 border-[#3ae5ae]/20 dark:border-[#1e3a8a]/40 hover:border-[#3ae5ae] dark:hover:border-[#3b82f6] dark:hover:bg-[#1e1b4b]/30 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3ae5ae] to-emerald-500 group-hover:scale-110 transition-transform mx-auto">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Sécurisé</CardTitle>
                <CardDescription className="text-base">
                  Sécurité SSL, protection contre les menaces en ligne et mises à jour régulières
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-card border-2 border-[#3ae5ae]/20 dark:border-[#1e3a8a]/40 hover:border-[#3ae5ae] dark:hover:border-[#3b82f6] dark:hover:bg-[#1e1b4b]/30 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <CardHeader className="text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3ae5ae] to-emerald-500 group-hover:scale-110 transition-transform mx-auto">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">SEO Optimisé</CardTitle>
                <CardDescription className="text-base">
                  Référencement naturel optimisé pour être visible sur Google et attirer plus de clients
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Comment ça marche Section */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-16 text-center fade-in-up">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 rounded-full bg-[#3ae5ae]/10 dark:bg-[#1e3a8a]/30 border border-[#3ae5ae]/20 dark:border-[#2563eb]/40 text-[#3ae5ae] dark:text-[#3b82f6] font-semibold text-sm">
                Comment ça marche ?
              </span>
            </div>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">Un Accompagnement Complet pour Votre Site Web</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nous suivons un processus clair et structuré pour concevoir un site web qui répond parfaitement à vos attentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              { num: "01", icon: FileText, title: "Demande de service", desc: "Contactez-nous pour discuter de votre projet. Nous analysons vos besoins et vous proposons une solution adaptée à vos objectifs." },
              { num: "02", icon: CheckCircle, title: "Analyse des besoins", desc: "Nous étudions en profondeur vos besoins, votre marché et vos concurrents pour créer une stratégie digitale performante." },
              { num: "03", icon: Code, title: "Développement du site", desc: "Notre équipe développe votre site avec les dernières technologies. Design moderne, code propre et performance optimale garantis." },
              { num: "04", icon: TestTube, title: "Validation et tests", desc: "Tests rigoureux sur tous les navigateurs et appareils. Validation complète avant la mise en ligne de votre site web professionnel." }
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="animate-card border-2 border-[#3ae5ae]/20 dark:border-[#1e3a8a]/40 hover:border-[#3ae5ae] dark:hover:border-[#3b82f6] dark:hover:bg-[#1e1b4b]/30 transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                  <CardHeader className="text-center flex-grow flex flex-col">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-[#3ae5ae]/30 dark:border-[#2563eb]/50 flex items-center justify-center text-2xl font-bold text-[#3ae5ae] dark:text-[#3b82f6]">
                        {step.num}
                      </div>
                    </div>
                    <div className="mb-4 flex justify-center">
                      <Icon className="h-16 w-16 text-[#3ae5ae] dark:text-[#3b82f6]" />
                    </div>
                    <div className="mb-4 mx-auto w-1/2 h-[2px] bg-gray-300 dark:bg-[#2563eb]/50"></div>
                    <CardTitle className="text-xl mb-3">{step.title}</CardTitle>
                    <CardDescription className="text-base mb-4 flex-grow">
                      {step.desc}
                    </CardDescription>
                    
                    <div className="mt-auto pt-4">
                      <Link to="/services" className="block w-full">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out 
                          border-2 border-[#3ae5ae] text-[#3ae5ae] bg-transparent
                          hover:border-[#3ae5ae] hover:bg-[#3ae5ae] hover:text-white
                          dark:border-[#3b82f6] dark:text-white dark:bg-transparent
                          dark:hover:bg-[#3b82f6] dark:hover:border-[#3b82f6]"
                        >
                          En savoir plus
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted/50 dark:bg-[#1e1b4b]/20 py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-16 text-center fade-in-up">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 rounded-full bg-[#3ae5ae]/10 dark:bg-[#1e3a8a]/30 border border-[#3ae5ae]/20 dark:border-[#2563eb]/40 text-[#3ae5ae] dark:text-[#3b82f6] font-semibold text-sm">
                Nos Services
              </span>
            </div>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">Des solutions complètes pour votre réussite</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Découvrez notre gamme complète de services digitaux conçus pour propulser votre entreprise vers le succès. De la création de sites web à l'optimisation SEO, nous couvrons tous vos besoins numériques.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {[
              { 
                title: "Création de Sites Web",
                desc: "Sites web modernes, responsive et performants. Interface intuitive, design sur mesure et expérience utilisateur optimale pour convertir vos visiteurs en clients.",
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                color: "from-blue-500/10 to-blue-600/5",
                darkColor: "dark:from-[#1e3a8a]/20 dark:to-[#2563eb]/10",
                iconColor: "text-blue-600 dark:text-[#3b82f6]"
              },
              {
                title: "E-commerce",
                desc: "Boutiques en ligne complètes et sécurisées. Gestion des produits, paiement en ligne, suivi des commandes et tableau de bord intégré pour gérer vos ventes facilement.",
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
                color: "from-green-500/10 to-green-600/5",
                darkColor: "dark:from-[#1e3a8a]/20 dark:to-[#2563eb]/10",
                iconColor: "text-green-600 dark:text-[#3b82f6]"
              },
              {
                title: "SEO & Marketing Digital",
                desc: "Optimisation pour moteurs de recherche et stratégies marketing. Augmentez votre visibilité en ligne, attirez plus de clients et boostez votre chiffre d'affaires.",
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
                color: "from-purple-500/10 to-purple-600/5",
                darkColor: "dark:from-[#1e3a8a]/20 dark:to-[#2563eb]/10",
                iconColor: "text-purple-600 dark:text-[#3b82f6]"
              },
              {
                title: "Maintenance & Support",
                desc: "Maintenance continue et support technique réactif. Mises à jour régulières, sauvegardes automatiques et assistance disponible pour assurer la performance de votre site.",
                svg: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
                color: "from-orange-500/10 to-orange-600/5",
                darkColor: "dark:from-[#1e3a8a]/20 dark:to-[#2563eb]/10",
                iconColor: "text-orange-600 dark:text-[#3b82f6]"
              }
            ].map((service, index) => (
              <Card key={index} className="animate-card border-2 border-[#3ae5ae]/20 dark:border-[#1e3a8a]/40 hover:border-[#3ae5ae] dark:hover:border-[#3ae5ae] dark:hover:bg-[#1e1b4b]/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group flex flex-col">
                <CardHeader className="text-center pb-4 flex-grow flex flex-col">
                  <div className="mb-6 flex justify-center">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} ${service.darkColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-500/20 dark:border-[#2563eb]/30`}>
                      <svg className={`w-12 h-12 ${service.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {service.svg}
                      </svg>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-4 font-bold">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed px-2 flex-grow">
                    {service.desc}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-6">
                  <Link to="/services" className="block w-full">
                    <Button 
                      variant="outline"
                      className="w-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out 
                      border-2 border-[#3ae5ae] text-[#3ae5ae] bg-transparent
                      hover:border-[#3ae5ae] hover:bg-[#3ae5ae] hover:text-white
                      dark:border-[#3ae5ae] dark:text-white dark:bg-transparent
                      dark:hover:bg-[#3ae5ae] dark:hover:border-[#3ae5ae]"
                    >
                      Découvrir ce service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/services">
              <Button size="lg" className="bg-[#3ae5ae] text-white hover:bg-[#2dd49d] px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                Découvrir tous nos services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#3ae5ae]/5 dark:bg-[#1e3a8a]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 dark:bg-[#2563eb]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-16 text-center fade-in-up">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 rounded-full bg-[#3ae5ae]/10 dark:bg-[#1e3a8a]/30 border border-[#3ae5ae]/20 dark:border-[#2563eb]/40 text-[#3ae5ae] dark:text-[#3b82f6] font-semibold text-sm">
                Témoignages Clients
              </span>
            </div>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              Ce que nos clients disent de nous
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez les retours d'expérience de nos clients qui ont fait confiance à Devboostly pour leur transformation digitale
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10" ref={statsRef}>
              {[
                { count: clientsCount, label: "Clients Satisfaits" },
                { count: projectsCount, label: "Projets Réalisés" },
                { count: satisfactionCount, label: "Taux de Satisfaction", suffix: "%" },
                { count: yearsCount, label: "Années d'Expérience" }
              ].map((stat, index) => (
                <div key={index} className="stat-item text-center p-6 rounded-2xl border border-[#3ae5ae]/10 dark:border-[#2563eb]/20 bg-[#3ae5ae]/5 dark:bg-[#1e1b4b]/20 hover:border-[#3ae5ae]/30 dark:hover:border-[#2563eb]/40 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-[#3ae5ae] dark:text-[#3b82f6] mb-2">
                    {stat.count}{stat.suffix || "+"}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <Card className="border-2 border-[#3ae5ae]/20 dark:border-[#1e3a8a]/40 transition-all duration-300 relative overflow-hidden group">
                      <CardContent className="p-8 md:p-12 lg:p-16">
                        <div className="mb-6 flex justify-center">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3ae5ae]/10 to-[#3ae5ae]/5 dark:from-[#1e3a8a]/20 dark:to-[#2563eb]/10 flex items-center justify-center border border-[#3ae5ae]/20 dark:border-[#2563eb]/30 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-[#3ae5ae] dark:text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="mb-8 relative">
                          <p className="text-xl md:text-2xl text-center leading-relaxed text-foreground/90 dark:text-foreground/80 font-medium">
                            {testimonial.comment}
                          </p>
                        </div>
                        
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#3ae5ae]/50 dark:via-[#2563eb]/50 to-transparent mx-auto mb-8"></div>
                        
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <img 
                              src={testimonial.image} 
                              alt={testimonial.name}
                              className="w-20 h-20 rounded-full border-4 border-[#3ae5ae]/20 dark:border-[#2563eb]/40 shadow-lg object-cover"
                            />
                          </div>
                          
                          <div className="text-center">
                            <p className="font-bold text-xl mb-1">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground font-medium">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-14 h-14 rounded-xl bg-white dark:bg-[#1e1b4b] shadow-xl border-2 border-[#3ae5ae]/20 dark:border-[#2563eb]/40 flex items-center justify-center hover:border-[#3ae5ae] dark:hover:border-[#3b82f6] hover:scale-110 transition-all duration-300 group"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="w-7 h-7 text-[#3ae5ae] dark:text-[#3b82f6] group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-14 h-14 rounded-xl bg-white dark:bg-[#1e1b4b] shadow-xl border-2 border-[#3ae5ae]/20 dark:border-[#2563eb]/40 flex items-center justify-center hover:border-[#3ae5ae] dark:hover:border-[#3b82f6] hover:scale-110 transition-all duration-300 group"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="w-7 h-7 text-[#3ae5ae] dark:text-[#3b82f6] group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex justify-center items-center gap-3 mt-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'w-12 h-3 bg-[#3ae5ae] dark:bg-[#3b82f6] rounded-full shadow-lg' 
                      : 'w-3 h-3 bg-[#3ae5ae]/30 dark:bg-[#2563eb]/30 rounded-full hover:bg-[#3ae5ae]/50 dark:hover:bg-[#2563eb]/60 hover:scale-125'
                  }`}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#3ae5ae]/5 via-emerald-50/30 to-blue-50/30 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128]">
        <div className="container max-w-full px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <Card className="cta-animation relative overflow-hidden border-2 border-[#3ae5ae]/30 bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3ae5ae]/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
              
              <CardContent className="relative p-0">
                <div className="grid lg:grid-cols-2 gap-0 items-center">
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
                      {[
                        { icon: "🎯", title: "Devis gratuit en 24h", desc: "Recevez une estimation détaillée rapidement et sans engagement", color: "green" },
                        { icon: "👥", title: "Accompagnement personnalisé", desc: "Un chef de projet dédié pour répondre à tous vos besoins", color: "blue" },
                        { icon: "🛡️", title: "Support continu", desc: "Assistance technique 24/7 après le lancement de votre site", color: "[#3ae5ae]" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-${item.color}-500/20 flex-shrink-0`}>
                            <CheckCircle2 className={`h-5 w-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/devis" className="flex-1">
                        <Button size="lg" className="w-full bg-[#5e67fe] hover:bg-[#4d56ed] text-white shadow-lg">
                          Demander un devis gratuit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/contact" className="flex-1">
                        <Button size="lg" variant="outline" className="w-full border-[#3ae5ae]/30 hover:bg-[#3ae5ae]/10 hover:border-[#3ae5ae]">
                          <MousePointer className="mr-2 h-4 w-4" />
                          Discutons ensemble
                        </Button>
                      </Link>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                      🔒 Vos informations sont 100% sécurisées et confidentielles
                    </p>
                  </div>

                  <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                      alt="Équipe collaborant sur un projet digital"
                      className="h-full w-full object-cover rounded-r-lg"
                    />
                    <div className="absolute bottom-8 left-8 right-8 z-20">
                      <div className="bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          {[
                            { value: "150+", label: "Projets" },
                            { value: "100+", label: "Clients" },
                            { value: "98%", label: "Satisfaits" }
                          ].map((stat, index) => (
                            <div key={index}>
                              <div className="text-2xl font-bold text-[#3ae5ae] mb-1">{stat.value}</div>
                              <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#3ae5ae] to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      )}

      {/* CSS pour les animations au scroll */}
      <style>{`
        /* Animations de base */
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
        .animate-card:nth-child(4) { transition-delay: 0.4s; }

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .stat-item {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .stat-item.visible {
          opacity: 1;
          transform: scale(1);
        }

        .stat-item:nth-child(1) { transition-delay: 0.1s; }
        .stat-item:nth-child(2) { transition-delay: 0.2s; }
        .stat-item:nth-child(3) { transition-delay: 0.3s; }
        .stat-item:nth-child(4) { transition-delay: 0.4s; }

        .cta-animation {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 1s ease-out, transform 1s ease-out;
        }

        .cta-animation.visible {
          opacity: 1;
          transform: scale(1);
        }

        /* Performance optimization */
        .animate-card,
        .fade-in-up,
        .stat-item,
        .cta-animation {
          will-change: opacity, transform;
        }

        .visible {
          will-change: auto;
        }
      `}</style>
    </div>
  )
}

export default Home