import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  Globe, 
  ShoppingCart, 
  Wrench, 
  TrendingUp, 
  CheckCircle2,
  Code,
  Zap,
  Shield,
  Users,
  Search,
  BarChart,
  RefreshCw,
  Package,
  Smartphone,
  Lock,
  MousePointer,
  Monitor,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

function Services() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  }
  
  const services = [
    {
      icon: Globe,
      title: 'Création de sites web',
      subtitle: 'Sites professionnels sur mesure',
      description: 'Conception et développement de sites web modernes, performants et parfaitement adaptés à votre identité de marque. Nous créons des expériences utilisateur exceptionnelles qui convertissent vos visiteurs en clients.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      features: [
        { icon: Code, text: 'Design moderne et responsive sur tous les appareils' },
        { icon: Search, text: 'Optimisation SEO pour un meilleur référencement' },
        { icon: Zap, text: 'Performance et rapidité de chargement optimales' },
        { icon: Smartphone, text: 'Interface intuitive et expérience utilisateur fluide' },
      ],
      details: [
        'Sites vitrines professionnels',
        'Sites corporate et institutionnels',
        'Landing pages à haute conversion',
        'Portfolios et sites personnels',
        'Intégration de CMS (WordPress, etc.)',
        'Animations et interactions modernes'
      ],
      color: 'from-[#3ae5ae] to-emerald-500',
      bgColor: 'bg-[#3ae5ae]/10',
      borderColor: 'border-[#3ae5ae]/30'
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce',
      subtitle: 'Boutiques en ligne performantes',
      description: 'Solutions e-commerce complètes et sécurisées pour vendre vos produits en ligne. Système de gestion intégré, paiements sécurisés, et expérience d\'achat optimisée pour maximiser vos ventes.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
      features: [
        { icon: Package, text: 'Gestion avancée des produits et des stocks' },
        { icon: Lock, text: 'Paiements en ligne 100% sécurisés (SSL)' },
        { icon: BarChart, text: 'Tableau de bord et statistiques de vente' },
        { icon: Users, text: 'Gestion complète des clients et commandes' },
      ],
      details: [
        'Boutique en ligne sur mesure',
        'Catalogue produits illimité',
        'Panier et tunnel de commande optimisé',
        'Gestion des promotions et codes promo',
        'Suivi des commandes en temps réel',
        'Intégration avec systèmes de livraison',
        'Paiement par carte, PayPal, etc.',
        'Espace client personnalisé'
      ],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: Wrench,
      title: 'Maintenance & Support',
      subtitle: 'Tranquillité d\'esprit garantie',
      description: 'Service de maintenance proactive et support technique réactif pour assurer le bon fonctionnement, la sécurité et les performances optimales de votre site web 24h/24, 7j/7.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop',
      features: [
        { icon: RefreshCw, text: 'Mises à jour régulières et automatiques' },
        { icon: Shield, text: 'Sauvegardes quotidiennes automatiques' },
        { icon: Zap, text: 'Support technique rapide et réactif' },
        { icon: CheckCircle2, text: 'Corrections de bugs et améliorations' },
      ],
      details: [
        'Surveillance 24/7 de votre site',
        'Mises à jour de sécurité prioritaires',
        'Sauvegardes automatiques quotidiennes',
        'Correction rapide des bugs',
        'Support technique par email/téléphone',
        'Optimisation continue des performances',
        'Mises à jour de contenu',
        'Rapports mensuels détaillés'
      ],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      icon: TrendingUp,
      title: 'Référencement SEO',
      subtitle: 'Visibilité maximale sur Google',
      description: 'Stratégies SEO complètes et personnalisées pour propulser votre site en première page de Google. Augmentez votre trafic organique, votre visibilité en ligne et générez plus de leads qualifiés.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      features: [
        { icon: Search, text: 'Audit SEO technique complet et détaillé' },
        { icon: BarChart, text: 'Optimisation on-page et structure du site' },
        { icon: TrendingUp, text: 'Stratégie de contenu et mots-clés ciblés' },
        { icon: CheckCircle2, text: 'Suivi et rapports de performances réguliers' },
      ],
      details: [
        'Analyse approfondie de votre site',
        'Recherche de mots-clés stratégiques',
        'Optimisation technique (vitesse, mobile)',
        'Amélioration du contenu existant',
        'Création de contenu optimisé SEO',
        'Netlinking et backlinks de qualité',
        'Optimisation Google My Business',
        'Rapports mensuels de positionnement'
      ],
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - CENTRÉ MOBILE */}
      <motion.section
        className="relative py-20 md:py-32 bg-gradient-to-br from-[#3ae5ae]/10 via-white to-blue-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#1a1f3a]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.2 }}
      >
        {/* Animated decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#3ae5ae]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#3ae5ae]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Text Content (centré sur mobile) */}
              <motion.div
                className="text-center lg:text-left space-y-6"
                variants={fadeInUp}
              >
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full bg-[#3ae5ae]/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-[#3ae5ae] border border-[#3ae5ae]/20"
                  variants={scaleIn}
                >
                  <Monitor className="h-4 w-4" />
                  Nos Services
                </motion.div>

                <motion.h1
                  className="text-4xl font-bold tracking-tight text-[#0A1128] dark:text-white sm:text-5xl md:text-6xl leading-tight"
                  variants={fadeInUp}
                >
                  Des solutions{' '}
                  <span className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 bg-clip-text text-transparent animate-gradient-shimmer" style={{backgroundSize: '200% 200%'}}>
                    complètes
                  </span>{' '}
                  pour votre succès digital
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground leading-relaxed"
                  variants={fadeInUp}
                >
                  De la conception à la maintenance, nous vous accompagnons à chaque étape de votre projet web pour garantir des résultats exceptionnels
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start"
                  variants={fadeInUp}
                >
                  <Link to="/devis">
                    <Button size="lg" className="bg-[#3ae5ae] hover:bg-[#2dd49d] text-white shadow-lg hover:shadow-xl transition-all">
                      Demander un devis gratuit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="border-[#3ae5ae]/30 hover:bg-[#3ae5ae]/10 hover:border-[#3ae5ae] transition-all">
                      <MousePointer className="mr-2 h-5 w-5" />
                      Discuter de votre projet
                    </Button>
                  </Link>
                </motion.div>

                {/* Stats with smooth animations */}
                <motion.div
                  className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700"
                  variants={fadeInUp}
                >
                  <motion.div
                    className="animate-fade-up"
                    style={{animationDelay: '0.1s', animationFillMode: 'both'}}
                    variants={scaleIn}
                  >
                    <div className="text-3xl font-bold text-[#3ae5ae] mb-1 animate-number-pulse">150+</div>
                    <div className="text-sm text-muted-foreground">Projets</div>
                  </motion.div>
                  <motion.div
                    className="animate-fade-up"
                    style={{animationDelay: '0.2s', animationFillMode: 'both'}}
                    variants={scaleIn}
                  >
                    <div className="text-3xl font-bold text-[#3ae5ae] mb-1 animate-number-pulse" style={{animationDelay: '0.2s'}}>100+</div>
                    <div className="text-sm text-muted-foreground">Clients</div>
                  </motion.div>
                  <motion.div
                    className="animate-fade-up"
                    style={{animationDelay: '0.3s', animationFillMode: 'both'}}
                    variants={scaleIn}
                  >
                    <div className="text-3xl font-bold text-[#3ae5ae] mb-1 animate-number-pulse" style={{animationDelay: '0.4s'}}>98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaits</div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right - Image */}
              <motion.div
                className="relative lg:block hidden"
                variants={fadeInRight}
              >
                <div className="relative">
                  {/* Decorative glow behind image */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-[#3ae5ae]/20 to-blue-500/20 rounded-3xl blur-2xl animate-glow-pulse"></div>

                  {/* Main image */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 dark:border-gray-800/50 animate-float-smooth">
                    <img
                      src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
                      alt="Services digitaux professionnels"
                      className="w-full h-auto object-cover"
                    />
                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3ae5ae]/10 to-transparent"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Services Section - CENTERED */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-20">
              {services.map((service, index) => {
                const Icon = service.icon
                const isEven = index % 2 === 0

                return (
                  <motion.div
                    key={index}
                    className="relative"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={isEven ? fadeInLeft : fadeInRight}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card className={`overflow-hidden border-2 ${service.borderColor} hover:shadow-2xl transition-all duration-500 group bg-white/50 dark:bg-[#0A1128]/50 backdrop-blur-sm`}>
                      <div className={`grid lg:grid-cols-2 gap-0 ${!isEven ? 'lg:grid-flow-dense' : ''}`}>
                        {/* Image Section */}
                        <motion.div
                          className={`relative h-[350px] lg:h-auto overflow-hidden ${!isEven ? 'lg:col-start-2' : ''}`}
                          variants={scaleIn}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500 z-10`}></div>
                          <img
                            src={service.image}
                            alt={service.title}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* Floating icon badge */}
                          <div className="absolute top-6 left-6 z-20">
                            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} shadow-2xl animate-float-smooth`}>
                              <Icon className="h-10 w-10 text-white" />
                            </div>
                          </div>
                        </motion.div>

                        {/* Content Section */}
                        <motion.div
                          className={`p-8 lg:p-12 flex flex-col justify-center ${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}
                          variants={fadeInUp}
                        >
                          <CardHeader className="p-0 mb-6">
                            <div className="mb-4 flex items-center gap-3">
                              <div className={`h-1 w-12 bg-gradient-to-r ${service.color} rounded-full`}></div>
                              <span className={`text-sm font-semibold ${index === 0 ? 'text-[#3ae5ae]' : 'text-primary'} uppercase tracking-wide`}>
                                {service.subtitle}
                              </span>
                            </div>

                            <CardTitle className="text-3xl md:text-4xl mb-4 text-[#0A1128] dark:text-white">
                              {service.title}
                            </CardTitle>

                            <CardDescription className="text-base md:text-lg leading-relaxed">
                              {service.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="p-0 space-y-6">
                            {/* Key Features */}
                            <div className="space-y-4">
                              {service.features.map((feature, idx) => {
                                const FeatureIcon = feature.icon
                                return (
                                  <div key={idx} className="flex items-start gap-4 group/item">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.bgColor} border ${service.borderColor} flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300`}>
                                      <FeatureIcon className={`h-5 w-5 ${index === 0 ? 'text-[#3ae5ae]' : 'text-primary'}`} />
                                    </div>
                                    <p className="text-muted-foreground pt-2 leading-relaxed">
                                      {feature.text}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Details Grid */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                              <h4 className={`font-bold ${index === 0 ? 'text-[#3ae5ae]' : 'text-primary'} text-lg mb-4 flex items-center gap-2`}>
                                <CheckCircle2 className="h-5 w-5" />
                                Ce qui est inclus
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {service.details.map((detail, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm group/detail">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-muted-foreground group-hover/detail:text-foreground transition-colors">
                                      {detail}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-6">
                              <Link to="/devis">
                                <Button className={`w-full sm:w-auto bg-gradient-to-r ${service.color} text-white hover:opacity-90 shadow-lg group/btn`}>
                                  En savoir plus
                                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <motion.section
        className="py-20 bg-gradient-to-br from-muted/30 to-muted/10"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.2 }}
      >
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="text-center mb-16"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-[#3ae5ae] to-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-[#3ae5ae] uppercase tracking-wide">
                  Notre Processus
                </span>
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-[#3ae5ae] rounded-full"></div>
              </div>

              <h2 className="text-3xl font-bold md:text-4xl text-[#0A1128] dark:text-white mb-4">
                Une méthodologie{' '}
                <span className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 bg-clip-text text-transparent">
                  éprouvée
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                4 étapes claires pour garantir la réussite de votre projet
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={fadeInUp}
            >
              {[
                { step: '01', title: 'Analyse', desc: 'Étude approfondie de vos besoins et objectifs', icon: Search, color: 'from-[#3ae5ae] to-emerald-500' },
                { step: '02', title: 'Conception', desc: 'Design et architecture de votre solution', icon: Code, color: 'from-blue-500 to-cyan-600' },
                { step: '03', title: 'Développement', desc: 'Réalisation technique et tests qualité', icon: Wrench, color: 'from-green-500 to-emerald-600' },
                { step: '04', title: 'Lancement', desc: 'Mise en ligne et accompagnement continu', icon: Zap, color: 'from-orange-500 to-red-600' }
              ].map((item, idx) => {
                const ProcessIcon = item.icon
                return (
                  <motion.div
                    key={idx}
                    variants={scaleIn}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-[#3ae5ae]/20 bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm group">
                      <CardContent className="pt-10 pb-8 px-6">
                        <div className="mb-6 flex justify-center">
                          <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                            <ProcessIcon className="h-10 w-10 text-white relative z-10" />
                            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-[#3ae5ae] to-emerald-500 bg-clip-text text-transparent mb-3">
                          {item.step}
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-[#0A1128] dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Final Section */}
      <motion.section
        className="py-20 bg-gradient-to-br from-[#3ae5ae]/5 via-emerald-50/30 to-blue-50/30 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.2 }}
      >
        <div className="container max-w-full px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <motion.div
              variants={scaleIn}
            >
              <Card className="relative overflow-hidden border-2 border-[#3ae5ae]/30 bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3ae5ae]/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

                <CardContent className="relative p-0">
                  <div className="grid lg:grid-cols-2 gap-0 items-center">
                    {/* Left side - Content */}
                    <motion.div
                      className="p-8 md:p-12 lg:p-16"
                      variants={fadeInLeft}
                    >
                      <motion.div
                        className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#3ae5ae]/10 px-4 py-2 text-sm font-medium text-[#3ae5ae]"
                        variants={scaleIn}
                      >
                        <Sparkles className="h-4 w-4" />
                        Commencez Maintenant
                      </motion.div>

                      <motion.h2
                        className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-[#0A1128] dark:text-white"
                        variants={fadeInUp}
                      >
                        Prêt à démarrer votre{' '}
                        <span className="bg-gradient-to-r from-[#3ae5ae] to-emerald-500 bg-clip-text text-transparent">projet digital</span> ?
                      </motion.h2>

                      <motion.p
                        className="mb-6 text-lg text-muted-foreground"
                        variants={fadeInUp}
                      >
                        Transformez votre vision en réalité avec Devboostly. Nous vous accompagnons de la conception à la mise en ligne, et même au-delà.
                      </motion.p>

                      <motion.div
                        className="mb-8 space-y-4"
                        variants={fadeInUp}
                      >
                        <motion.div
                          className="flex items-start gap-3"
                          variants={scaleIn}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Devis gratuit en 24h</h4>
                            <p className="text-sm text-muted-foreground">Recevez une estimation détaillée rapidement et sans engagement</p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-start gap-3"
                          variants={scaleIn}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Accompagnement personnalisé</h4>
                            <p className="text-sm text-muted-foreground">Un chef de projet dédié pour répondre à tous vos besoins</p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-start gap-3"
                          variants={scaleIn}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3ae5ae]/20 flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-[#3ae5ae]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#0A1128] dark:text-white mb-1">Support continu</h4>
                            <p className="text-sm text-muted-foreground">Assistance technique 24/7 après le lancement de votre site</p>
                          </div>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        className="flex flex-col sm:flex-row gap-4"
                        variants={fadeInUp}
                      >
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
                      </motion.div>

                      <motion.p
                        className="mt-6 text-sm text-muted-foreground"
                        variants={fadeInUp}
                      >
                        🔒 Vos informations sont 100% sécurisées et confidentielles
                      </motion.p>
                    </motion.div>

                    {/* Right side - Image */}
                    <motion.div
                      className="relative h-full min-h-[400px] lg:min-h-[600px]"
                      variants={fadeInRight}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <img
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                        alt="Équipe collaborant sur un projet digital"
                        className="h-full w-full object-cover rounded-r-lg"
                      />
                      {/* Overlay stats */}
                      <motion.div
                        className="absolute bottom-8 left-8 right-8 z-20"
                        variants={scaleIn}
                        transition={{ delay: 0.4 }}
                      >
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
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes gradient-shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes number-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float-smooth {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-gradient-shimmer {
          animation: gradient-shimmer 3s ease infinite;
        }
        
        .animate-fade-up {
          animation: fade-up 0.8s ease-out;
        }
        
        .animate-number-pulse {
          animation: number-pulse 2s ease-in-out infinite;
        }
        
        .animate-float-smooth {
          animation: float-smooth 6s ease-in-out infinite;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Services