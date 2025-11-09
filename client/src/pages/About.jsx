import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Target, 
  Heart, 
  Award, 
  Users, 
  Rocket, 
  Shield,
  Zap,
  TrendingUp,
  Code,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageCircle
} from 'lucide-react'

// Hook pour animation de compteur
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = (currentTime - startTime) / duration

      if (progress < 1) {
        setCount(Math.floor(end * progress))
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return [count, ref]
}

// Composant Stat avec animation
function AnimatedStat({ number, label, icon: Icon, suffix = '', color }) {
  const numericValue = parseInt(number)
  const [count, ref] = useCountUp(numericValue)

  return (
    <div ref={ref} className="text-center">
      <div className="mb-4 flex justify-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${color} shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="mb-2 text-4xl font-bold gradient-text">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function About() {
  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque projet pour garantir votre satisfaction totale',
      bgColor: 'bg-[#3ae5ae]/10',
      iconBg: 'bg-[#3ae5ae]',
      borderColor: 'border-[#3ae5ae]/30'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Notre passion pour le développement web se reflète dans chaque ligne de code',
      bgColor: 'bg-red-500/10',
      iconBg: 'bg-red-500',
      borderColor: 'border-red-500/30'
    },
    {
      icon: Award,
      title: 'Qualité',
      description: 'Des standards de qualité élevés pour des sites performants et durables',
      bgColor: 'bg-blue-500/10',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-500/30'
    },
  ]

  const stats = [
    { number: '150', label: 'Projets réalisés', icon: Rocket, suffix: '+', color: 'bg-gradient-to-br from-[#3ae5ae] to-emerald-500' },
    { number: '100', label: 'Clients satisfaits', icon: Users, suffix: '+', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { number: '98', label: 'Taux de satisfaction', icon: Heart, suffix: '%', color: 'bg-gradient-to-br from-red-500 to-pink-500' },
    { number: '24', label: 'Support disponible', icon: Shield, suffix: '/7', color: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Performance maximale',
      description: 'Sites ultra-rapides optimisés pour tous les appareils et toutes les connexions',
      bgColor: 'bg-yellow-500/10',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      iconColor: 'text-white'
    },
    {
      icon: Shield,
      title: 'Sécurité renforcée',
      description: 'Protection SSL, pare-feu et sécurité de niveau entreprise pour vos données',
      bgColor: 'bg-green-500/10',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      iconColor: 'text-white'
    },
    {
      icon: TrendingUp,
      title: 'SEO optimisé',
      description: 'Référencement naturel avancé pour maximiser votre visibilité sur Google',
      bgColor: 'bg-blue-500/10',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconColor: 'text-white'
    },
    {
      icon: Code,
      title: 'Code propre',
      description: 'Développement professionnel avec les technologies les plus modernes et performantes',
      bgColor: 'bg-emerald-400/10',
      iconBg: 'bg-gradient-to-br from-[#3ae5ae] to-emerald-500',
      iconColor: 'text-white'
    },
  ]

  return (
    <div>
      {/* Hero Section - CENTRÉ */}
      <section className="relative overflow-hidden py-40 md:py-52">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70 z-10"></div>
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src="https://videos.pexels.com/video-files/3130182/3130182-uhd_2560_1440_30fps.mp4" type="video/mp4" />
            <source src="https://cdn.coverr.co/videos/coverr-developer-coding-6883/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 opacity-10 z-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#3ae5ae]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container relative z-20">
          <div className="mx-auto max-w-4xl text-center animate-on-scroll hero-fade">
            <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white border border-white/20">
              <Sparkles className="h-4 w-4" />
              À propos de nous
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Votre partenaire digital de{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">confiance</span>
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-xl text-white/90 md:text-2xl leading-relaxed">
              Nous transformons vos idées en solutions digitales performantes et innovantes
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-[#3ae5ae] hover:bg-white/90 shadow-2xl px-8 py-6 text-lg">
                  Contactez-nous <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="border-2 bg-transparent border-white text-white hover:bg-white hover:text-[#3ae5ae] px-8 py-6 text-lg backdrop-blur-sm">
                  Nos services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Histoire - CENTRÉ */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 items-center animate-on-scroll story-slide">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#3ae5ae] to-emerald-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" alt="Notre équipe" className="relative rounded-2xl shadow-2xl w-full h-auto object-cover" />
              </div>

              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#3ae5ae]/10 px-4 py-2 text-sm font-medium text-[#3ae5ae]">
                  <Sparkles className="h-4 w-4" />
                  Notre Histoire
                </div>

                <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                  Une passion pour <span className="gradient-text">l'innovation</span>
                </h2>

                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Fondée en 2019, <span className="font-semibold text-foreground">Devboostly</span> est née de la volonté de démocratiser l'accès aux technologies web de haute qualité pour toutes les entreprises, quelle que soit leur taille.
                  </p>
                  <p>
                    Notre équipe de développeurs passionnés combine expertise technique et créativité pour créer des solutions digitales qui font la différence. Chaque projet est une opportunité de repousser les limites et d'innover.
                  </p>
                  <p>
                    Aujourd'hui, nous sommes fiers d'avoir accompagné plus de <span className="font-semibold text-[#3ae5ae]">100 entreprises</span> dans leur transformation digitale, avec un taux de satisfaction client de <span className="font-semibold text-[#3ae5ae]">98%</span>.
                  </p>
                </div>

                <div className="flex justify-center lg:justify-start">
                  <Link to="/contact">
                    <Button size="lg" className="bg-[#3ae5ae] hover:bg-[#2dd49d] text-white">
                      Rejoignez l'aventure <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - CENTRÉ */}
      <section className="py-20 bg-gradient-to-br from-[#3ae5ae]/5 via-emerald-50/30 to-blue-50/30 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128]">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center animate-on-scroll fade-up">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Nos chiffres <span className="gradient-text">clés</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
                Des résultats concrets qui témoignent de notre engagement
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <AnimatedStat key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values - CENTRÉ */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center animate-on-scroll fade-up">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Nos <span className="gradient-text">valeurs</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
                Les principes qui guident notre travail au quotidien
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card key={index} className={`animate-on-scroll card-slide group relative overflow-hidden border-2 ${value.borderColor} hover:border-opacity-70 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className={`absolute inset-0 ${value.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <CardHeader className="relative text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <div className={`w-full h-full rounded-full ${value.iconBg} flex items-center justify-center`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                      <CardDescription className="text-base">{value.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features - CENTRÉ */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center animate-on-scroll fade-up">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ce qui nous <span className="gradient-text">différencie</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Des avantages concrets pour votre réussite en ligne
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="animate-on-scroll card-slide group hover:border-primary/50 transition-all hover:shadow-lg text-center relative overflow-hidden" style={{animationDelay: `${index * 100}ms`}}>
                    <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <CardHeader className="relative">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                        <div className={`w-full h-full rounded-full ${feature.iconBg} flex items-center justify-center shadow-lg`}>
                          <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#3ae5ae]/5 via-emerald-50/30 to-blue-50/30 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128]">
        <div className="container max-w-full px-4 md:px-8">
          <Card className="relative overflow-hidden border-2 border-[#3ae5ae]/30 bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3ae5ae]/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
            
            <CardContent className="relative p-0">
              <div className="grid lg:grid-cols-2 gap-0 items-center">
                <div className="p-8 md:p-12 lg:p-16">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#3ae5ae]/10 px-4 py-2 text-sm font-medium text-[#3ae5ae]">
                    <Sparkles className="h-4 w-4" />
                    Commencez Maintenant
                  </div>

                  <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                    Prêt à démarrer votre <span className="gradient-text">projet digital</span> ?
                  </h2>
                  
                  <p className="mb-6 text-lg text-muted-foreground">
                    Transformez votre vision en réalité avec Devboostly. Nous vous accompagnons de la conception à la mise en ligne, et même au-delà.
                  </p>

                  <div className="mb-8 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Devis gratuit en 24h</h4>
                        <p className="text-sm text-muted-foreground">Recevez une estimation détaillée rapidement et sans engagement</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Accompagnement personnalisé</h4>
                        <p className="text-sm text-muted-foreground">Un chef de projet dédié pour répondre à tous vos besoins</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3ae5ae]/20 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-[#3ae5ae]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Support continu</h4>
                        <p className="text-sm text-muted-foreground">Assistance technique 24/7 après le lancement de votre site</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/devis" className="flex-1">
                      <Button size="lg" className="w-full bg-[#5e67fe] hover:bg-[#4d56ed] text-white shadow-lg">
                        Demander un devis gratuit <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/contact" className="flex-1">
                      <Button size="lg" variant="outline" className="w-full border-[#3ae5ae]/30 hover:bg-[#3ae5ae]/10 hover:border-[#3ae5ae]">
                        <MessageCircle className="mr-2 h-4 w-4" />
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
                  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" alt="Équipe collaborant" className="h-full w-full object-cover rounded-r-lg" />
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
      </section>

      <style>{`
        .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .animate-on-scroll.animate-visible { opacity: 1; transform: translateY(0); }
        
        .hero-fade.animate-visible { animation: heroFade 1s ease-out forwards; }
        @keyframes heroFade { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        
        .story-slide.animate-visible { animation: storySlide 0.8s ease-out forwards; }
        @keyframes storySlide { 0% { opacity: 0; transform: translateX(-30px); } 100% { opacity: 1; transform: translateX(0); } }
        
        .card-slide { transition-delay: 0s; }
        .card-slide:nth-child(1) { transition-delay: 0.1s; }
        .card-slide:nth-child(2) { transition-delay: 0.2s; }
        .card-slide:nth-child(3) { transition-delay: 0.3s; }
        .card-slide:nth-child(4) { transition-delay: 0.4s; }
        
        .fade-up.animate-visible { animation: fadeUp 0.8s ease-out forwards; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        
        .gradient-text { background: linear-gradient(to right, #3ae5ae, #2dd49d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>
    </div>
  )
}

export default About