import RegisterForm from '@/components/auth/RegisterForm'
import { Link } from 'react-router-dom'
import { Sparkles, Users, Award, Star, Heart, Zap } from 'lucide-react'

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-[#0A1128] dark:via-[#1a1f3a] dark:to-[#0A1128] relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3ae5ae]/20 dark:bg-[#3ae5ae]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#3ae5ae]/15 dark:bg-[#3ae5ae]/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/2 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left side - Registration Form */}
        <div className="flex items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                Créez votre compte gratuitement
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>

        {/* Right side - Branding & Benefits */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 order-1 lg:order-2">
          {/* Logo & Title */}
          <div className="space-y-4">
            <p className="text-2xl font-semibold text-[#0A1128] dark:text-white">
              Commencez votre transformation digitale
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Créez votre compte en quelques secondes et accédez à tous nos services
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="space-y-4">
            <div className="group p-5 rounded-2xl bg-white/95 dark:bg-[#0A1128]/90 backdrop-blur-sm border border-[#3ae5ae]/30 dark:border-[#3ae5ae]/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3ae5ae] to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] dark:text-white mb-1 text-lg">Démarrage Rapide</h3>
                  <p className="text-sm text-[#0A1128]/70 dark:text-gray-300">Inscription gratuite et accès immédiat à votre espace</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-2xl bg-white/95 dark:bg-[#0A1128]/90 backdrop-blur-sm border border-[#3ae5ae]/30 dark:border-[#3ae5ae]/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3ae5ae] to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] dark:text-white mb-1 text-lg">Support Dédié</h3>
                  <p className="text-sm text-[#0A1128]/70 dark:text-gray-300">Une équipe d'experts à votre écoute 7j/7</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-2xl bg-white/95 dark:bg-[#0A1128]/90 backdrop-blur-sm border border-[#3ae5ae]/30 dark:border-[#3ae5ae]/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3ae5ae] to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] dark:text-white mb-1 text-lg">Qualité Garantie</h3>
                  <p className="text-sm text-[#0A1128]/70 dark:text-gray-300">Des solutions professionnelles certifiées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="pt-6 border-t border-[#3ae5ae]/30 dark:border-[#3ae5ae]/50">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#3ae5ae]" />
                <span className="text-sm font-medium text-[#0A1128] dark:text-white">100% Satisfait</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#3ae5ae]" />
                <span className="text-sm font-medium text-[#0A1128] dark:text-white">5/5 Étoiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3ae5ae]" />
                <span className="text-sm font-medium text-[#0A1128] dark:text-white">1000+ Utilisateurs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register